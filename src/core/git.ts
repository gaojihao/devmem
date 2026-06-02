import { execa } from 'execa'
import { DevmemError } from './errors.js'

async function git(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execa('git', args, { cwd })
    return stdout.trimEnd()
  } catch (error) {
    throw new DevmemError(`Git command failed: git ${args.join(' ')}`, 'GIT_COMMAND_FAILED')
  }
}

export async function isGitRepository(cwd: string): Promise<boolean> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--is-inside-work-tree'], { cwd })
    return stdout.trim() === 'true'
  } catch {
    return false
  }
}

export async function getCurrentBranch(cwd: string): Promise<string> {
  const branch = await git(cwd, ['branch', '--show-current'])
  return branch || 'HEAD'
}

export async function getHeadCommit(cwd: string): Promise<string> {
  return git(cwd, ['rev-parse', 'HEAD'])
}

export async function getStatusShort(cwd: string): Promise<string> {
  return git(cwd, ['status', '--short'])
}

export async function getDiffStat(cwd: string): Promise<string> {
  return git(cwd, ['diff', '--stat'])
}

export async function getDiff(cwd: string): Promise<string> {
  return git(cwd, ['diff'])
}
