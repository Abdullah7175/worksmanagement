"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignIn() {
  const [csrfToken, setCsrfToken] = useState(null);

  // Fetch CSRF token when the component mounts
  useEffect(() => {
    async function fetchCsrfToken() {
      const response = await fetch("/api/auth/csrf");
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    }

    fetchCsrfToken();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
  
    // Send data to the NextAuth API for authentication
    const response = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      body: new URLSearchParams(data), // Send as form-urlencoded data
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  
    const result = await response.json();
  
    if (response.ok && result?.user) {
      // Successfully logged in, redirect to another page
      window.location.href = "/dashboard"; // or wherever you want to redirect
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  // If CSRF token is not available yet
  // if (!csrfToken) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div
      className="flex flex-col h-screen w-full items-center pt-10 md:pt-28 px-4 border-t-8 border-blue-100"
      style={{
        backgroundImage: `url('/pattern.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex items-center justify-center gap-0">
        <Image src="/logo.png" className="py-0 px-1" width="150" height="150" alt="logo" />
      </div>
      <div className="flex gap-4 items-center mb-8">
        <h1 className="text-2xl font-semibold">Works Management Portal</h1>
      </div>

      <Card className="mx-auto w-[400px] py-4">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 mt-6">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="username" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-950">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
