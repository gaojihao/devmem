import { DevmemError } from '../core/errors.js'
import { listSessions, readCurrent, readSession, requireInitialized } from '../core/store.js'

export async function resumeCommand(cwd: string): Promise<string> {
  await requireInitialized(cwd)
  const current = await readCurrent(cwd)
  let session
  if (current.last_session_id) {
    try {
      session = await readSession(cwd, current.last_session_id)
    } catch {
      session = undefined
    }
  }
  if (!session) session = (await listSessions(cwd)).find((item) => item.status === 'saved')
  if (!session || session.status !== 'saved' || !session.resume_prompt) {
    throw new DevmemError('No saved session found.', 'NO_SAVED_SESSION')
  }
  return session.resume_prompt
}
