# devmem 中文文档

AI 编程会话的本地项目记忆工具。

`devmem` 是一个 local-first 的命令行工具，面向使用 Claude Code、Codex 或其他 AI Coding Agent 的开发者。

它的作用不是替代 Claude Code / Codex，也不是做一个新的 IDE。

它只解决一个很具体的问题：

> 今天 AI 帮你改了代码，明天你回来时，如何快速知道上次做到哪、改了什么、为什么改、还有什么没做，以及下一次应该给 AI 什么 prompt 继续干。

`devmem` 会把 Git 变更转成结构化项目记忆：

- 这次任务想做什么
- 哪些文件发生了变化
- 推断出的实现决策
- 可能存在的风险、缺失测试和边界问题
- 下一步待办
- 可直接复制给 Claude Code / Codex 的恢复上下文 prompt

## 为什么需要 devmem

AI Coding 的核心问题，不只是“代码能不能生成”。

更真实的问题是：上下文会断。

常见场景：

- Claude Code / Codex 会话被打断。
- 上下文窗口有限。
- 你同时维护多个项目，切来切去后忘了上次做到哪。
- Git diff 只能说明“改了什么”，不能说明“为什么这么改”。
- commit 历史对于未完成任务来说太粗。
- 聊天记录绑定在具体工具里，不一定方便复用。
- 下一次 AI 会话需要一个清晰的 continuation prompt。

`devmem` 的定位是：

> 基于 Git 的本地 AI Coding Session Memory。

它不做大而全项目管理，也不做云端知识库。

第一版只验证一个问题：

> 当一次 AI 编程任务中断后，我能否快速恢复上下文继续开发？

## 设计原则

### 1. 本地优先

所有数据默认存储在当前 Git 项目的 `.devmem/` 目录下。

没有账号。
没有云同步。
没有服务端依赖。

### 2. 基于 Git

`devmem` 不读取 Claude Code / Codex 的内部聊天记录。

它只依赖：

- 用户输入的任务描述
- `git status --short`
- `git diff --stat`
- `git diff`
- 当前分支
- 当前 commit

这是更稳定、更通用的抽象。

### 3. 工具无关

你可以用：

- Claude Code
- Codex
- Cursor
- Cline
- Roo Code
- 任何会修改代码的 AI 工具

只要最终变更落在 Git 工作区里，`devmem` 就能工作。

### 4. 显式操作，不做魔法

v0.1 不会自动监听文件变化，也不会自动拦截 AI 工具输出。

你明确执行：

```bash
devmem start "任务描述"
```

然后在结束时执行：

```bash
devmem save
```

简单、可控、容易理解。

### 5. 小而闭环

第一版只保留核心闭环：

```text
init -> start -> save -> resume -> log
```

先证明这个闭环有价值，再考虑 UI、搜索、团队协作等复杂功能。

## devmem 能做什么

典型流程：

```text
开始任务 -> 用 AI 写代码 -> 保存会话记忆 -> 下次恢复上下文
```

示例：

```bash
devmem start "修复登录页崩溃"

# 使用 Claude Code / Codex 修改代码
# 正常 review、测试、调整

devmem save

devmem resume
```

`devmem save` 会读取当前 Git diff，并调用你配置的 LLM 生成结构化记忆。

`devmem resume` 会输出一段可以直接复制给 Claude Code / Codex 的 prompt。

## devmem 不做什么

v0.1 明确不做：

- Web UI
- Electron 桌面端
- VS Code 插件
- 云同步
- 用户账号
- 团队协作
- GitHub App
- 向量搜索
- 数据库存储
- 自动文件监听
- 自动读取 Claude Code / Codex 聊天记录
- MCP 集成
- 支付或 License 系统

这些以后可能有价值，但不是第一性问题。

第一性问题是：

> 我能不能在 AI 编程中断后恢复项目上下文？

## 安装

### 环境要求

- Node.js 20+
- pnpm
- Git
- 一个 OpenAI-compatible Chat Completions API

### 开发安装

```bash
git clone git@github.com:gaojihao/devmem.git
cd devmem
pnpm install
pnpm build
pnpm link --global
```

检查 CLI 是否可用：

```bash
devmem --help
```

如果不想全局 link，可以直接运行构建产物：

```bash
node dist/cli.js --help
```

## 快速开始

进入任意 Git 项目：

```bash
devmem init
```

配置 LLM Provider：

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <your-api-key>
devmem config set model gpt-4o-mini
```

开始一次任务：

```bash
devmem start "实现订单列表分页"
```

使用 Claude Code / Codex 修改代码。

保存会话：

```bash
devmem save
```

下次恢复：

```bash
devmem resume
```

查看历史：

```bash
devmem log
```

查看某次会话详情：

```bash
devmem show <session-id>
```

## 命令说明

### devmem init

初始化当前 Git 项目的 `.devmem/` 目录。

```bash
devmem init
```

创建：

```text
.devmem/
  config.json
  current.json
  sessions/
```

要求：

- 必须在 Git repository 内执行。

示例输出：

```text
devmem initialized at .devmem/
```

### devmem config set

设置当前项目的 LLM 配置。

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <your-api-key>
devmem config set model gpt-4o-mini
```

支持的 key：

- `base_url`
- `api_key`
- `model`

不支持的 key 会被拒绝。

### devmem config get

查看当前配置。

```bash
devmem config get
```

`api_key` 会被脱敏。

示例：

```text
base_url: https://api.openai.com/v1
api_key: ********abcd
model: gpt-4o-mini
```

### devmem start

开始一次 AI Coding 会话。

```bash
devmem start "修复登录页崩溃"
```

记录：

- session id
- task
- 创建时间
- 当前分支
- base commit
- status = `active`

示例输出：

```text
Started session: 20260602-153000-a1b2c3
Task: 修复登录页崩溃
```

v0.1 只允许同时存在一个 active session。

如果已经有 active session，需要先执行：

```bash
devmem save
```

再开始新的 session。

### devmem save

保存当前 active session。

```bash
devmem save
```

读取：

- `git status --short`
- `git diff --stat`
- `git diff`
- 当前 HEAD commit

然后调用 LLM 生成：

- summary
- changed files
- decisions
- risks
- todos
- resume prompt

写入：

```text
.devmem/sessions/<session-id>.json
.devmem/sessions/<session-id>.md
```

示例输出：

```text
Saved session: 20260602-153000-a1b2c3
Summary: 实现了订单列表分页状态和加载逻辑。
```

### devmem resume

输出最近一次 saved session 的恢复上下文 prompt。

```bash
devmem resume
```

这段输出的目标是直接复制给 Claude Code / Codex。

示例结构：

```text
You are continuing an AI coding session.

Previous task:
修复登录页崩溃

What changed:
- 更新了 LoginViewModel 的错误处理。
- 为缺失状态增加了空值保护。

Risks:
- 崩溃路径还需要补充回归测试。

Continue by:
1. 为 empty saved state 添加回归测试。
2. 运行 login 相关测试。
3. 确认正常登录路径没有行为变化。
```

### devmem log

列出最近的 session。

```bash
devmem log
```

示例：

```text
20260602-153000-a1b2c3  saved   修复登录页崩溃
20260602-120000-d4e5f6  saved   实现订单列表分页
```

### devmem show

查看某次 session 详情。

```bash
devmem show 20260602-153000-a1b2c3
```

行为：

- 优先输出 Markdown 文件。
- 如果 Markdown 不存在，则格式化输出 JSON。

## 数据结构

所有项目记忆都在 `.devmem/` 下：

```text
.devmem/
  config.json
  current.json
  sessions/
    20260602-153000-a1b2c3.json
    20260602-153000-a1b2c3.md
```

### config.json

保存本项目的 LLM 配置：

```json
{
  "base_url": "https://api.openai.com/v1",
  "api_key": "...",
  "model": "gpt-4o-mini"
}
```

### current.json

记录当前 active session 和最近 saved session：

```json
{
  "active_session_id": "20260602-153000-a1b2c3",
  "last_session_id": "20260602-120000-d4e5f6"
}
```

### sessions/*.json

机器可读的 session memory。

示例结构：

```json
{
  "id": "20260602-153000-a1b2c3",
  "task": "修复登录页崩溃",
  "status": "saved",
  "created_at": "2026-06-02T15:30:00.000Z",
  "saved_at": "2026-06-02T16:00:00.000Z",
  "branch": "master",
  "base_commit": "abc123",
  "head_commit": "def456",
  "summary": "修复了登录页由于状态缺失导致的崩溃。",
  "changed_files": [
    {
      "path": "src/login.ts",
      "status": "modified",
      "additions": 12,
      "deletions": 3
    }
  ],
  "decisions": [
    "将状态校验保留在 LoginViewModel 中。"
  ],
  "risks": [
    "回归测试覆盖可能还不完整。"
  ],
  "todos": [
    "为空 saved state 添加回归测试。"
  ],
  "resume_prompt": "You are continuing an AI coding session..."
}
```

### sessions/*.md

人类可读的 session memory。

包含：

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

完整 diff 保存在 JSON 中，不放在 Markdown 中，避免 Markdown 过长。

## LLM Provider 配置

`devmem` 使用 OpenAI-compatible Chat Completions API：

```text
POST {base_url}/chat/completions
```

请求结构类似：

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

### OpenAI 示例

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <openai-api-key>
devmem config set model gpt-4o-mini
```

### OpenRouter 示例

```bash
devmem config set base_url https://openrouter.ai/api/v1
devmem config set api_key <openrouter-api-key>
devmem config set model openai/gpt-4o-mini
```

### 本地或自托管网关示例

```bash
devmem config set base_url http://localhost:1234/v1
devmem config set api_key local-key
devmem config set model local-model
```

## 隐私与安全

`devmem` 是 local-first，但 `devmem save` 会把 Git diff 发送给你配置的 LLM Provider。

这点很重要：

- `.devmem/` 是本地项目数据。
- `api_key` 存储在 `.devmem/config.json`。
- 执行 `devmem save` 时，当前 `git diff` 会发送到配置的 `base_url`。
- 如果代码敏感，不要随意配置不可信的 provider。
- 本仓库 `.gitignore` 已忽略 `.devmem/`，但在你自己的项目中也建议忽略 `.devmem/`。

建议在使用 devmem 的项目中加入：

```text
.devmem/
```

## 开发

安装依赖：

```bash
pnpm install
```

运行测试：

```bash
pnpm test
```

类型检查：

```bash
pnpm typecheck
```

构建：

```bash
pnpm build
```

不 link 全局时运行 CLI：

```bash
node dist/cli.js --help
```

开发模式：

```bash
pnpm dev -- --help
```

## 当前验证状态

当前 v0.1 的验证命令：

```bash
pnpm test
pnpm typecheck
pnpm build
```

编写本文档时的预期结果：

- 12 个测试文件通过
- 24 个测试通过
- TypeScript typecheck 通过
- tsup build 通过

## 常见问题

### `devmem requires a Git repository.`

需要在 Git 仓库中运行。

可以先初始化：

```bash
git init
```

或进入已有 Git 项目。

### `devmem is not initialized. Run devmem init first.`

先执行：

```bash
devmem init
```

### `Active session already exists`

v0.1 只支持一个 active session。

先保存当前 session：

```bash
devmem save
```

然后再开始新 session。

### `No active session. Run devmem start first.`

你在没有 active session 的情况下执行了 `devmem save`。

先执行：

```bash
devmem start "你的任务"
```

### `Missing LLM config`

需要配置 provider：

```bash
devmem config set base_url https://api.openai.com/v1
devmem config set api_key <your-api-key>
devmem config set model gpt-4o-mini
```

### `LLM returned invalid JSON`

配置的模型没有返回合法 JSON。

可以尝试：

- 换一个更强的模型
- 使用支持 JSON mode 的 OpenAI-compatible endpoint
- 检查 provider 是否支持 `response_format: { "type": "json_object" }`

## Roadmap

可能的后续方向：

- 更好的 provider 兼容性
- 全局配置 fallback
- 本地配置加密
- Git hook 集成
- session 搜索
- 跨项目记忆索引
- 每周开发总结
- GitHub issue / PR 关联
- 团队记忆模式
- VS Code 插件
- 桌面 UI

这些都不属于 v0.1。

## 贡献原则

项目还在早期 MVP 阶段。

扩展功能前，必须保留核心闭环：

```text
init -> start -> save -> resume -> log
```

好的贡献方向：

- 让核心闭环更稳定
- 提升 provider 兼容性
- 改进测试
- 改进 resume prompt 质量
- 改进文档

避免过早复杂化：

- 没有明确必要，不引入数据库
- 不让本地记忆依赖云服务
- CLI 价值未验证前，不急着做 UI
- Git-based memory 未验证前，不急着抓取 Claude/Codex 日志

## License

尚未选择 License。
