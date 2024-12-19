import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import pool from '@/lib/db'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ user, account }) {
      console.log("Sign in attempt:", { user, account })
      if (account.provider === "google") {
        try {
          // Check if user exists
          const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [user.email]
          )

          if (rows.length === 0) {
            // Create new user if doesn't exist
            await pool.query(
              'INSERT INTO users (email, name, image) VALUES (?, ?, ?)',
              [user.email, user.name, user.image]
            )
          }
          return true
        } catch (error) {
          console.error('Database error:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token })
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
  },
  // Tambahkan konfigurasi redirect
  redirect: {
    afterSignIn: '/',      // Redirect ke dashboard setelah login
    afterSignOut: '/auth/login'  // Redirect ke login setelah logout
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 