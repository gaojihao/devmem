import { listSessions, requireInitialized } from '../core/store.js'

export async function logCommand(cwd: string): Promise<string> {
  await requireInitialized(cwd)
  const sessions = (await listSessions(cwd)).slice(0, 20)
  if (sessions.length === 0) return 'No sessions found.'
  return sessions.map((session) => `${session.id}  ${session.status}  ${session.task}`).join('\n')
}
