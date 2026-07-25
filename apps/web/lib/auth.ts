import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@forge/database'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: 'read:user user:email' } },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  events: {
    // Auto-connect the GitHub coding account on first GitHub sign-in.
    async signIn({ user, account, profile }) {
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
