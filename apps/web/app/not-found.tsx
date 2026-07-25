import Link from 'next/link'
import { Button } from '@forge/ui'
import { Logo } from '@/components/logo'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <Logo className="text-xl" />
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">This page hasn&apos;t been forged yet.</p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
