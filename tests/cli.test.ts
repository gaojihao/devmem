import { execa } from 'execa'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repoRoot = new URL('..', import.meta.url).pathname
const cliPath = new URL('../src/cli.ts', import.meta.url).pathname
const tsxPath = new URL('../node_modules/.bin/tsx', import.meta.url).pathname

async function packageVersion(): Promise<string> {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
    version: string
  }
  return packageJson.version
}

describe('cli', () => {
  test('prints the package version', async () => {
    const expectedVersion = await packageVersion()

    const result = await execa(tsxPath, [cliPath, '--version'], { cwd: repoRoot })

    expect(result.stdout).toBe(expectedVersion)
  })

  test('prints a fix suggestion for uninitialized projects', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'devmem-cli-'))

    const result = await execa(tsxPath, [cliPath, 'log'], { cwd, reject: false })

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('devmem is not initialized in this project.')
    expect(result.stderr).toContain('Fix:')
    expect(result.stderr).toContain('devmem init')
  })
})
