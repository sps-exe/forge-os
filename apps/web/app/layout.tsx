import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import '@forge/ui/styles.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Forge — The Daily OS for Developers',
    template: '%s · Forge',
  },
  description:
    'One dashboard for LeetCode, Codeforces, GitHub, contests, streaks and AI coaching. Build better developer habits, every single day.',
  keywords: ['leetcode', 'codeforces', 'github', 'developer productivity', 'coding streak'],
  openGraph: {
    title: 'Forge — The Daily OS for Developers',
    description: 'Never miss a daily problem, contest, or GitHub contribution again.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
