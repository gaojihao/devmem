import { nanoid } from 'nanoid'
import { getCurrentBranch, getHeadCommit } from '../core/git.js'
import { DevmemError } from '../core/errors.js'
import { readCurrent, requireInitialized, writeCurrent, writeSession } from '../core/store.js'
import type { DevmemSession } from '../types/session.js'
import { nowIso, timestampIdPart } from '../utils/time.js'

export async function startCommand(cwd: string, task: string): Promise<DevmemSession> {
  await requireInitialized(cwd)
  if (!task || !task.trim()) throw new DevmemError('Task is required.', 'TASK_REQUIRED')
  const current = await readCurrent(cwd)
  if (current.active_session_id) {
    throw new DevmemError(
      `Active session already exists: ${current.active_session_id}
Run devmem save first.`,
      'ACTIVE_SESSION_EXISTS',
    )
  }

  const session: DevmemSession = {
    id: `${timestampIdPart()}-${nanoid(6)}`,
    task: task.trim(),
    status: 'active',
    created_at: nowIso(),
    branch: await getCurrentBranch(cwd),
    base_commit: await getHeadCommit(cwd),
  }
  await writeSession(cwd, session)
  await writeCurrent(cwd, { ...current, active_session_id: session.id })
  return session
}
