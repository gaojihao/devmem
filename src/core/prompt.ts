import type { SavePromptInput } from '../types/session.js'

export function buildSavePrompt(input: SavePromptInput): string {
  return `You are summarizing a local AI coding session.

The user used Claude Code or Codex to work on a Git project.
Your job is to convert the Git changes into project memory.

Return strict JSON only. No markdown. No commentary.

Fields:
- summary: concise summary of what changed
- changed_files: list of important changed files with path, status, additions, deletions when inferable
- decisions: architectural or implementation decisions inferred from changes
- risks: possible bugs, missing tests, edge cases, incomplete work
- todos: concrete next steps
- resume_prompt: a prompt the user can paste into Claude Code or Codex to continue the work

Important:
- Do not invent facts not supported by the diff.
- If something is unclear, say it is unclear.
- Prefer concrete file names and next actions.
- Resume prompt must be directly actionable for Claude Code / Codex.

Session context:
Task: ${input.task}
Branch: ${input.branch}
Base commit: ${input.baseCommit}
Head commit: ${input.headCommit}

Git status:
\`\`\`text
${input.gitStatus}
\`\`\`

Diff stat:
\`\`\`text
${input.diffStat}
\`\`\`

Diff:
\`\`\`diff
${input.diff}
\`\`\``
}
