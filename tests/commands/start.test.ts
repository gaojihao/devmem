import { startCommand } from '../../src/commands/start.js'
import { ensureInitialized, readCurrent, readSession } from '../../src/core/store.js'
import { createGitRepo } from '../helpers/git.js'

describe('start command', () => {
  test('creates an active session', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    const session = await startCommand(cwd, 'update README')

    expect(session).toMatchObject({
      task: 'update README',
      status: 'active',
    })
    expect(session.id).toBeTruthy()
    await expect(readCurrent(cwd)).resolves.toEqual({ active_session_id: session.id })
    await expect(readSession(cwd, session.id)).resolves.toMatchObject({
      id: session.id,
      task: 'update README',
      status: 'active',
    })
  })

  test('rejects when an active session already exists', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await startCommand(cwd, 'first task')

    await expect(startCommand(cwd, 'second task')).rejects.toMatchObject({
      code: 'ACTIVE_SESSION_EXISTS',
    })
  })
})
