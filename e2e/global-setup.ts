import { execFileSync } from 'node:child_process'

export default function globalSetup(): void {
  const environment = { ...process.env, DB_MODE: 'e2e', ENVIRONMENT: 'test' }
  execFileSync('bun', ['scripts/ensure-e2e-db.ts'], { env: environment, stdio: 'inherit' })
  execFileSync('bun', ['x', 'drizzle-kit', 'migrate'], { env: environment, stdio: 'inherit' })
  execFileSync('bun', ['scripts/reset-db.ts'], { env: environment, stdio: 'inherit' })
  execFileSync('bun', ['scripts/e2e-seed.ts'], { env: environment, stdio: 'inherit' })
}
