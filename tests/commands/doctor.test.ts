import { doctorCommand } from '../../src/commands/doctor.js'
import { ensureInitialized, writeConfig } from '../../src/core/store.js'
import { createGitRepo } from '../helpers/git.js'

describe('doctor command', () => {
  test('reports a ready project when git, devmem, and config are available', async () => {
    const cwd = await createGitRepo()
    await ensureInitialized(cwd)
    await writeConfig(cwd, {
      base_url: 'https://api.example.com/v1',
      api_key: 'secret-token',
      model: 'test-model',
    })

    const output = await doctorCommand(cwd)

    expect(output).toContain('devmem doctor')
    expect(output).toContain('✅ Git repository detected')
    expect(output).toContain('✅ devmem initialized')
    expect(output).toContain('✅ API key configured')
    expect(output).toContain('✅ Model configured: test-model')
    expect(output).toContain('Ready to use.')
    expect(output).toContain('devmem start "Your task"')
  })

  test('reports missing setup with concrete fixes', async () => {
    const cwd = await createGitRepo()

    const output = await doctorCommand(cwd)

    expect(output).toContain('✅ Git repository detected')
    expect(output).toContain('❌ devmem not initialized')
    expect(output).toContain('devmem init')
    expect(output).toContain('devmem setup')
  })
})
