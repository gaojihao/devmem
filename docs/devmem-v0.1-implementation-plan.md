# devmem v0.1 技术实施计划

## 目标

实现一个名为 `devmem` 的本地优先 TypeScript Node.js CLI 工具。

`devmem` 用于帮助 Claude Code / Codex 用户在 AI Coding 会话中断后恢复项目上下文。

第一版只解决一个核心问题：

> 我今天用 AI 改了代码，明天回来时，能不能快速知道上次做到哪、改了什么、为什么改、还有什么没做，以及下一步该给 Claude Code / Codex 什么 prompt 继续干。

## 产品定位

Local memory for AI coding sessions.

## v0.1 原则

1. 本地优先，所有数据存储在当前 Git 项目的 `.devmem/` 下。
2. 只依赖 Git diff、Git status 和用户输入的 task，不读取 Claude Code / Codex 内部聊天记录。
3. 先做 CLI，不做 UI、不做云同步、不做账号、不做团队协作。
4. 功能闭环优先，避免过度设计。
5. 严格测试核心模块。
6. 所有核心行为必须能在真实 Git 项目中端到端跑通。

## 技术栈

- TypeScript
- Node.js
- pnpm
- commander
- execa
- zod
- nanoid
- chalk
- ora
- vitest
- tsup

## CLI 命令

### devmem init

初始化当前 Git 项目的 `.devmem/` 目录。

创建：

```text
.devmem/
  config.json
  current.json
  sessions/
```

行为：

- 必须在 Git repository 中执行。
- 如果不是 Git repository，报错：`devmem requires a Git repository.`
- 如果已经初始化，不覆盖已有配置。

### devmem start <task>

开始一次 AI Coding session。

记录：

- session id
- task
- created_at
- branch
- base_commit
- status = active

如果已有 active session，拒绝开始新 session。

### devmem save

保存当前 active session。

读取：

- `git status --short`
- `git diff --stat`
- `git diff`
- current branch
- current HEAD commit

调用 OpenAI-compatible chat completions API 生成：

- summary
- changed_files
- decisions
- risks
- todos
- resume_prompt

写入：

```text
.devmem/sessions/<session-id>.json
.devmem/sessions/<session-id>.md
```

更新：

- 清空 `current.active_session_id`
- 设置 `current.last_session_id`

### devmem resume

读取最近一次 saved session，直接输出可复制给 Claude Code / Codex 的 `resume_prompt`。

### devmem log

按时间倒序列出最近 20 条 session。

格式：

```text
<id>  <status>  <task>
```

### devmem show <session-id>

展示某次 session 详情。

优先读取 `.md`，如果没有 `.md`，格式化输出 `.json`。

### devmem config set <key> <value>

支持 key：

- base_url
- api_key
- model

不支持的 key 报错。

### devmem config get

展示当前配置。

`api_key` 必须脱敏。

## 存储结构

```text
.devmem/
  config.json
  current.json
  sessions/
    <session-id>.json
    <session-id>.md
```

## TypeScript 类型

### DevmemConfig

```ts
type DevmemConfig = {
  base_url?: string
  api_key?: string
  model?: string
}
```

### CurrentSession

```ts
type CurrentSession = {
  active_session_id?: string
  last_session_id?: string
}
```

### DevmemSession

```ts
type SessionStatus = 'active' | 'saved'

type ChangedFile = {
  path: string
  status: string
  additions?: number
  deletions?: number
}

type DevmemSession = {
  id: string
  task: string
  status: SessionStatus
  created_at: string
  saved_at?: string

  branch: string
  base_commit: string
  head_commit?: string

  git_status?: string
  diff_stat?: string
  diff?: string

  changed_files?: ChangedFile[]

  summary?: string
  decisions?: string[]
  risks?: string[]
  todos?: string[]
  resume_prompt?: string
  raw_llm_output?: string
}
```

### SaveSummary

```ts
type SaveSummary = {
  summary: string
  changed_files: ChangedFile[]
  decisions: string[]
  risks: string[]
  todos: string[]
  resume_prompt: string
}
```

## 项目结构

```text
devmem/
  package.json
  tsconfig.json
  tsup.config.ts
  vitest.config.ts
  README.md
  src/
    cli.ts
    index.ts
    commands/
      init.ts
      start.ts
      save.ts
      resume.ts
      log.ts
      show.ts
      config.ts
    core/
      paths.ts
      git.ts
      session.ts
      store.ts
      llm.ts
      markdown.ts
      prompt.ts
      errors.ts
    types/
      session.ts
      config.ts
    utils/
      fs.ts
      time.ts
      output.ts
  tests/
    core/
      paths.test.ts
      git.test.ts
      store.test.ts
      markdown.test.ts
      prompt.test.ts
    commands/
      init.test.ts
      start.test.ts
      save.test.ts
      resume.test.ts
      log.test.ts
      config.test.ts
```

## 核心模块 API

### src/core/paths.ts

```ts
getMemoryDir(cwd: string): string
getConfigPath(cwd: string): string
getCurrentPath(cwd: string): string
getSessionsDir(cwd: string): string
getSessionJsonPath(cwd: string, id: string): string
getSessionMarkdownPath(cwd: string, id: string): string
```

### src/core/git.ts

```ts
isGitRepository(cwd: string): Promise<boolean>
getCurrentBranch(cwd: string): Promise<string>
getHeadCommit(cwd: string): Promise<string>
getStatusShort(cwd: string): Promise<string>
getDiffStat(cwd: string): Promise<string>
getDiff(cwd: string): Promise<string>
```

### src/core/store.ts

```ts
ensureInitialized(cwd: string): Promise<void>
isInitialized(cwd: string): Promise<boolean>

readConfig(cwd: string): Promise<DevmemConfig>
writeConfig(cwd: string, config: DevmemConfig): Promise<void>

readCurrent(cwd: string): Promise<CurrentSession>
writeCurrent(cwd: string, current: CurrentSession): Promise<void>

readSession(cwd: string, id: string): Promise<DevmemSession>
writeSession(cwd: string, session: DevmemSession): Promise<void>

listSessions(cwd: string): Promise<DevmemSession[]>
```

### src/core/prompt.ts

```ts
buildSavePrompt(input: {
  task: string
  branch: string
  baseCommit: string
  headCommit: string
  gitStatus: string
  diffStat: string
  diff: string
}): string
```

Prompt 必须要求：

- Return strict JSON only.
- No markdown.
- No commentary.
- Do not invent facts not supported by the diff.
- If unclear, say it is unclear.
- Resume prompt must be directly actionable for Claude Code / Codex.

### src/core/llm.ts

```ts
summarizeSession(input: SavePromptInput, config: DevmemConfig): Promise<SaveSummary>
```

行为：

- 校验 base_url/api_key/model。
- 调用 `{base_url}/chat/completions`。
- 使用 OpenAI-compatible request body。
- 解析 JSON。
- JSON 解析失败时抛出清晰错误。

### src/core/markdown.ts

```ts
renderSessionMarkdown(session: DevmemSession): string
```

Markdown 格式包含：

- Task
- Status
- Branch
- Base Commit
- Head Commit
- Created
- Saved
- Summary
- Changed Files
- Decisions
- Risks
- Todos
- Resume Prompt
- Git Status
- Diff Stat

第一版 Markdown 不放完整 diff，完整 diff 只放 JSON。

## 错误类型

实现简单错误类：

```ts
class DevmemError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
  }
}
```

常见错误 code：

- NOT_GIT_REPO
- NOT_INITIALIZED
- ACTIVE_SESSION_EXISTS
- NO_ACTIVE_SESSION
- NO_SAVED_SESSION
- MISSING_LLM_CONFIG
- INVALID_CONFIG_KEY
- LLM_REQUEST_FAILED
- LLM_INVALID_JSON

CLI 层只输出 message，不输出 stack。

## 测试要求

使用 Vitest。

必须覆盖：

1. paths
   - 路径构造正确。
2. git
   - 临时目录初始化 git repo 后能读取 branch/head/status/diff。
3. store
   - 初始化创建目录。
   - config/current/session 可读写。
   - listSessions 按 created_at 倒序。
4. prompt
   - 包含 task、branch、diff、strict JSON、Do not invent facts。
5. markdown
   - 能生成 Summary、Todos、Resume Prompt。
   - 空数组不崩。
6. config command
   - set/get 正常。
   - api_key 脱敏。
   - 非法 key 报错。
7. start command
   - 正常创建 active session。
   - 已有 active session 时拒绝。
8. save command
   - 无 active session 报错。
   - mock LLM 后能保存 session、生成 md、更新 current。
9. resume command
   - 有 last_session_id 时输出 resume_prompt。
   - 没有 session 时报错。
10. log command
   - 按时间倒序。

验收命令：

```bash
pnpm test
pnpm typecheck
pnpm build
```

## 开发顺序

1. 初始化 TypeScript CLI 项目。
2. 实现 paths 模块和测试。
3. 实现 git 模块和测试。
4. 定义 types。
5. 实现 store 模块和测试。
6. 实现 init 命令和测试。
7. 实现 start 命令和测试。
8. 实现 config 命令和测试。
9. 实现 prompt 模块和测试。
10. 实现 llm 模块和测试。
11. 实现 markdown 模块和测试。
12. 实现 save 命令和测试。
13. 实现 resume 命令和测试。
14. 实现 log 命令和测试。
15. 实现 show 命令。
16. 整合 cli.ts。
17. 写 README。
18. 端到端手动验证。

## package.json 要求

scripts：

```json
{
  "scripts": {
    "dev": "tsx src/cli.ts",
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "bin": {
    "devmem": "./dist/cli.js"
  }
}
```

## 端到端验证流程

在临时 Git repo 中执行：

```bash
mkdir /tmp/devmem-demo
cd /tmp/devmem-demo
git init
echo "# demo" > README.md
git add README.md
git commit -m "init"

# 使用当前项目构建后的 CLI
devmem init
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <key>
devmem config set model gpt-4o-mini
devmem start "更新 README"
echo "hello" >> README.md
devmem save
devmem resume
devmem log
```

验收：

- `.devmem/sessions/` 下有 `.json` 和 `.md`。
- `devmem resume` 输出可直接复制给 Claude Code / Codex 的 prompt。
- `devmem log` 能看到 session。

## v0.1 不做事项

明确不要做：

1. Web UI
2. Electron
3. VS Code 插件
4. 云同步
5. 用户系统
6. 团队协作
7. GitHub App
8. 向量搜索
9. 自动读取 Claude Code / Codex 聊天记录
10. MCP
11. 支付
12. 多项目 dashboard
13. 自动监听文件变化
14. 插件系统
15. 数据库

## 最终验收标准

1. `pnpm test` 通过。
2. `pnpm typecheck` 通过。
3. `pnpm build` 通过。
4. 在真实 Git 项目里完整跑通：
   - `devmem init`
   - `devmem start`
   - `devmem save`
   - `devmem resume`
5. `devmem resume` 输出的 prompt 你愿意复制给 Claude Code / Codex 继续开发。

## 给 Claude Code 的实现要求

请严格按本计划实现。

不要扩大范围。
不要增加 UI。
不要增加云同步。
不要读取 Claude Code / Codex 内部日志。
不要引入数据库。
不要做超出 v0.1 的功能。

优先保证核心闭环可用：

```text
init -> start -> save -> resume -> log
```
