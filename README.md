# devmem

[中文文档](./README.zh-CN.md)

Local memory for AI coding sessions.

`devmem` helps you save the development context of a Claude Code, Codex, or other AI coding session, then generate a clean prompt for resuming the work later.

The core idea is simple:

```text
your task + git status + git diff -> session memory -> resume prompt
```

## Why devmem is useful

AI coding sessions are powerful, but the working context is fragile.

Common problems:

- You stop in the middle of a feature and forget the exact state later.
- Claude Code or Codex loses context after a long session.
- You switch machines, terminals, branches, or tools.
- You know code changed, but not the exact intent behind each change.
- You need to tell the next AI agent what happened without pasting a huge diff manually.

`devmem` turns the current Git state into a compact, reusable project memory.

It gives you:

- a summary of what changed
- important decisions made during the session
- risks and unfinished work
- changed files
- a resume prompt you can paste into Claude Code, Codex, or another AI coding tool

## Installation

### Install from npm

```bash
npm install -g @gaojihao/devmem
```

Check the CLI:

```bash
devmem --help
```

### Install from source

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

Requirements for source installation:

- Node.js 20+
- pnpm
- Git

## Quick start

Go to any Git project:

```bash
cd your-project
```

Initialize devmem:

```bash
devmem init
```

Configure an OpenAI-compatible model:

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key YOUR_API_KEY
devmem config set model gpt-4o-mini
```

Start a coding session:

```bash
devmem start "Add user profile settings page"
```

Work normally with Claude Code, Codex, your editor, or terminal.

When you reach a stopping point, save the session:

```bash
devmem save
```

Later, resume the work:

```bash
devmem resume
```

Paste the generated prompt into Claude Code, Codex, or another AI coding agent.

## Typical workflow

```bash
# 1. Initialize once per Git project
devmem init

# 2. Configure your model once
devmem config set base_url https://api.openai.com/v1
devmem config set api_key YOUR_API_KEY
devmem config set model gpt-4o-mini

# 3. Start a session before using AI coding tools
devmem start "Refactor auth middleware"

# 4. Code with Claude Code / Codex / your editor

# 5. Save the session memory
devmem save

# 6. Resume later
devmem resume
```

## Commands

### `devmem init`

Initialize devmem in the current Git project.

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

### `devmem config set <key> <value>`

Configure the LLM provider.

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key YOUR_API_KEY
devmem config set model gpt-4o-mini
```

Supported keys:

- `base_url`
- `api_key`
- `model`

### `devmem config get`

Show the current configuration.

```bash
devmem config get
```

The API key is masked in output.

### `devmem start <task>`

Start a new AI coding session.

```bash
devmem start "Fix checkout payment bug"
```

This records:

- task description
- current branch
- base commit
- start time

### `devmem save`

Save the current session.

```bash
devmem save
```

This reads the current Git state, asks the configured model to summarize it, and writes session files under `.devmem/sessions/`.

### `devmem resume`

Print the latest resume prompt.

```bash
devmem resume
```

Use this when you want to continue a previous AI coding session.

### `devmem log`

List recent saved sessions.

```bash
devmem log
```

### `devmem show <session-id>`

Show a saved session.

```bash
devmem show 20260603-abc123
```

## Example resume prompt

`devmem resume` outputs a prompt like this:

```text
You are continuing a coding task in this repository.

Task:
Add user profile settings page

Current state:
- Added profile settings route
- Implemented form layout
- Added basic validation

Changed files:
- src/pages/settings.tsx
- src/components/ProfileForm.tsx

Risks:
- Validation logic still needs edge case coverage

Next steps:
1. Add tests for validation errors
2. Connect form submit to API
3. Run the full test suite
```

You can paste it directly into Claude Code, Codex, or another AI coding agent.

## Data storage

`devmem` stores project-local memory under `.devmem/`:

```text
.devmem/
  config.json
  current.json
  sessions/
    <session-id>.json
    <session-id>.md
```

Recommended `.gitignore` entry:

```gitignore
.devmem/
```

## LLM provider

`devmem` uses an OpenAI-compatible Chat Completions API.

Examples:

```bash
# OpenAI
devmem config set base_url https://api.openai.com/v1
devmem config set model gpt-4o-mini

# OpenRouter
devmem config set base_url https://openrouter.ai/api/v1
devmem config set model openai/gpt-4o-mini

# Local gateway
devmem config set base_url http://localhost:11434/v1
devmem config set model qwen2.5-coder
```

Then set your API key:

```bash
devmem config set api_key YOUR_API_KEY
```

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

Run the built CLI directly:

```bash
node dist/cli.js --help
```

## License

MIT. See [LICENSE](./LICENSE).
