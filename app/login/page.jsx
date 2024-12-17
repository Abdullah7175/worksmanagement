"use client";

import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import Cookie from "js-cookie";  // Import js-cookie
import { useToast } from "@/hooks/use-toast";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required").min(3, "Password must be at least 3 characters"),
});

export default function SignIn() {
  const {toast}= useToast();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });


        // Check if the response is OK (status code 200)
        if (response.ok) {
          const data = await response.json(); // Parse the response to extract data (including token)
          
          // Successful login, set token in cookie
          Cookie.set("jwtToken", data.token, { expires: 7, secure: true, sameSite: "Strict" });
          localStorage.setItem('jwtToken', data.token)

          // Optionally, redirect to dashboard
          window.location.href = "/dashboard"; // Redirect on successful login
        } else {
          
          alert("Login failed. Please check your credentials.");
        }
      } catch (error) {
        console.error("Login error:", error);
       
      }
    },
  });

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
        <h1 className="text-2xl font-semibold">Video Archiving Portal</h1>
      </div>

      <Card className="mx-auto w-[400px] py-4">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="grid gap-4 mt-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-600 text-sm">{formik.errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-600 text-sm">{formik.errors.password}</p>
              )}
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
