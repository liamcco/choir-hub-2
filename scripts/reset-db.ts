import 'dotenv/config'
import { spawn } from 'node:child_process'

if (process.env.DB_MODE !== 'local') {
  console.error('Database reset is only allowed when DB_MODE=local.')
  process.exit(1)
}

const child = spawn('bun', ['x', 'prisma', 'migrate', 'reset', '--force'], {
  stdio: 'inherit',
  env: process.env,
})

child.on('error', (error) => {
  console.error(error.message)
  process.exitCode = 1
})

child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
