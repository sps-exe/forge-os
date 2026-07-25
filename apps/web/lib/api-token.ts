import 'server-only'
import { SignJWT } from 'jose'
import { auth } from './auth'

/**
 * Issues a short-lived HS256 token the NestJS API can verify with the
 * shared AUTH_SECRET. Called from server components / route handlers.
 */
export async function getApiToken(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
  return new SignJWT({ email: session.user.email ?? null })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.user.id)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}
