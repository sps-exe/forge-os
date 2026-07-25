import { redirect } from 'next/navigation'
import { Github, UserCheck } from 'lucide-react'
import { Button, Card, CardContent } from '@forge/ui'
import { auth, signIn } from '@/lib/auth'
import { Logo } from '@/components/logo'

export const dynamic = 'force-dynamic'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  let session = null
  try {
    session = await auth()
  } catch (err) {
    console.error('Session auth check error:', err)
  }

  if (session?.user) redirect('/dashboard')

  const resolvedSearchParams = await searchParams
  const redirectTo = resolvedSearchParams?.callbackUrl ?? '/dashboard'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <Logo className="text-xl" />
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4 p-8">
          <div className="space-y-1 text-center">
            <h1 className="text-lg font-semibold">Welcome to Forge</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to start building your daily habit.
            </p>
          </div>

          <form
            action={async () => {
              'use server'
              try {
                await signIn('github', { redirectTo })
              } catch (err) {
                // If OAuth credentials aren't configured yet, redirect to dashboard demo
                redirect('/dashboard')
              }
            }}
          >
            <Button className="w-full" variant="secondary" size="lg" type="submit">
              <Github /> Continue with GitHub
            </Button>
          </form>

          <form
            action={async () => {
              'use server'
              try {
                await signIn('google', { redirectTo })
              } catch (err) {
                // If OAuth credentials aren't configured yet, redirect to dashboard demo
                redirect('/dashboard')
              }
            }}
          >
            <Button className="w-full" variant="secondary" size="lg" type="submit">
              <GoogleIcon /> Continue with Google
            </Button>
          </form>

          <form
            action={async () => {
              'use server'
              redirect('/dashboard')
            }}
          >
            <Button className="w-full" variant="outline" size="lg" type="submit">
              <UserCheck className="size-4" /> Instant Demo Access
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-xs">
            GitHub sign-in connects your contribution graph automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
