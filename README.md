# devmem

Local memory for AI coding sessions.

[中文文档](./README.zh-CN.md)

`devmem` is a local-first CLI tool for developers who use Claude Code, Codex, or other AI coding agents. It records the intent and outcome of each coding session so you can recover context after interruption.

The core problem:

> AI can write code quickly, but project context is easy to lose between sessions.

`devmem` turns Git changes into structured project memory:

- what you were trying to do
- what files changed
- what implementation decisions were made
- what risks or missing tests remain
- what to paste into Claude Code / Codex next time to continue

## Why this exists

AI coding has a different failure mode from traditional coding.

The hard part is often not writing code. The hard part is preserving intent across fragmented sessions:

- Claude Code / Codex sessions get interrupted.
- Context windows are finite.
- You switch projects and forget where you stopped.
- Git diff shows what changed, but not why.
- Commit history is too coarse for unfinished work.
- Chat history is tool-specific and not always easy to reuse.
- The next AI session needs a clean continuation prompt.

`devmem` solves the narrow first problem: local AI coding session memory based on Git.

It does not try to become an IDE, project manager, or cloud knowledge base.

## Design principles

- Local-first: memory is stored in your repository under `.devmem/`.
- Git-based: session memory is generated from task description + Git status + Git diff.
- Tool-agnostic: works with Claude Code, Codex, or any AI coding agent.
- OpenAI-compatible: works with APIs that expose `/chat/completions`.
- Small surface area: CLI first, no UI in v0.1.
- Explicit over magical: you decide when a session starts and when it is saved.

## What devmem does

Typical flow:

```text
start task -> code with AI -> save memory -> resume later
```

Example:

```bash
devmem start "Fix login page crash"

# Use Claude Code or Codex to edit code.
# Inspect, test, and refine as usual.

devmem save

devmem resume
```

`devmem save` reads the current Git diff and asks your configured LLM to produce structured memory.

`devmem resume` prints a continuation prompt that can be pasted directly into Claude Code or Codex.

## What devmem does not do

v0.1 intentionally does not include:

- Web UI
- Electron app
- VS Code extension
- cloud sync
- user accounts
- team collaboration
- GitHub App
- vector search
- database storage
- automatic file watching
- automatic Claude Code / Codex chat log parsing
- MCP integration
- payment or licensing logic

These may be useful later, but they are not the first-principles problem.

The v0.1 goal is simple:

> Can you recover development context after an interrupted AI coding session?

## Installation

### Requirements

- Node.js 20+
- Git
- An OpenAI-compatible chat completions API

### npm install

After the package is published to npm:

```bash
npm install -g @gaojihao/devmem
devmem --help
```

The npm package name is `@gaojihao/devmem`, but the installed command is still `devmem`.

### Development install

Clone the repository and install dependencies:

```bash
git clone git@github.com:gaojihao/devmem.git
cd devmem
pnpm install
pnpm build
pnpm link --global
```

Check the CLI:

```bash
devmem --help
```

If you do not want to link globally, run the built CLI directly:

```bash
node dist/cli.js --help
```

## Quick start

Inside a Git repository:

```bash
devmem init
```

Configure an OpenAI-compatible provider:

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <your-api-key>
devmem config set model gpt-4o-mini
```

Start a session:

```bash
devmem start "Implement order list pagination"
```

Use Claude Code, Codex, or another coding agent to make changes.

Save the session:

```bash
devmem save
```

Resume later:

```bash
devmem resume
```

List previous sessions:

```bash
devmem log
```

Show a specific session:

```bash
devmem show <session-id>
```

## Commands

### devmem init

Initializes devmem in the current Git repository.

```bash
devmem init
```

Creates:

```text
.devmem/
  config.json
  current.json
  sessions/
```

Requirements:

- Must be run inside a Git repository.

Example output:

```text
devmem initialized at .devmem/
```

### devmem config set

Sets local LLM configuration for the current project.

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <your-api-key>
devmem config set model gpt-4o-mini
```

Supported keys:

- `base_url`
- `api_key`
- `model`

Unsupported keys are rejected.

### devmem config get

Prints current config. The API key is masked.

```bash
devmem config get
```

Example:

```text
base_url: https://api.openai.com/v1
api_key: ********abcd
model: gpt-4o-mini
```

### devmem start

Starts an active AI coding session.

```bash
devmem start "Fix login page crash"
```

Records:

- session id
- task
- created time
- current branch
- base commit
- status = `active`

Example output:

```text
Started session: 20260602-153000-a1b2c3
Task: Fix login page crash
```

Only one active session is allowed at a time.

If an active session already exists, run:

```bash
devmem save
```

before starting another one.

### devmem save

Saves the active session.

```bash
devmem save
```

Reads:

- `git status --short`
- `git diff --stat`
- `git diff`
- current HEAD commit

Then calls your configured LLM to generate:

- summary
- changed files
- decisions
- risks
- todos
- resume prompt

Writes:

```text
.devmem/sessions/<session-id>.json
.devmem/sessions/<session-id>.md
```

Example output:

```text
Saved session: 20260602-153000-a1b2c3
Summary: Implemented pagination state and loading behavior for the order list.
```

### devmem resume

Prints the latest saved session's continuation prompt.

```bash
devmem resume
```

The output is designed to be pasted into Claude Code or Codex.

Example shape:

```text
You are continuing an AI coding session.

Previous task:
Fix login page crash

What changed:
- Updated LoginViewModel error handling.
- Added null guard for saved session state.

Risks:
- Crash path needs regression test coverage.

Continue by:
1. Add a regression test for empty saved state.
2. Run the login test suite.
3. Verify no behavior changed for normal login.
```

### devmem log

Lists recent sessions.

```bash
devmem log
```

Example:

```text
20260602-153000-a1b2c3  saved   Fix login page crash
20260602-120000-d4e5f6  saved   Implement order list pagination
```

### devmem show

Shows a specific session.

```bash
devmem show 20260602-153000-a1b2c3
```

Behavior:

- If Markdown exists, prints the Markdown file.
- If Markdown does not exist, prints formatted JSON.

## Data layout

All project-local memory lives under `.devmem/`:

```text
.devmem/
  config.json
  current.json
  sessions/
    20260602-153000-a1b2c3.json
    20260602-153000-a1b2c3.md
```

### config.json

Stores local LLM settings:

```json
{
  "base_url": "https://api.openai.com/v1",
  "api_key": "...",
  "model": "gpt-4o-mini"
}
```

### current.json

Tracks current and latest session ids:

```json
{
  "active_session_id": "20260602-153000-a1b2c3",
  "last_session_id": "20260602-120000-d4e5f6"
}
```

### sessions/*.json

Machine-readable session memory.

Example shape:

```json
{
  "id": "20260602-153000-a1b2c3",
  "task": "Fix login page crash",
  "status": "saved",
  "created_at": "2026-06-02T15:30:00.000Z",
  "saved_at": "2026-06-02T16:00:00.000Z",
  "branch": "master",
  "base_commit": "abc123",
  "head_commit": "def456",
  "summary": "Fixed login page crash caused by missing state guard.",
  "changed_files": [
    {
      "path": "src/login.ts",
      "status": "modified",
      "additions": 12,
      "deletions": 3
    }
  ],
  "decisions": [
    "Kept state validation inside the login view model."
  ],
  "risks": [
    "Regression test coverage may still be incomplete."
  ],
  "todos": [
    "Add a regression test for empty saved state."
  ],
  "resume_prompt": "You are continuing an AI coding session..."
}
```

### sessions/*.md

Human-readable session memory.

Contains:

- task
- status
- branch
- base/head commit
- summary
- changed files
- decisions
- risks
- todos
- resume prompt
- git status
- diff stat

The full diff is kept in JSON, not Markdown, to keep Markdown readable.

## LLM provider configuration

`devmem` uses OpenAI-compatible chat completions:

```text
POST {base_url}/chat/completions
```

The provider must support a request similar to:

```json
{
  "model": "your-model",
  "messages": [
    {
      "role": "user",
      "content": "..."
    }
  ],
  "temperature": 0.2,
  "response_format": {
    "type": "json_object"
  }
}
```

### OpenAI example

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <openai-api-key>
devmem config set model gpt-4o-mini
```

### OpenRouter example

```bash
devmem config set base_url https://openrouter.ai/api/v1
devmem config set api_key <openrouter-api-key>
devmem config set model openai/gpt-4o-mini
```

### Local or self-hosted gateway example

```bash
devmem config set base_url http://localhost:1234/v1
devmem config set api_key local-key
devmem config set model local-model
```

## Privacy and security

`devmem` is local-first, but `devmem save` sends your Git diff to the configured LLM provider.

Important implications:

- `.devmem/` is local project data.
- Your `api_key` is stored in `.devmem/config.json`.
- `git diff` content is sent to your configured `base_url` during `devmem save`.
- Do not run `devmem save` on sensitive code unless you trust the provider.
- `.devmem/` is ignored by this repository's `.gitignore`, but each consuming project should also ignore `.devmem/` if you do not want to commit session memory.

Recommended project `.gitignore` entry:

```text
.devmem/
```

## Development

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Typecheck:

```bash
pnpm typecheck
```

Build:

```bash
pnpm build
```

Run CLI without linking:

```bash
node dist/cli.js --help
```

Or during development:

```bash
pnpm dev -- --help
```

## Verification status

Current v0.1 verification commands:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected status at the time this README was written:

- 12 test files pass
- 24 tests pass
- TypeScript typecheck passes
- tsup build passes

## Troubleshooting

### `devmem requires a Git repository.`

Run `devmem` inside a Git repository.

```bash
git init
```

or move into an existing repo.

### `devmem is not initialized. Run devmem init first.`

Run:

```bash
devmem init
```

### `Active session already exists`

Only one active session is supported in v0.1.

Finish the current one:

```bash
devmem save
```

Then start a new session.

### `No active session. Run devmem start first.`

You ran `devmem save` before starting a session.

Run:

```bash
devmem start "Your task"
```

### `Missing LLM config`

Configure the provider:

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <your-api-key>
devmem config set model gpt-4o-mini
```

### `LLM returned invalid JSON`

The configured model did not return valid JSON.

Try:

- using a stronger model
- using an OpenAI-compatible endpoint that supports JSON mode
- checking whether the provider accepts `response_format: { "type": "json_object" }`

## Roadmap

Possible future directions:

- better provider compatibility
- global config fallback
- encrypted local config
- automatic Git hook integration
- session search
- cross-project memory index
- weekly development summaries
- GitHub issue / PR linking
- team memory mode
- VS Code extension
- desktop UI

None of these are part of v0.1.

## Contributing

This project is currently in early MVP stage.

Before expanding scope, preserve the core loop:

```text
init -> start -> save -> resume -> log
```

Good contributions:

- make the core loop more reliable
- improve provider compatibility
- improve tests
- improve resume prompt quality
- improve docs

Avoid premature complexity:

- no database unless clearly needed
- no cloud dependency for local memory
- no UI before CLI value is proven
- no Claude/Codex log scraping before Git-based memory is validated

## License

MIT. See [LICENSE](./LICENSE).
