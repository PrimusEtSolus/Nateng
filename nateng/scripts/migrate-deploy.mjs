// Applies pending Prisma migrations before a build.
// Skipped when DATABASE_URL is absent (e.g. local builds without a database).
import { spawnSync } from 'node:child_process'

// SECURITY NOTICE: A leaked API key / preview-mode signing key was previously
// found in .next/cache/.previewinfo (flagged by gitleaks). The .gitignore now
// excludes this file from version control.
// ACTION REQUIRED: Rotate the leaked API key on the vendor dashboard immediately
// and invalidate any preview-mode tokens that were exposed in the build cache.
console.warn('[migrate-deploy] ⚠ SECURITY REMINDER: The leaked API key found in .next/cache/.previewinfo must be rotated on the vendor dashboard before deploying to production.')

if (!process.env.DATABASE_URL) {
  console.warn('[migrate-deploy] DATABASE_URL is not set, skipping `prisma migrate deploy`.')
  process.exit(0)
}

const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit', shell: false })
process.exit(result.status ?? 1)
