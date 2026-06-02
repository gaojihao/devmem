import { mkdir } from 'node:fs/promises'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  ensureInitialized,
  isInitialized,
  listSessions,
  readConfig,
  readCurrent,
  readSession,
  writeConfig,
  writeCurrent,
  writeSession,
} from '../../src/core/store.js'
import type { DevmemSession } from '../../src/types/session.js'

describe('store', () => {
  test('initializes memory directory, config, current, and sessions directory', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'devmem-store-'))

    await expect(isInitialized(cwd)).resolves.toBe(false)
    await ensureInitialized(cwd)

    await expect(isInitialized(cwd)).resolves.toBe(true)
    await expect(readConfig(cwd)).resolves.toEqual({})
    await expect(readCurrent(cwd)).resolves.toEqual({})
  })

  test('does not overwrite existing config or current files during initialization', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'devmem-store-'))
    await ensureInitialized(cwd)
    await writeConfig(cwd, { model: 'test-model' })
    await writeCurrent(cwd, { last_session_id: 'existing' })

    await ensureInitialized(cwd)

    await expect(readConfig(cwd)).resolves.toEqual({ model: 'test-model' })
    await expect(readCurrent(cwd)).resolves.toEqual({ last_session_id: 'existing' })
  })

  test('reads and writes config, current, and sessions', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'devmem-store-'))
    await ensureInitialized(cwd)
    const session: DevmemSession = {
      id: 's1',
      task: 'update README',
      status: 'active',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
    }

    await writeConfig(cwd, { base_url: 'https://example.com', api_key: 'secret' })
    await writeCurrent(cwd, { active_session_id: 's1' })
    await writeSession(cwd, session)

    await expect(readConfig(cwd)).resolves.toEqual({
      base_url: 'https://example.com',
      api_key: 'secret',
    })
    await expect(readCurrent(cwd)).resolves.toEqual({ active_session_id: 's1' })
    await expect(readSession(cwd, 's1')).resolves.toEqual(session)
  })

  test('lists sessions by created_at descending and ignores non-json files', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'devmem-store-'))
    await ensureInitialized(cwd)
    await mkdir(path.join(cwd, '.devmem', 'sessions'), { recursive: true })
    await writeSession(cwd, {
      id: 'old',
      task: 'old',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
    })
    await writeSession(cwd, {
      id: 'new',
      task: 'new',
      status: 'saved',
      created_at: '2026-06-02T01:00:00.000Z',
      branch: 'main',
      base_commit: 'def',
    })

    await expect(listSessions(cwd)).resolves.toMatchObject([{ id: 'new' }, { id: 'old' }])
  })
})
