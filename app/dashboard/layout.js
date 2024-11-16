import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"


export default function Layout({ children }) {
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
                    <div>
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
