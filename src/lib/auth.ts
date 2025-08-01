import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        // For demo purposes, we'll create a user if they don't exist
        let user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              role: (credentials.role as UserRole) || UserRole.INTERN,
            },
          })
        }

        // Check if user is deactivated
        if (!user.isActive) {
          return null // Prevent login for deactivated users
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          isActive: user.isActive,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Always refresh user data from database to get latest status
      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
          token.companyId = dbUser.companyId
          token.isActive = dbUser.isActive
        }
      }
      
      // If this is a new login, also set initial data
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
          token.companyId = dbUser.companyId
          token.isActive = dbUser.isActive
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.companyId = token.companyId as string | null
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
  },
}