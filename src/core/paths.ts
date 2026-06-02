import path from 'node:path'

export function getMemoryDir(cwd: string): string {
  return path.join(cwd, '.devmem')
}

export function getConfigPath(cwd: string): string {
  return path.join(getMemoryDir(cwd), 'config.json')
}

export function getCurrentPath(cwd: string): string {
  return path.join(getMemoryDir(cwd), 'current.json')
}

export function getSessionsDir(cwd: string): string {
  return path.join(getMemoryDir(cwd), 'sessions')
}

export function getSessionJsonPath(cwd: string, id: string): string {
  return path.join(getSessionsDir(cwd), `${id}.json`)
}

export function getSessionMarkdownPath(cwd: string, id: string): string {
  return path.join(getSessionsDir(cwd), `${id}.md`)
}
