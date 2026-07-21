import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline/promises'

const DEFAULTS = {
  email: 'admin@example.com',
  password: 'password',
  name: 'Local Admin',
}

const MENU = [
  ['admin-bootstrap', 'Bootstrap admin account'],
  ['demo-seed', 'Run demo seed'],
  ['foundation-seed', 'Run foundation seed'],
] as const

function printUsage(): void {
  console.log('Usage: bun run cli')
}

async function selectCommand(): Promise<string | null> {
  let selected = 0

  return new Promise((resolve) => {
    const render = () => {
      process.stdout.write('\x1b[2J\x1b[H')
      console.log('CSK Choir Hub scripts\n')
      MENU.forEach(([, label], index) => {
        console.log(`${index === selected ? '❯' : ' '} ${label}`)
      })
      console.log('\nUse ↑/↓ and Enter. Press Escape to cancel or exit.')
    }

    const onKey = (chunk: Buffer) => {
      const key = chunk.toString()
      if (key === '\u0003') process.exit(130)
      if (key === '\u001b') {
        process.stdin.setRawMode?.(false)
        process.stdin.pause()
        process.stdin.off('data', onKey)
        process.stdout.write('\nCancelled.\n')
        resolve(null)
        return
      }
      if (key === '\u001b[A') selected = (selected + MENU.length - 1) % MENU.length
      if (key === '\u001b[B') selected = (selected + 1) % MENU.length
      if (key === '\r' || key === '\n') {
        process.stdin.setRawMode?.(false)
        process.stdin.pause()
        process.stdin.off('data', onKey)
        process.stdout.write('\x1b[2J\x1b[H')
        resolve(MENU[selected][0])
        return
      }
      render()
    }

    process.stdin.setRawMode?.(true)
    process.stdin.resume()
    process.stdin.on('data', onKey)
    render()
  })
}

async function ask(question: string, fallback: string): Promise<string> {
  const readline = createInterface({ input: process.stdin, output: process.stdout })
  const answer = (await readline.question(`${question} [${fallback}]: `)).trim()
  readline.close()
  return answer || fallback
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

function prismaEnvironment(): Record<string, string> | undefined {
  if (process.env.DB_MODE !== 'prod') return undefined

  const productionUrl = process.env.DATABASE_URL_PROD
  if (!productionUrl) throw new Error('DATABASE_URL_PROD must be set when DB_MODE=prod.')

  return { DATABASE_URL: productionUrl }
}

async function confirmProductionDatabase(): Promise<void> {
  if (process.env.DB_MODE !== 'prod') return

  console.warn('\n⚠️  DB_MODE=prod: this command will use the production database.')
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Production database operation requires interactive confirmation.')
  }

  const confirmed = (await ask('Are you sure you want to proceed? (y/N)', 'N')).toLowerCase() === 'y'
  if (!confirmed) throw new Error('Cancelled.')
}

async function main(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    printUsage()
    throw new Error('The CLI must be run interactively.')
  }

  await confirmProductionDatabase()
  const selected = await selectCommand()
  if (!selected) return
  await mainCommand(selected)
}

async function mainCommand(command: string): Promise<void> {
  switch (command) {
    case 'admin-bootstrap':
      {
        const custom = (await ask('Use custom admin-bootstrap values? (y/N)', 'N')).toLowerCase() === 'y'
        const adminArgs = custom
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
      await run('bun', ['scripts/demo-seed.ts'])
      return
    case 'foundation-seed':
      await run('bun', ['x', 'prisma', 'db', 'seed'], prismaEnvironment())
      return
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
