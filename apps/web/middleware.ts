import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge middleware checks session cookie; in demo mode / development,
 * it passes through to allow interactive UI testing.
 */
export function middleware(request: NextRequest) {
  if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

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
