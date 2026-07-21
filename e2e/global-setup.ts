import { execFileSync } from 'node:child_process'
import type { FullConfig } from '@playwright/test'

export default function globalSetup(_config: FullConfig) {
  runFixtureCommand('setup')
  return () => runFixtureCommand('teardown')
}

function runFixtureCommand(command: 'setup' | 'teardown') {
  execFileSync('bun', ['e2e/member-dialog-fixture.ts', command], {
    env: { ...process.env, DB_MODE: 'local' },
    stdio: 'inherit',
  })
}
