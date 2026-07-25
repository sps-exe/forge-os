import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge middleware can't load the Prisma adapter, so we gate on the
 * Auth.js session cookie; the app layout does the real session check.
 */
export function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get('authjs.session-token') ??
    request.cookies.get('__Secure-authjs.session-token')

  if (!sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/achievements/:path*',
    '/leetcode/:path*',
    '/codeforces/:path*',
    '/github/:path*',
    '/contests/:path*',
    '/settings/:path*',
  ],
}
