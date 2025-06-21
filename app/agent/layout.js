"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AgentSidebar } from "./AgentSidebar";
import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function Layout({ children }) {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
      setLoading(true);
      try {
        await signOut({ 
          redirect: true,
          callbackUrl: '/login'
        });
      } catch (error) {
        console.error('Logout error:', error);
        setLoading(false);
      }
    };

    return (
        <SidebarProvider>
            <AgentSidebar />
            <main className="w-full">
                <div className="h-16 border-b w-full bg-gray-800 text-white flex items-center justify-between p-4 shadow-sm">
                    <div className="flex gap-4 items-center">
                        <SidebarTrigger />
                        <h1 className="text-2xl font-semibold hidden md:block">Works Management Portal</h1>
                        <h1 className="text-2xl font-bold block md:hidden">WMP</h1>
                    </div>
                    <div className="flex gap-4">
                        <Button 
                          onClick={handleLogout} 
                          variant="secondary" 
                          className="border px-3"
                          disabled={loading}
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
                {children}
                <Toaster />
            </main>
        </SidebarProvider>
    );
}
