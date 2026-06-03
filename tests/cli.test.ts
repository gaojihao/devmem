import { execa } from 'execa'
import { readFile } from 'node:fs/promises'

async function packageVersion(): Promise<string> {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
    version: string
  }
  return packageJson.version
}

describe('cli', () => {
  test('prints the package version', async () => {
    const expectedVersion = await packageVersion()

    const result = await execa('tsx', ['src/cli.ts', '--version'])

    expect(result.stdout).toBe(expectedVersion)
  })
})
