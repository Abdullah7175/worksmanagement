"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from 'next-auth/react';
import { useUserContext } from "@/context/UserContext";

export default function Layout({ children }) {
    const router = useRouter();
    const { setUser } = useUserContext ? useUserContext() : { setUser: null };
   
    const handleLogout = async () => {
      await signOut({ redirect: false });
      localStorage.removeItem('jwtToken');
      document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      if (setUser) setUser(null);
      router.push('/login');
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="h-16 border-b w-full bg-gray-800 text-white flex items-center justify-between p-4 shadow-sm">
                    <div className="flex gap-4 items-center">
                        <SidebarTrigger />
                        <h1 className="text-2xl font-semibold hidden md:block">Works Management Portal</h1>
                        <h1 className="text-2xl font-bold block md:hidden">WMP</h1>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={handleLogout} variant="secondary" className="border px-3">
                            <LogOut className="w-5 h-5" />
                        </Button>
                        <Button variant="secondary" className="border px-3">
                            <Bell className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
                {children}
                <Toaster />
            </main>
        </SidebarProvider>
    );
}