'use client'

import { useEffect } from 'react'
import { Button } from '@forge/ui'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App crashed:', error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md">
        The application encountered a critical error. This often happens if the database connection fails (e.g. missing DATABASE_URL in Vercel).
      </p>
      <div className="flex gap-4 mt-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Return to Home
        </Button>
      </div>
    </div>
  )
}
