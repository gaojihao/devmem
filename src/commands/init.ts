import { ensureInitialized } from '../core/store.js'
import { isGitRepository } from '../core/git.js'
import { DevmemError } from '../core/errors.js'

export async function initCommand(cwd: string): Promise<string> {
  if (!(await isGitRepository(cwd))) {
    throw new DevmemError('devmem requires a Git repository.', 'NOT_GIT_REPO')
  }
  await ensureInitialized(cwd)
  return 'devmem initialized at .devmem/'
}
