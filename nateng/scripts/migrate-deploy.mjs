// Applies pending Prisma migrations before a build.
// Skipped when DATABASE_URL is absent (e.g. local builds without a database).
import { spawnSync } from 'node:child_process'

if (!process.env.DATABASE_URL) {
  console.warn('[migrate-deploy] DATABASE_URL is not set, skipping `prisma migrate deploy`.')
  process.exit(0)
}

const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit', shell: process.platform === 'win32' })
process.exit(result.status ?? 1)
