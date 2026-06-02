import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { showCommand } from '../../src/commands/show.js'
import { ensureInitialized, writeSession } from '../../src/core/store.js'
import { createGitRepo } from '../helpers/git.js'

describe('show command', () => {
  test('prints session markdown when a markdown file exists', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeSession(cwd, {
      id: 's1',
      task: 'update README',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
    })
    await writeFile(path.join(cwd, '.devmem', 'sessions', 's1.md'), '# Session s1\n', 'utf8')

    await expect(showCommand(cwd, 's1')).resolves.toBe('# Session s1\n')
  })

  test('falls back to formatted JSON when markdown does not exist', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeSession(cwd, {
      id: 's1',
      task: 'update README',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
    })

    const output = await showCommand(cwd, 's1')

    expect(JSON.parse(output)).toMatchObject({
      id: 's1',
      task: 'update README',
      status: 'saved',
    })
  })

  test('rejects when the session does not exist', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)

    await expect(showCommand(cwd, 'missing')).rejects.toMatchObject({
      code: 'SESSION_NOT_FOUND',
    })
  })
})
