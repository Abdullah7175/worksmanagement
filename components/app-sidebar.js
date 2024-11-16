"use client"

import { usePathname } from "next/navigation";
import { Users, Home, ListTodo, Signature, LogOut, ChevronDown, Youtube, ChartPie } from "lucide-react";
import Image from "next/image";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import Link from "next/link";

const items = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Videos",
        url: "/dashboard/videos",
        icon: Youtube,
    },
    {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
    },
    {
        title: "Agents",
        url: "/dashboard/agents",
        icon: Signature,
    },
    {
        title: "Reports",
        url: "/dashboard/reports",
        icon: ChartPie,
    },
    {
        title: "Logout",
        url: "/logout",
        icon: LogOut,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2">
                            <div className="flex items-center justify-center gap-2">
                                <Image src="/logo.png" className="py-2 px-1" width="150" height="150" alt="logo" />
                            </div>
                            <Card className="mb-3 bg-transparent bg-white py-1 mt-3">
                                <CardContent className="p-0 flex items-center gap-3 px-4 py-2">
                                    <Image src="/babar.webp" className="rounded-xl" width="40" height="40" alt="logo" />
                                    <p className="text-muted-foreground">Hassan</p>
                                </CardContent>
                            </Card>

                            {/* Render the "Home" item first */}
                            {items.slice(0, 1).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className={`text-base gap-2 py-6 px-2 ${pathname === item.url ? "font-bold text-blue-950" : ""}`}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            {/* "More Options" section goes after "Home" */}
                            <Collapsible className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className={`text-base gap-2 py-6`}>
                                            <Signature className="w-5 h-5" />
                                            <span>Complaint Control</span>
                                            <ChevronDown />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem
                                                className={`py-2 text-base ml-2 mt-1 text-gray-500 underline ${pathname === "/dashboard/complaints" ? "font-bold text-blue-950" : ""}`}
                                            >
                                                <Link href="/dashboard/complaints">
                                                    <span>All Complaints</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem
                                                className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/complaints/types" ? "font-bold text-blue-950" : ""}`}
                                            >
                                                <Link href="/dashboard/complaints/types">
                                                    <span>Add New Type</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem
                                                className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/complaints/sub-types" ? "font-bold text-blue-950" : ""}`}
                                            >
                                                <Link href="/dashboard/complaints/sub-types">
                                                    <span>Add New Subtype</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>

                            {/* Render the remaining items (excluding "Home") */}
                            {items.slice(1).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className={`text-base gap-2 py-6 px-2 ${pathname === item.url ? "font-bold text-blue-950" : ""}`}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-sm p-4 text-gray-400">
                &copy; copyright 2024
            </SidebarFooter>
        </Sidebar>
    );
}
