import { DevmemError } from '../core/errors.js'
import { readConfig, requireInitialized, writeConfig } from '../core/store.js'
import type { DevmemConfig } from '../types/config.js'
import { maskApiKey } from '../utils/output.js'

const validKeys = new Set<keyof DevmemConfig>(['base_url', 'api_key', 'model'])

export async function configSetCommand(
  cwd: string,
  key: string,
  value: string,
): Promise<string> {
  await requireInitialized(cwd)
  if (!validKeys.has(key as keyof DevmemConfig)) {
    throw new DevmemError(`Unsupported config key: ${key}`, 'INVALID_CONFIG_KEY')
  }
  const config = await readConfig(cwd)
  await writeConfig(cwd, { ...config, [key]: value })
  return `Set ${key}`
}

export async function configGetCommand(cwd: string): Promise<string> {
  await requireInitialized(cwd)
  const config = await readConfig(cwd)
  return [
    `base_url: ${config.base_url ?? ''}`,
    `api_key: ${maskApiKey(config.api_key)}`,
    `model: ${config.model ?? ''}`,
  ].join('\n')
}
