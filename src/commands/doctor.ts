import { isGitRepository } from '../core/git.js'
import { isInitialized, readConfig } from '../core/store.js'

export async function doctorCommand(cwd: string): Promise<string> {
  const lines = ['devmem doctor', '']
  let ready = true

  const gitOk = await isGitRepository(cwd)
  if (gitOk) lines.push('✅ Git repository detected')
  else {
    lines.push('❌ Not a Git repository')
    lines.push('   Fix: move into a Git project, or run git init first.')
    ready = false
  }

  const initialized = await isInitialized(cwd)
  if (initialized) lines.push('✅ devmem initialized')
  else {
    lines.push('❌ devmem not initialized')
    lines.push('   Fix: run devmem init')
    ready = false
  }

  if (initialized) {
    const config = await readConfig(cwd)
    if (config.base_url) lines.push(`✅ Provider URL configured: ${config.base_url}`)
    else {
      lines.push('❌ Provider URL missing')
      lines.push('   Fix: run devmem config set base_url <url>')
      ready = false
    }

    if (config.api_key) lines.push('✅ API key configured')
    else {
      lines.push('❌ API key missing')
      lines.push('   Fix: run devmem config set api_key <key>')
      ready = false
    }

    if (config.model) lines.push(`✅ Model configured: ${config.model}`)
    else {
      lines.push('❌ Model missing')
      lines.push('   Fix: run devmem config set model <model>')
      ready = false
    }
  }

  lines.push('')
  if (ready) {
    lines.push('Ready to use.', '')
    lines.push('Next:')
    lines.push('  devmem start "Your task"')
  } else {
    lines.push('Run devmem setup for guided configuration.')
  }

  return lines.join('\n')
}
