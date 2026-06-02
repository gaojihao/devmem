import { configGetCommand, configSetCommand } from '../../src/commands/config.js'
import { ensureInitialized, readConfig } from '../../src/core/store.js'
import { createGitRepo } from '../helpers/git.js'

describe('config command', () => {
  test('sets and gets supported config values', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)

    await configSetCommand(cwd, 'base_url', 'https://api.example.com/v1')
    await configSetCommand(cwd, 'api_key', 'secret-token')
    await configSetCommand(cwd, 'model', 'test-model')

    await expect(readConfig(cwd)).resolves.toEqual({
      base_url: 'https://api.example.com/v1',
      api_key: 'secret-token',
      model: 'test-model',
    })
    const output = await configGetCommand(cwd)
    expect(output).toContain('base_url: https://api.example.com/v1')
    expect(output).toContain('api_key: ********oken')
    expect(output).toContain('model: test-model')
    expect(output).not.toContain('secret-token')
  })

  test('rejects unsupported config keys', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)

    await expect(configSetCommand(cwd, 'temperature', '1')).rejects.toMatchObject({
      code: 'INVALID_CONFIG_KEY',
    })
  })
})
