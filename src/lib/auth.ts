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
    signUp: "/auth/signup",
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
}