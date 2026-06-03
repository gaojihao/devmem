import { DevmemError } from '../core/errors.js'
import { isGitRepository } from '../core/git.js'
import { ensureInitialized, writeConfig } from '../core/store.js'

export type SetupProvider = 'openai' | 'openrouter' | 'deepseek' | 'ollama' | 'custom'

type SetupOptions = {
  provider: SetupProvider
  baseUrl?: string
  apiKey: string
  model: string
}

const providerBaseUrls: Record<Exclude<SetupProvider, 'custom'>, string> = {
  openai: 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  deepseek: 'https://api.deepseek.com/v1',
  ollama: 'http://localhost:11434/v1',
}

export async function setupCommand(cwd: string, options: SetupOptions): Promise<string> {
  if (!(await isGitRepository(cwd))) {
    throw new DevmemError('devmem requires a Git repository.', 'NOT_GIT_REPO')
  }

  const baseUrl = options.provider === 'custom' ? options.baseUrl : providerBaseUrls[options.provider]
  if (!baseUrl) throw new DevmemError('Custom provider requires a base URL.', 'MISSING_LLM_CONFIG')
  if (!options.apiKey) throw new DevmemError('API key is required.', 'MISSING_LLM_CONFIG')
  if (!options.model) throw new DevmemError('Model is required.', 'MISSING_LLM_CONFIG')

  await ensureInitialized(cwd)
  await writeConfig(cwd, {
    base_url: baseUrl,
    api_key: options.apiKey,
    model: options.model,
  })

  return `✅ devmem is ready.

Provider: ${options.provider}
Model: ${options.model}

Next:
  devmem start "Describe your task"
  # code with Claude Code / Codex
  devmem save
  devmem resume`
}
