import type { ChangedFile, DevmemSession } from '../types/session.js'

function list(items?: string[]): string {
  if (!items || items.length === 0) return '_None_'
  return items.map((item) => `- ${item}`).join('\n')
}

function changedFiles(files?: ChangedFile[]): string {
  if (!files || files.length === 0) return '_None_'
  return files
    .map((file) => {
      const lines = [`- ${file.path}`, `  - status: ${file.status}`]
      if (file.additions !== undefined) lines.push(`  - additions: ${file.additions}`)
      if (file.deletions !== undefined) lines.push(`  - deletions: ${file.deletions}`)
      return lines.join('\n')
    })
    .join('\n')
}

export function renderSessionMarkdown(session: DevmemSession): string {
  return `# Devmem Session: ${session.id}

Task:
${session.task}

Status:
${session.status}

Branch:
${session.branch}

Base Commit:
${session.base_commit}

Head Commit:
${session.head_commit ?? '_None_'}

Created:
${session.created_at}

Saved:
${session.saved_at ?? '_None_'}

## Summary

${session.summary ?? '_None_'}

## Changed Files

${changedFiles(session.changed_files)}

## Decisions

${list(session.decisions)}

## Risks

${list(session.risks)}

## Todos

${list(session.todos)}

## Resume Prompt

\`\`\`text
${session.resume_prompt ?? ''}
\`\`\`

## Git Status

\`\`\`text
${session.git_status ?? ''}
\`\`\`

## Diff Stat

\`\`\`text
${session.diff_stat ?? ''}
\`\`\`
`
}
