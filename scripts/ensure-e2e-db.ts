import 'dotenv/config'

import postgres from 'postgres'

if (process.env.DB_MODE !== 'e2e') {
  throw new Error('E2E database setup requires DB_MODE=e2e.')
}

const targetUrl = new URL(
  process.env.DATABASE_URL_E2E ?? 'postgresql://postgres:mysecretpassword@localhost:5432/csk_e2e',
)
const databaseName = targetUrl.pathname.slice(1)
if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(databaseName)) {
  throw new Error(`Invalid E2E database name: ${databaseName}`)
}

targetUrl.pathname = '/postgres'
const adminSql = postgres(targetUrl.toString())

try {
  await adminSql.unsafe(`drop database if exists "${databaseName}" with (force)`)
  await adminSql.unsafe(`create database "${databaseName}"`)
  console.log(`Recreated E2E database ${databaseName}.`)
} finally {
  await adminSql.end()
}
