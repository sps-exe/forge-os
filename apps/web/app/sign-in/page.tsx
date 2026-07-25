import { redirect } from 'next/navigation'
import { Github, UserCheck, AlertCircle, Zap } from 'lucide-react'
import { auth, signIn } from '@/lib/auth'
import { Logo } from '@/components/logo'

export const dynamic = 'force-dynamic'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
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
  const error = resolvedSearchParams?.error

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Could not start sign-in. Please try again.',
    OAuthCallback: 'Sign-in was cancelled or failed. Please try again.',
    OAuthCreateAccount: 'Could not create your account. Please try again.',
    Callback: 'Something went wrong during sign-in. Please try again.',
    Default: 'An unexpected error occurred. Please try again.',
  }

  const errorMessage = error ? (errorMessages[error] ?? errorMessages.Default) : null

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] px-4">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-2xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-8">
        {/* Logo + headline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="text-2xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome to Forge
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Your daily operating system for software engineering.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* GitHub */}
            <form
              action={async () => {
                'use server'
                await signIn('github', { redirectTo })
              }}
            >
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1] active:scale-[0.98]"
              >
                <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </form>

            {/* Google */}
            <form
              action={async () => {
                'use server'
                await signIn('google', { redirectTo })
              }}
            >
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1] active:scale-[0.98]"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* Demo */}
          <form
            action={async () => {
              'use server'
              redirect('/dashboard')
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm font-medium text-orange-400 transition-all duration-200 hover:border-orange-500/30 hover:bg-orange-500/20 active:scale-[0.98]"
            >
              <Zap className="size-4 shrink-0" />
              Instant Demo Access
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-zinc-600">
            GitHub sign-in connects your contribution graph automatically.
          </p>
        </div>

        {/* Features strip */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Daily Tasks', icon: '🎯' },
            { label: 'XP & Streaks', icon: '🔥' },
            { label: 'Contest Feed', icon: '🏆' },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
            >
              <div className="text-xl">{f.icon}</div>
              <div className="mt-1 text-xs text-zinc-500">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
