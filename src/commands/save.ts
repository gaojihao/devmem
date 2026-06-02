import { writeFile } from 'node:fs/promises'
import { DevmemError } from '../core/errors.js'
import { getDiff, getDiffStat, getHeadCommit, getStatusShort } from '../core/git.js'
import { summarizeSession } from '../core/llm.js'
import { renderSessionMarkdown } from '../core/markdown.js'
import { getSessionMarkdownPath } from '../core/paths.js'
import {
  readConfig,
  readCurrent,
  readSession,
  requireInitialized,
  writeCurrent,
  writeSession,
} from '../core/store.js'
import type { DevmemSession, SavePromptInput, SaveSummary } from '../types/session.js'
import { nowIso } from '../utils/time.js'

type SaveDeps = {
  summarize?: (input: SavePromptInput) => Promise<SaveSummary>
}

export async function saveCommand(cwd: string, deps: SaveDeps = {}): Promise<DevmemSession> {
  await requireInitialized(cwd)
  const current = await readCurrent(cwd)
  if (!current.active_session_id) {
    throw new DevmemError('No active session. Run devmem start first.', 'NO_ACTIVE_SESSION')
  }

  const session = await readSession(cwd, current.active_session_id)
  const headCommit = await getHeadCommit(cwd)
  const gitStatus = await getStatusShort(cwd)
  const diffStat = await getDiffStat(cwd)
  const diff = await getDiff(cwd)
  const input: SavePromptInput = {
    task: session.task,
    branch: session.branch,
    baseCommit: session.base_commit,
    headCommit,
    gitStatus,
    diffStat,
    diff,
  }
  const config = await readConfig(cwd)
  const summary = deps.summarize ? await deps.summarize(input) : await summarizeSession(input, config)

  const saved: DevmemSession = {
    ...session,
    status: 'saved',
    saved_at: nowIso(),
    head_commit: headCommit,
    git_status: gitStatus,
    diff_stat: diffStat,
    diff,
    summary: summary.summary,
    changed_files: summary.changed_files,
    decisions: summary.decisions,
    risks: summary.risks,
    todos: summary.todos,
    resume_prompt: summary.resume_prompt,
  }
  await writeSession(cwd, saved)
  await writeFile(getSessionMarkdownPath(cwd, saved.id), renderSessionMarkdown(saved), 'utf8')
  await writeCurrent(cwd, { last_session_id: saved.id })
  return saved
}
