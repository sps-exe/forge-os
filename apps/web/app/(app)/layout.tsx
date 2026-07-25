import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/shell/sidebar'
import { Topbar } from '@/components/shell/topbar'
import { CommandPalette } from '@/components/shell/command-palette'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const demoUser = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production'
    ? { id: 'demo-user-id', name: 'Alex Developer', image: 'https://avatars.githubusercontent.com/u/1?v=4' }
    : null

  const user = session?.user ?? demoUser

  if (!user) redirect('/sign-in')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={{ name: user.name ?? 'Alex Developer', image: user.image ?? undefined }} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  )
}
