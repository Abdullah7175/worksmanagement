import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db"; // Ensure your DB connection is correctly configured
import jwt from "jsonwebtoken";

// Login API endpoint
export async function POST(req) {
  const { email, password } = await req.json(); // Get login credentials from the request

  try {
    const client = await connectToDatabase();

    // Query user by email
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = result.rows[0];

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT token
    const payload = { userId: user.id, email: user.email }; // Data to store in the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send the token back to the client
    return NextResponse.json(
      {
        message: "Login successful",
        token, // Send the token back to the client
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Error during login" }, { status: 500 });
  }
}
