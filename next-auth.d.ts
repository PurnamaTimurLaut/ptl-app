import { DefaultSession, DefaultUser } from "next-auth"

// Define our custom Role properties so TypeScript knows they exist
declare module "next-auth" {
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
