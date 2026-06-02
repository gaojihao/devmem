import { afterEach, vi } from 'vitest'
import { summarizeSession } from '../../src/core/llm.js'

const input = {
  task: 'update README',
  branch: 'main',
  baseCommit: 'abc',
  headCommit: 'def',
  gitStatus: ' M README.md',
  diffStat: 'README.md | 1 +',
  diff: '+hello',
}

describe('llm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('validates required LLM config', async () => {
    await expect(summarizeSession(input, {})).rejects.toMatchObject({
      code: 'MISSING_LLM_CONFIG',
    })
  })

  test('calls OpenAI-compatible chat completions and parses JSON content', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
      void url
      void init
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'README updated.',
                  changed_files: [{ path: 'README.md', status: 'modified', additions: 1 }],
                  decisions: ['Kept it simple'],
                  risks: [],
                  todos: ['Run tests'],
                  resume_prompt: 'Continue with tests.',
                }),
              },
            },
          ],
        }),
        { status: 200 },
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await summarizeSession(input, {
      base_url: 'https://api.example.com/v1/',
      api_key: 'secret',
      model: 'test-model',
    })

    expect(result.summary).toBe('README updated.')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/v1/chat/completions')
    expect(init?.headers).toMatchObject({
      Authorization: 'Bearer secret',
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: 'test-model',
      messages: [{ role: 'user' }],
      response_format: { type: 'json_object' },
    })
  })

  test('rejects invalid JSON returned by the LLM', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: 'not json' } }],
          }),
          { status: 200 },
        )
      }),
    )

    await expect(
      summarizeSession(input, {
        base_url: 'https://api.example.com/v1',
        api_key: 'secret',
        model: 'test-model',
      }),
    ).rejects.toMatchObject({
      code: 'LLM_INVALID_JSON',
    })
  })
})
