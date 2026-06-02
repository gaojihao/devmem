export type SessionStatus = 'active' | 'saved'

export type ChangedFile = {
  path: string
  status: string
  additions?: number
  deletions?: number
}

export type DevmemSession = {
  id: string
  task: string
  status: SessionStatus
  created_at: string
  saved_at?: string

  branch: string
  base_commit: string
  head_commit?: string

  git_status?: string
  diff_stat?: string
  diff?: string

  changed_files?: ChangedFile[]

  summary?: string
  decisions?: string[]
  risks?: string[]
  todos?: string[]
  resume_prompt?: string
  raw_llm_output?: string
}

export type SaveSummary = {
  summary: string
  changed_files: ChangedFile[]
  decisions: string[]
  risks: string[]
  todos: string[]
  resume_prompt: string
}

export type SavePromptInput = {
  task: string
  branch: string
  baseCommit: string
  headCommit: string
  gitStatus: string
  diffStat: string
  diff: string
}
