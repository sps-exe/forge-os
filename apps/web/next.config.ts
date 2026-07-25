import type { NextConfig } from 'next'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const rootEnvPath = join(__dirname, '../../.env')
if (!process.env.AUTH_SECRET && existsSync(rootEnvPath)) {
  process.loadEnvFile(rootEnvPath)
}

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up stray parent lockfiles.
  outputFileTracingRoot: join(__dirname, '../../'),
  transpilePackages: ['@forge/ui', '@forge/shared', '@forge/database'],
  images: {
    remotePatterns: [
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
}

export default nextConfig
