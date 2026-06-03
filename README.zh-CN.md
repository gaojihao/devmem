# devmem

[![npm version](https://img.shields.io/npm/v/@gaojihao/devmem.svg)](https://www.npmjs.com/package/@gaojihao/devmem)
[![npm downloads](https://img.shields.io/npm/dm/@gaojihao/devmem.svg)](https://www.npmjs.com/package/@gaojihao/devmem)
[![license](https://img.shields.io/npm/l/@gaojihao/devmem.svg)](./LICENSE)

[English](./README.md)

AI 编程会话的本地记忆工具。

`devmem` 用来保存 Claude Code、Codex 或其他 AI Coding 会话中的开发上下文，并生成一个干净的恢复 prompt，方便你之后继续开发。

核心逻辑很简单：

```text
你的任务 + git status + git diff -> 会话记忆 -> 恢复 prompt
```

## devmem 的价值

AI Coding 很强，但上下文很脆弱。

常见问题：

- 一个功能做到一半中断，过几天忘了当时做到哪。
- Claude Code 或 Codex 长会话后上下文变乱。
- 你切换了电脑、终端、分支或 AI 工具。
- 代码确实改了，但每个改动背后的意图没有被记录。
- 你想让下一个 AI agent 接着干，但不想手动粘贴大段 diff。

`devmem` 把当前 Git 状态转成一份紧凑、可复用的项目记忆。

它会给你：

- 本次改动摘要
- 开发过程中的关键决策
- 风险和未完成事项
- 变更文件列表
- 可直接粘贴给 Claude Code / Codex / 其他 AI Coding 工具的恢复 prompt

## 安装

### 从 npm 安装

已发布到 npm：[@gaojihao/devmem](https://www.npmjs.com/package/@gaojihao/devmem)

```bash
npm install -g @gaojihao/devmem
```

检查 CLI：

```bash
devmem --help
```

### 从源码安装

```bash
git clone git@github.com:gaojihao/devmem.git
cd devmem
pnpm install
pnpm build
pnpm link --global
```

检查 CLI：

```bash
devmem --help
```

源码安装要求：

- Node.js 20+
- pnpm
- Git

## 快速开始

进入任意 Git 项目：

```bash
cd your-project
```

初始化 devmem：

```bash
devmem init
```

配置一个 OpenAI-compatible 模型：

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key YOUR_API_KEY
devmem config set model gpt-4o-mini
```

开始一个 AI 编程会话：

```bash
devmem start "添加用户资料设置页"
```

然后正常使用 Claude Code、Codex、编辑器或终端写代码。

到达一个中断点时，保存本次会话：

```bash
devmem save
```

之后继续开发时，生成恢复 prompt：

```bash
devmem resume
```

把输出内容粘贴给 Claude Code、Codex 或其他 AI Coding agent。

## 典型工作流

```bash
# 1. 每个 Git 项目初始化一次
devmem init

# 2. 配置模型，只需要做一次
devmem config set base_url https://api.openai.com/v1
devmem config set api_key YOUR_API_KEY
devmem config set model gpt-4o-mini

# 3. 使用 AI Coding 工具前，先开始一个会话
devmem start "重构 auth middleware"

# 4. 使用 Claude Code / Codex / 编辑器正常开发

# 5. 保存会话记忆
devmem save

# 6. 之后恢复上下文
devmem resume
```

## 命令说明

### `devmem init`

在当前 Git 项目中初始化 devmem。

```bash
devmem init
```

会创建：

```text
.devmem/
  config.json
  current.json
  sessions/
```

### `devmem config set <key> <value>`

配置 LLM provider。

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key YOUR_API_KEY
devmem config set model gpt-4o-mini
```

支持的 key：

- `base_url`
- `api_key`
- `model`

### `devmem config get`

查看当前配置。

```bash
devmem config get
```

输出时 API key 会被脱敏。

### `devmem start <task>`

开始一个新的 AI 编程会话。

```bash
devmem start "修复 checkout payment bug"
```

它会记录：

- 任务描述
- 当前分支
- base commit
- 开始时间

### `devmem save`

保存当前会话。

```bash
devmem save
```

它会读取当前 Git 状态，调用配置好的模型生成摘要，并把会话文件写到 `.devmem/sessions/`。

### `devmem resume`

输出最近一次会话的恢复 prompt。

```bash
devmem resume
```

当你想继续之前的 AI 编程任务时使用它。

### `devmem log`

列出最近保存的会话。

```bash
devmem log
```

### `devmem show <session-id>`

查看某一次保存的会话。

```bash
devmem show 20260603-abc123
```

## resume prompt 示例

`devmem resume` 会输出类似这样的内容：

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

你可以直接把它粘贴给 Claude Code、Codex 或其他 AI Coding agent。

## 数据存储

`devmem` 会把项目本地记忆保存在 `.devmem/` 下：

```text
.devmem/
  config.json
  current.json
  sessions/
    <session-id>.json
    <session-id>.md
```

推荐在 `.gitignore` 中加入：

```gitignore
.devmem/
```

## LLM Provider

`devmem` 使用 OpenAI-compatible Chat Completions API。

示例：

```bash
# OpenAI
devmem config set base_url https://api.openai.com/v1
devmem config set model gpt-4o-mini

# OpenRouter
devmem config set base_url https://openrouter.ai/api/v1
devmem config set model openai/gpt-4o-mini

# 本地网关
devmem config set base_url http://localhost:11434/v1
devmem config set model qwen2.5-coder
```

然后设置 API key：

```bash
devmem config set api_key YOUR_API_KEY
```

## 开发

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

直接运行构建产物：

```bash
node dist/cli.js --help
```

## License

MIT。详见 [LICENSE](./LICENSE)。
