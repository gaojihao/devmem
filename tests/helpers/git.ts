import { execFile } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export async function runGit(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd })
  return stdout.trim()
}

export async function createGitRepo(): Promise<string> {
  const cwd = await mkdtemp(path.join(tmpdir(), 'devmem-test-'))
  await runGit(cwd, ['init'])
  await runGit(cwd, ['config', 'user.email', 'devmem@example.com'])
  await runGit(cwd, ['config', 'user.name', 'Devmem Test'])
  await writeFile(path.join(cwd, 'README.md'), '# demo\n')
  await runGit(cwd, ['add', 'README.md'])
  await runGit(cwd, ['commit', '-m', 'init'])
  return cwd
}
