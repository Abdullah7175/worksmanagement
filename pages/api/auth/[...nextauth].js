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
        try {
          console.log('Starting authentication for:', credentials.email);
          
          const client = await connectToDatabase();
          console.log('Database connected successfully');
          
          // Check users table first
          console.log('Checking users table...');
          let userResult = await client.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
          
          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            console.log('User found in users table, mapped userType: user');
            
            const isValid = await bcrypt.compare(credentials.password, user.password);
            console.log('Verifying password...');
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: user.id, name: user.name, userType: 'user', role: user.role });
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                userType: 'user'
              };
            }
          }
          
          // Check agents table
          let agentResult = await client.query('SELECT * FROM agents WHERE email = $1', [credentials.email]);
          
          if (agentResult.rows.length > 0) {
            const agent = agentResult.rows[0];
            console.log('User found in agents table, mapped userType: agent');
            
            const isValid = await bcrypt.compare(credentials.password, agent.password);
            console.log('Verifying password...');
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: agent.id, name: agent.name, userType: 'agent', role: agent.role });
              return {
                id: agent.id,
                name: agent.name,
                email: agent.email,
                role: agent.role,
                userType: 'agent'
              };
            }
          }
          
          // Check socialmediaperson table
          let smResult = await client.query('SELECT * FROM socialmediaperson WHERE email = $1', [credentials.email]);
          
          if (smResult.rows.length > 0) {
            const sm = smResult.rows[0];
            console.log('User found in socialmediaperson table, mapped userType: socialmedia');
            
            const isValid = await bcrypt.compare(credentials.password, sm.password);
            console.log('Verifying password...');
            
            if (isValid) {
              console.log('Password verified successfully');
              console.log('User authenticated:', { id: sm.id, name: sm.name, userType: 'socialmedia', role: sm.role });
              return {
                id: sm.id,
                name: sm.name,
                email: sm.email,
                role: sm.role,
                userType: 'socialmedia'
              };
            }
          }
          
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
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
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);



