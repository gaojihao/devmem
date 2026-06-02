import { buildSavePrompt } from '../../src/core/prompt.js'

describe('prompt', () => {
  test('includes session context and strict JSON safety requirements', () => {
    const prompt = buildSavePrompt({
      task: 'update README',
      branch: 'main',
      baseCommit: 'abc123',
      headCommit: 'def456',
      gitStatus: ' M README.md',
      diffStat: 'README.md | 1 +',
      diff: '+hello',
    })

    expect(prompt).toContain('update README')
    expect(prompt).toContain('main')
    expect(prompt).toContain('+hello')
    expect(prompt).toContain('Return strict JSON only.')
    expect(prompt).toContain('No markdown.')
    expect(prompt).toContain('Do not invent facts')
    expect(prompt).toContain('Resume prompt must be directly actionable')
  })
})
