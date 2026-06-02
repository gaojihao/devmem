import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { DevmemError } from '../core/errors.js'
import { getSessionMarkdownPath } from '../core/paths.js'
import { readSession, requireInitialized } from '../core/store.js'

export async function showCommand(cwd: string, id: string): Promise<string> {
  await requireInitialized(cwd)
  const mdPath = getSessionMarkdownPath(cwd, id)
  if (existsSync(mdPath)) return readFile(mdPath, 'utf8')
  try {
    return JSON.stringify(await readSession(cwd, id), null, 2)
  } catch {
    throw new DevmemError(`Session not found: ${id}`, 'SESSION_NOT_FOUND')
  }
}
