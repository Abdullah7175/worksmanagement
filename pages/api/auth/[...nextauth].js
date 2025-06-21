// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        let client;
        try {
          console.log("Starting authentication for:", credentials.email);
          client = await connectToDatabase();
          console.log("Database connected successfully");

          // Check in all user tables
          const userTypes = [
            { table: 'users', query: 'SELECT * FROM users WHERE email = $1' },
            { table: 'agents', query: 'SELECT * FROM agents WHERE email = $1' },
            { table: 'socialmediaperson', query: 'SELECT * FROM socialmediaperson WHERE email = $1' }
          ];

          let user = null;
          let userType = null;

          for (const { table, query } of userTypes) {
            console.log(`Checking ${table} table...`);
            const result = await client.query(query, [credentials.email]);
            if (result.rows.length > 0) {
              user = result.rows[0];
              // Map table name to singular type
              if (table === 'users') userType = 'user';
              else if (table === 'agents') userType = 'agent';
              else if (table === 'socialmediaperson') userType = 'socialmedia';
              else userType = table;
              console.log(`User found in ${table} table, mapped userType: ${userType}`);
              break;
            }
          }

          if (!user) {
            console.error("User not found:", credentials.email);
            return null;
          }

          // Verify password
          console.log("Verifying password...");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.error("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("Password verified successfully");
          console.log("User authenticated:", { id: user.id, name: user.name, userType });

          // Return user data for NextAuth
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            userType: userType // always singular now
          };

        } catch (error) {
          console.error("Authentication error:", error.message);
          console.error("Full error:", error);
          return null;
        } finally {
          if (client && client.release) {
            client.release();
          }
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here-make-it-long-and-random",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 // 1 hour
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          userType: user.userType
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    }
  }
};

export default NextAuth(authOptions);



