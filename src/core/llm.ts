import { z } from 'zod'
import type { DevmemConfig } from '../types/config.js'
import type { SavePromptInput, SaveSummary } from '../types/session.js'
import { DevmemError } from './errors.js'
import { buildSavePrompt } from './prompt.js'

const saveSummarySchema = z.object({
  summary: z.string(),
  changed_files: z.array(
    z.object({
      path: z.string(),
      status: z.string(),
      additions: z.number().optional(),
      deletions: z.number().optional(),
    }),
  ),
  decisions: z.array(z.string()),
  risks: z.array(z.string()),
  todos: z.array(z.string()),
  resume_prompt: z.string(),
})

export async function summarizeSession(
  input: SavePromptInput,
  config: DevmemConfig,
): Promise<SaveSummary> {
  if (!config.base_url || !config.api_key || !config.model) {
    throw new DevmemError(
      'Missing LLM config. Run devmem config set base_url <url>, api_key <key>, and model <model>.',
      'MISSING_LLM_CONFIG',
    )
  }

  const baseUrl = config.base_url.replace(/\/$/, '')
  let response: Response
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: buildSavePrompt(input),
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })
  } catch (error) {
    throw new DevmemError('LLM request failed.', 'LLM_REQUEST_FAILED')
  }

  if (!response.ok) {
    throw new DevmemError(`LLM request failed with status ${response.status}.`, 'LLM_REQUEST_FAILED')
  }

  const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = body.choices?.[0]?.message?.content
  if (!content) throw new DevmemError('LLM returned empty content.', 'LLM_INVALID_JSON')

  try {
    return saveSummarySchema.parse(JSON.parse(content))
  } catch {
    throw new DevmemError('LLM returned invalid JSON.', 'LLM_INVALID_JSON')
  }
}
