import { appendFile } from 'node:fs/promises'
import path from 'node:path'
import {
  getCurrentBranch,
  getDiff,
  getDiffStat,
  getHeadCommit,
  getStatusShort,
  isGitRepository,
} from '../../src/core/git.js'
import { createGitRepo, runGit } from '../helpers/git.js'

describe('git', () => {
  test('detects whether cwd is inside a Git repository', async () => {
    const cwd = await createGitRepo()

    await expect(isGitRepository(cwd)).resolves.toBe(true)
    await expect(isGitRepository(path.dirname(cwd))).resolves.toBe(false)
  })

  test('reads branch, head, status, diff stat, and diff from a real repo', async () => {
    const cwd = await createGitRepo()
    await appendFile(path.join(cwd, 'README.md'), 'hello\n')

    const expectedHead = await runGit(cwd, ['rev-parse', 'HEAD'])

    await expect(getCurrentBranch(cwd)).resolves.toBeTruthy()
    await expect(getHeadCommit(cwd)).resolves.toBe(expectedHead)
    await expect(getStatusShort(cwd)).resolves.toContain('README.md')
    await expect(getDiffStat(cwd)).resolves.toContain('README.md')
    await expect(getDiff(cwd)).resolves.toContain('+hello')
  })
})
