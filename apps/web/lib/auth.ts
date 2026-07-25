import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@forge/database'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? 'forge-production-default-secret-32-chars-key!',
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? 'placeholder-github-id',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? 'placeholder-github-secret',
      authorization: { params: { scope: 'read:user user:email' } },
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? 'placeholder-google-id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? 'placeholder-google-secret',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  events: {
    // Auto-connect the GitHub coding account on first GitHub sign-in.
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'github' && user.id && profile?.login) {
          await prisma.codingAccount.upsert({
            where: { userId_platform: { userId: user.id, platform: 'GITHUB' } },
            update: { handle: String(profile.login), verified: true },
            create: {
              userId: user.id,
              platform: 'GITHUB',
              handle: String(profile.login),
              verified: true,
            },
          })
        }
      } catch (err) {
        console.error('Error auto-linking GitHub account:', err)
      }
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
})
