import { setupCommand } from '../../src/commands/setup.js'
import { readConfig } from '../../src/core/store.js'
import { createGitRepo } from '../helpers/git.js'

describe('setup command', () => {
  test('initializes devmem and configures an OpenAI provider preset', async () => {
    const cwd = await createGitRepo()

    const output = await setupCommand(cwd, {
      provider: 'openai',
      apiKey: 'secret-token',
      model: 'gpt-4o-mini',
    })

    await expect(readConfig(cwd)).resolves.toEqual({
      base_url: 'https://api.openai.com/v1',
      api_key: 'secret-token',
      model: 'gpt-4o-mini',
    })
    expect(output).toContain('devmem is ready')
    expect(output).toContain('devmem start "Describe your task"')
  })

  test('supports custom OpenAI-compatible provider URLs', async () => {
    const cwd = await createGitRepo()

    await setupCommand(cwd, {
      provider: 'custom',
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'secret-token',
      model: 'custom-model',
    })

    await expect(readConfig(cwd)).resolves.toMatchObject({
      base_url: 'https://api.example.com/v1',
      api_key: 'secret-token',
      model: 'custom-model',
    })
  })
})
