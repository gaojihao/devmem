import { appendFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { saveCommand } from '../../src/commands/save.js'
import { ensureInitialized, readCurrent, readSession, writeConfig } from '../../src/core/store.js'
import type { SaveSummary } from '../../src/types/session.js'
import { createGitRepo } from '../helpers/git.js'
import { startCommand } from '../../src/commands/start.js'

describe('save command', () => {
  test('rejects when no active session exists', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)

    await expect(saveCommand(cwd)).rejects.toMatchObject({
      code: 'NO_ACTIVE_SESSION',
    })
  })

  test('saves active session, writes markdown, and updates current', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeConfig(cwd, {
      base_url: 'https://api.example.com/v1',
      api_key: 'secret',
      model: 'model',
    })
    const active = await startCommand(cwd, 'update README')
    await appendFile(path.join(cwd, 'README.md'), 'hello\n')
    const summary: SaveSummary = {
      summary: 'README now includes hello.',
      changed_files: [{ path: 'README.md', status: 'modified', additions: 1 }],
      decisions: ['Kept README simple'],
      risks: ['No risks identified'],
      todos: ['Run build'],
      resume_prompt: 'Continue by running build.',
    }

    const saved = await saveCommand(cwd, {
      summarize: async (input) => {
        expect(input.task).toBe('update README')
        expect(input.diff).toContain('+hello')
        return summary
      },
    })

    expect(saved).toMatchObject({
      id: active.id,
      status: 'saved',
      summary: summary.summary,
      resume_prompt: summary.resume_prompt,
    })
    await expect(readCurrent(cwd)).resolves.toEqual({ last_session_id: active.id })
    await expect(readSession(cwd, active.id)).resolves.toMatchObject({ status: 'saved' })
    await expect(
      readFile(path.join(cwd, '.devmem', 'sessions', `${active.id}.md`), 'utf8'),
    ).resolves.toContain('README now includes hello.')
  })
})
