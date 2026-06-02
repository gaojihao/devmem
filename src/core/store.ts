import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import {
  getConfigPath,
  getCurrentPath,
  getMemoryDir,
  getSessionJsonPath,
  getSessionsDir,
} from './paths.js'
import type { CurrentSession, DevmemConfig } from '../types/config.js'
import type { DevmemSession } from '../types/session.js'
import { DevmemError } from './errors.js'

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}
`, 'utf8')
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

export async function ensureInitialized(cwd: string): Promise<void> {
  await mkdir(getSessionsDir(cwd), { recursive: true })
  if (!existsSync(getConfigPath(cwd))) await writeJson(getConfigPath(cwd), {})
  if (!existsSync(getCurrentPath(cwd))) await writeJson(getCurrentPath(cwd), {})
}

export async function isInitialized(cwd: string): Promise<boolean> {
  return existsSync(getMemoryDir(cwd)) && existsSync(getConfigPath(cwd)) && existsSync(getCurrentPath(cwd)) && existsSync(getSessionsDir(cwd))
}

export async function requireInitialized(cwd: string): Promise<void> {
  if (!(await isInitialized(cwd))) {
    throw new DevmemError('devmem is not initialized. Run devmem init first.', 'NOT_INITIALIZED')
  }
}

export async function readConfig(cwd: string): Promise<DevmemConfig> {
  return readJson<DevmemConfig>(getConfigPath(cwd))
}

export async function writeConfig(cwd: string, config: DevmemConfig): Promise<void> {
  await writeJson(getConfigPath(cwd), config)
}

export async function readCurrent(cwd: string): Promise<CurrentSession> {
  return readJson<CurrentSession>(getCurrentPath(cwd))
}

export async function writeCurrent(cwd: string, current: CurrentSession): Promise<void> {
  await writeJson(getCurrentPath(cwd), current)
}

export async function readSession(cwd: string, id: string): Promise<DevmemSession> {
  return readJson<DevmemSession>(getSessionJsonPath(cwd, id))
}

export async function writeSession(cwd: string, session: DevmemSession): Promise<void> {
  await writeJson(getSessionJsonPath(cwd, session.id), session)
}

export async function listSessions(cwd: string): Promise<DevmemSession[]> {
  const dir = getSessionsDir(cwd)
  if (!existsSync(dir)) return []
  const files = await readdir(dir)
  const sessions: DevmemSession[] = []
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    try {
      sessions.push(await readJson<DevmemSession>(`${dir}/${file}`))
    } catch {
      // Ignore malformed session files in v0.1.
    }
  }
  return sessions.sort((a, b) => b.created_at.localeCompare(a.created_at))
}
