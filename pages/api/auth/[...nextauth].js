
//pages\api\auth\[...nextauth].js
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


// pages/api/auth/[...nextauth].js
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import jwt from "jsonwebtoken";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         try {
//           const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users/login`, {
//             method: "POST",
//             body: JSON.stringify(credentials),
//             headers: { "Content-Type": "application/json" }
//           });

//           const data = await response.json();

//           if (!response.ok) {
//             throw new Error(data.error || "Authentication failed");
//           }

//           if (!data.token) {
//             throw new Error("No token received");
//           }

//           // Verify the JWT token
//           const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          
//           return {
//             id: decoded.userId,
//             name: decoded.name || decoded.email,
//             email: decoded.email,
//             role: decoded.role,
//             userType: decoded.userType,
//             token: data.token // Include the token in the user object
//           };

//         } catch (error) {
//           console.error("Authentication error:", error.message);
//           return null;
//         }
//       }
//     })
//   ],
//   pages: {
//     signIn: "/login",
//     error: "/login"
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt",
//     maxAge: 60 * 60 // 1 hour
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.user = {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           userType: user.userType
//         };
//         token.accessToken = user.token;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user = token.user;
//       session.accessToken = token.accessToken;
//       return session;
//     }
//   }
// };

// export default NextAuth(authOptions);



