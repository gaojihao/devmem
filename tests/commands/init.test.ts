import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { initCommand } from '../../src/commands/init.js'
import { createGitRepo } from '../helpers/git.js'

describe('init command', () => {
  test('initializes the current Git project', async () => {
    const cwd = await createGitRepo()

    await initCommand(cwd)

    await expect(readFile(path.join(cwd, '.devmem', 'config.json'), 'utf8')).resolves.toBe(
      '{}\n',
    )
    await expect(readFile(path.join(cwd, '.devmem', 'current.json'), 'utf8')).resolves.toBe(
      '{}\n',
    )
  })

  test('requires a Git repository', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'devmem-no-git-'))

    await expect(initCommand(cwd)).rejects.toMatchObject({
      message: 'devmem requires a Git repository.',
      code: 'NOT_GIT_REPO',
    })
  })
})
