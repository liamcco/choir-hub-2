import { spawn } from 'node:child_process'
import * as p from '@clack/prompts'
import { PRODUCTION_DATABASE_CONFIRMATION } from './database-guards'

const DEFAULTS = {
  email: 'admin@example.com',
  password: 'password',
  name: 'Local Admin',
}

const MENU = [
  ['admin-bootstrap', 'Bootstrap admin account'],
  ['demo-seed', 'Run demo seed'],
  ['db-push', 'Push current schema'],
  ['reset-db', 'Reset database'],
] as const

function printUsage(): void {
  console.log('Usage: bun run cli')
}

async function selectCommand(): Promise<string | null> {
  const selected = await p.select({
    message: 'Choose a script to run',
    options: MENU.map(([value, label]) => ({ value, label })),
  })
  return p.isCancel(selected) ? null : selected
}

async function ask(question: string, fallback: string): Promise<string> {
  const answer = await p.text({ message: question, initialValue: fallback })
  return p.isCancel(answer) ? fallback : answer.trim() || fallback
}

function run(command: string, args: string[], environment?: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, ...environment },
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}.`))
    })
  })
}

function databaseEnvironment(): Record<string, string> | undefined {
  if (process.env.DB_MODE !== 'prod') return undefined

  const productionUrl = process.env.DATABASE_URL_PROD
  if (!productionUrl) throw new Error('DATABASE_URL_PROD must be set when DB_MODE=prod.')

  return {
    DATABASE_URL: productionUrl,
    DB_MODE: 'prod',
    PRODUCTION_DATABASE_CONFIRMATION,
  }
}

async function confirmProductionDatabase(): Promise<void> {
  if (process.env.DB_MODE !== 'prod') return

  console.warn('\n⚠️  DB_MODE=prod: this command will use the production database.')
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Production database operation requires interactive confirmation.')
  }

  const confirmed = await p.confirm({ message: 'Are you sure you want to proceed?' })
  if (p.isCancel(confirmed)) throw new Error('Cancelled.')
  if (!confirmed) throw new Error('Cancelled.')
}

async function confirmDestructiveProductionDatabase(command: 'db-push' | 'reset-db'): Promise<void> {
  if (process.env.DB_MODE !== 'prod') return

  const action =
    command === 'reset-db' ? 'drop the production schema and migrate it again' : 'push schema changes to production'
  const confirmed = await p.confirm({ message: `Second confirmation: permanently ${action}?` })
  if (p.isCancel(confirmed) || !confirmed) throw new Error('Cancelled.')
}

async function confirmProductionDemoSeed(): Promise<void> {
  if (process.env.DB_MODE !== 'prod') return

  const confirmed = await p.confirm({ message: 'Run the demo seed against the production database anyway?' })
  if (p.isCancel(confirmed) || !confirmed) throw new Error('Cancelled.')
}

async function main(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    printUsage()
    throw new Error('The CLI must be run interactively.')
  }

  try {
    const selected = await selectCommand()
    if (!selected) return
    await confirmProductionDatabase()
    await mainCommand(selected)
  } finally {
    process.stdin.setRawMode?.(false)
    process.stdin.pause()
  }
}

async function mainCommand(command: string): Promise<void> {
  switch (command) {
    case 'admin-bootstrap':
      {
        const useDefault = await p.confirm({ message: 'Use default creds?' })
        if (p.isCancel(useDefault)) return
        if (useDefault && process.env.DB_MODE === 'prod') {
          const confirmed = await p.confirm({
            message: 'These default credentials are unsafe for production. Continue anyway?',
          })
          if (p.isCancel(confirmed) || !confirmed) throw new Error('Cancelled.')
        }
        const adminArgs = !useDefault
          ? [
              '--email',
              await ask('Admin email', DEFAULTS.email),
              '--password',
              await ask('Admin password', DEFAULTS.password),
              '--name',
              await ask('Admin name', DEFAULTS.name),
            ]
          : []
        await run('bun', ['scripts/bootstrap-admin.ts'], {
          ADMIN_EMAIL: adminArgs[1] ?? DEFAULTS.email,
          ADMIN_PASSWORD: adminArgs[3] ?? DEFAULTS.password,
          ADMIN_NAME: adminArgs[5] ?? DEFAULTS.name,
        })
      }
      return
    case 'demo-seed':
      await confirmProductionDemoSeed()
      await run('bun', ['scripts/demo-seed.ts'])
      return
    case 'db-push':
      await confirmDestructiveProductionDatabase('db-push')
      await run('bun', ['scripts/push-db.ts'], databaseEnvironment())
      return
    case 'reset-db': {
      await confirmDestructiveProductionDatabase('reset-db')
      await run('bun', ['scripts/reset-db.ts'], databaseEnvironment())
      if (process.env.DB_MODE === 'prod') return
      const seed = await p.confirm({ message: 'would you like to run the seed script as well?' })
      if (p.isCancel(seed)) return
      if (seed) await run('bun', ['scripts/demo-seed.ts'], databaseEnvironment())
      return
    }
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
