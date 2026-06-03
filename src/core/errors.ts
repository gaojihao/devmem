export class DevmemError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DevmemError'
  }
}

const fixes: Record<string, string> = {
  NOT_INITIALIZED: 'Run devmem init in this Git project.',
  NOT_GIT_REPO: 'Move into a Git project, or run git init first.',
  NO_ACTIVE_SESSION: 'Start a session with devmem start "Describe your task".',
  ACTIVE_SESSION_EXISTS: 'Save the current session with devmem save before starting another one.',
  NO_SAVED_SESSION: 'Save a session first with devmem save.',
  MISSING_LLM_CONFIG: 'Run devmem setup, or configure base_url, api_key, and model manually.',
  INVALID_CONFIG_KEY: 'Use one of: base_url, api_key, model.',
  LLM_REQUEST_FAILED: 'Check devmem config get, your API key, base_url, and model name.',
  LLM_INVALID_JSON: 'Try again, or use a model that supports JSON responses.',
  SESSION_NOT_FOUND: 'Run devmem log to see available session IDs.',
  TASK_REQUIRED: 'Pass a task, for example: devmem start "Fix login bug".',
  GIT_COMMAND_FAILED: 'Check that Git works in this project, then retry.',
}

const friendlyMessages: Record<string, string> = {
  NOT_INITIALIZED: 'devmem is not initialized in this project.',
  NOT_GIT_REPO: 'This directory is not a Git repository.',
}

export function formatError(error: unknown): string {
  if (!(error instanceof DevmemError)) return error instanceof Error ? error.message : String(error)

  const title = error.code ? friendlyMessages[error.code] ?? error.message : error.message
  const fix = error.code ? fixes[error.code] : undefined
  if (!fix) return title

  return `${title}

Fix:
  ${fix}`
}
