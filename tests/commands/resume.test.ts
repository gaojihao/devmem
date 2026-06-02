import { resumeCommand } from '../../src/commands/resume.js'
import { ensureInitialized, writeCurrent, writeSession } from '../../src/core/store.js'
import { createGitRepo } from '../helpers/git.js'

describe('resume command', () => {
  test('outputs the last saved session resume prompt', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeSession(cwd, {
      id: 's1',
      task: 'update README',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
      resume_prompt: 'Continue updating README.',
    })
    await writeCurrent(cwd, { last_session_id: 's1' })

    await expect(resumeCommand(cwd)).resolves.toBe('Continue updating README.')
  })

  test('falls back to the latest saved session when current has no last_session_id', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeSession(cwd, {
      id: 'old',
      task: 'old task',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
      resume_prompt: 'Continue old task.',
    })
    await writeSession(cwd, {
      id: 'new',
      task: 'new task',
      status: 'saved',
      created_at: '2026-06-02T01:00:00.000Z',
      branch: 'main',
      base_commit: 'def',
      resume_prompt: 'Continue new task.',
    })

    await expect(resumeCommand(cwd)).resolves.toBe('Continue new task.')
  })

  test('falls back to the latest saved session when last_session_id points to a missing session', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeCurrent(cwd, { last_session_id: 'missing' })
    await writeSession(cwd, {
      id: 'available',
      task: 'available task',
      status: 'saved',
      created_at: '2026-06-02T01:00:00.000Z',
      branch: 'main',
      base_commit: 'def',
      resume_prompt: 'Continue available task.',
    })

    await expect(resumeCommand(cwd)).resolves.toBe('Continue available task.')
  })

  test('rejects when no saved session exists', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)

    await expect(resumeCommand(cwd)).rejects.toMatchObject({
      code: 'NO_SAVED_SESSION',
    })
  })
})
