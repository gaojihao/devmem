import { execa } from 'execa'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runGit } from './helpers/git.js'

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

  test('prints next steps after init and start', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'devmem-cli-'))
    await runGit(cwd, ['init'])
    await runGit(cwd, ['config', 'user.email', 'devmem@example.com'])
    await runGit(cwd, ['config', 'user.name', 'Devmem Test'])
    await execa('git', ['commit', '--allow-empty', '-m', 'init'], { cwd })

    const init = await execa(tsxPath, [cliPath, 'init'], { cwd })
    expect(init.stdout).toContain('✅ devmem initialized')
    expect(init.stdout).toContain('Next:')
    expect(init.stdout).toContain('devmem setup')

    const start = await execa(tsxPath, [cliPath, 'start', 'Improve onboarding'], { cwd })
    expect(start.stdout).toContain('✅ Started session:')
    expect(start.stdout).toContain('Now code as usual')
    expect(start.stdout).toContain('devmem save')
  })
})
