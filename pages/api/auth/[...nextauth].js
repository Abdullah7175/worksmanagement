import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorization started...");
        console.log("Received credentials:", credentials);
        
        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          console.log("API response status:", res.status);

          if (!res.ok) {
            console.error("Failed to authenticate user:", await res.text());
            return null;
          }

          const user = await res.json();

          console.log("Received user from API:", user);

          return user ? user : null;

        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // Custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for encryption
});

export { handler as GET, handler as POST };
