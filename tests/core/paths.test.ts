import path from 'node:path'
import {
  getConfigPath,
  getCurrentPath,
  getMemoryDir,
  getSessionJsonPath,
  getSessionMarkdownPath,
  getSessionsDir,
} from '../../src/core/paths.js'

describe('paths', () => {
  test('constructs devmem paths under the project cwd', () => {
    const cwd = path.join('tmp', 'repo')

    expect(getMemoryDir(cwd)).toBe(path.join(cwd, '.devmem'))
    expect(getConfigPath(cwd)).toBe(path.join(cwd, '.devmem', 'config.json'))
    expect(getCurrentPath(cwd)).toBe(path.join(cwd, '.devmem', 'current.json'))
    expect(getSessionsDir(cwd)).toBe(path.join(cwd, '.devmem', 'sessions'))
    expect(getSessionJsonPath(cwd, 'abc123')).toBe(
      path.join(cwd, '.devmem', 'sessions', 'abc123.json'),
    )
    expect(getSessionMarkdownPath(cwd, 'abc123')).toBe(
      path.join(cwd, '.devmem', 'sessions', 'abc123.md'),
    )
  })
})
