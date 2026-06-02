import { renderSessionMarkdown } from '../../src/core/markdown.js'
import type { DevmemSession } from '../../src/types/session.js'

describe('markdown', () => {
  test('renders summary, todos, and resume prompt', () => {
    const session: DevmemSession = {
      id: 's1',
      task: 'update README',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      saved_at: '2026-06-01T02:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
      head_commit: 'def',
      summary: 'README was updated.',
      todos: ['Run tests'],
      resume_prompt: 'Continue by running tests.',
      decisions: ['Kept scope small'],
      risks: ['No test yet'],
      changed_files: [{ path: 'README.md', status: 'modified', additions: 1 }],
      git_status: ' M README.md',
      diff_stat: 'README.md | 1 +',
    }

    const markdown = renderSessionMarkdown(session)

    expect(markdown).toContain('## Summary')
    expect(markdown).toContain('README was updated.')
    expect(markdown).toContain('## Todos')
    expect(markdown).toContain('- Run tests')
    expect(markdown).toContain('## Resume Prompt')
    expect(markdown).toContain('Continue by running tests.')
    expect(markdown).not.toContain('diff --git')
  })

  test('renders empty arrays without crashing', () => {
    const session: DevmemSession = {
      id: 's1',
      task: 'update README',
      status: 'saved',
      created_at: '2026-06-01T01:00:00.000Z',
      branch: 'main',
      base_commit: 'abc',
      decisions: [],
      risks: [],
      todos: [],
      changed_files: [],
    }

    expect(renderSessionMarkdown(session)).toContain('_None_')
  })
})
