#!/usr/bin/env node
import { Command } from 'commander'
import { configGetCommand, configSetCommand } from './commands/config.js'
import { initCommand } from './commands/init.js'
import { logCommand } from './commands/log.js'
import { resumeCommand } from './commands/resume.js'
import { saveCommand } from './commands/save.js'
import { showCommand } from './commands/show.js'
import { startCommand } from './commands/start.js'

async function run(action: () => Promise<string | object>): Promise<void> {
  try {
    const result = await action()
    if (typeof result === 'string') console.log(result)
    else console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

const program = new Command()
program.name('devmem').description('Local memory for AI coding sessions.').version('0.1.0')

program.command('init').description('Initialize devmem in the current Git project').action(() => {
  void run(() => initCommand(process.cwd()))
})

program.command('start').argument('<task>').description('Start an AI coding session').action((task: string) => {
  void run(async () => {
    const session = await startCommand(process.cwd(), task)
    return `Started session: ${session.id}
Task: ${session.task}`
  })
})

program.command('save').description('Save the active session').action(() => {
  void run(async () => {
    const session = await saveCommand(process.cwd())
    return `Saved session: ${session.id}
Summary: ${session.summary ?? ''}`
  })
})

program.command('resume').description('Print the latest resume prompt').action(() => {
  void run(() => resumeCommand(process.cwd()))
})

program.command('log').description('List recent sessions').action(() => {
  void run(() => logCommand(process.cwd()))
})

program.command('show').argument('<session-id>').description('Show a session').action((id: string) => {
  void run(() => showCommand(process.cwd(), id))
})

const config = program.command('config').description('Manage devmem config')
config.command('set').argument('<key>').argument('<value>').action((key: string, value: string) => {
  void run(() => configSetCommand(process.cwd(), key, value))
})
config.command('get').action(() => {
  void run(() => configGetCommand(process.cwd()))
})

program.parse()
