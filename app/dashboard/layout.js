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
import { useSession } from "next-auth/react";

export default function Layout({ children }) {
    const router = useRouter();
    const { setUser } = useUserContext ? useUserContext() : { setUser: null };
    const { data: session } = useSession ? useSession() : { data: null };
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
      const userId = session?.user?.id || (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}').id);
      if (!userId) return;
      const fetchNotifications = async () => {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications((data.data || []).filter(n => n.user_id === userId));
        }
      };
      fetchNotifications();
    }, [session?.user?.id]);

    const handleNotificationClick = async (notif) => {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id })
      });
      setNotifications(notifications.filter(n => n.id !== notif.id));
      // Optionally, navigate to request or assignment if notif.type/entity_id
    };

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
                        <div className="relative">
                          <button onClick={() => setShowDropdown(v => !v)} className="relative">
                            <Bell className="w-5 h-5" />
                            {notifications.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notifications.length}</span>
                            )}
                          </button>
                          {showDropdown && notifications.length > 0 && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                              <div className="p-2 font-semibold border-b">Notifications</div>
                              <ul>
                                {notifications.map(n => (
                                  <li key={n.id} className="p-2 hover:bg-gray-100 border-b last:border-b-0 cursor-pointer" onClick={() => handleNotificationClick(n)}>
                                    <div className="font-medium text-black">{n.message || "No message"}</div>
                                    <div className="text-xs text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                    </div>
                </div>
                {children}
                <Toaster />
            </main>
        </SidebarProvider>
    );
}