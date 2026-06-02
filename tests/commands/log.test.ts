import { logCommand } from '../../src/commands/log.js'
import { ensureInitialized, writeSession } from '../../src/core/store.js'
import { createGitRepo } from '../helpers/git.js'

describe('log command', () => {
  test('lists recent sessions by created_at descending', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeSession(cwd, {
      id: 'old',
      task: 'old task',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
    })
    await writeSession(cwd, {
      id: 'new',
      task: 'new task',
      status: 'active',
      created_at: '2026-06-02T01:00:00.000Z',
      branch: 'main',
      base_commit: 'def',
    })

    const output = await logCommand(cwd)
    const lines = output.split('\n')

    expect(lines[0]).toBe('new  active  new task')
    expect(lines[1]).toBe('old  saved  old task')
  })
})
