"use client"
import { UserProvider, useUserContext } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { Users, Home, ListTodo, Signature, LogOut, ChevronDown, Youtube, ChartPie, Archive, CircleCheck, UserRoundPen, UserIcon } from "lucide-react";
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
import { role } from "@/lib/utils";
import React from "react";

const items = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
        visible: [1, 2, 3, 4]
    },
    {
        title: "Roles",
        url: "/dashboard/roles",
        icon: UserRoundPen,
        visible: [1, 2, 3, 4]
    },
    {
        title: "Videos",
        url: "/dashboard/videos",
        icon: Youtube,
        visible: [1, 2, 3, 4]
    },
    {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
        visible: [1, 3, 4]
    },
    {
        title: "Agents",
        url: "/dashboard/agents",
        icon: Signature,
        visible: [1, 4]
    },
    {
        title: "Social Media Agents",
        url: "/dashboard/socialmediaagent",
        icon: Archive,
        visible: [1, 3, 4]
    },
    {
        title: "Reports",
        url: "/dashboard/reports",
        icon: ChartPie,
        visible: [1, 2, 3, 4]
    },
    {
        title: "Logout",
        url: "/logout",
        icon: LogOut,
        visible: [1, 2, 3, 4]
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    // const { user } = useUserContext();
    return (
       <UserProvider>
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2">
                            {/* Logo Section */}
                            <div className="flex items-center justify-center gap-2">
                                <Image src="/logo.png" className="py-2 px-1" width="150" height="150" alt="logo" />
                            </div>

                            {/* User Profile Section */}
                            <Card className="mb-1 bg-transparent bg-white py-1 mt-1">
                                <CardContent className="p-0 flex items-center gap-3 px-4 py-2">
                                    <Image src="/babar.webp" className="rounded-xl" width="40" height="40" alt="profile" />
                                    <p className="text-muted-foreground">Hassan</p>
                                </CardContent>
                            </Card>

                            {/* Home Section */}
                            {items.map((item, index) => {
                                if (index === 0 && item.visible.includes(role)) {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className={`text-base gap-2 py-6 px-2 ${pathname === item.url ? "font-bold text-blue-950" : ""
                                                    }`}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className="w-5 h-5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
                                return null;
                            })}

                            {/* Access Control Section */}
                            {role && (
                                <Collapsible className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className={`text-base gap-2 py-6`}>
                                                <CircleCheck className="w-5 h-5" />
                                                <span>Access Control</span>
                                                <ChevronDown />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/access/exen" ? "font-bold text-blue-950" : ""
                                                        }`}
                                                >
                                                    <Link href="/dashboard/access/exen">
                                                        <span>ExEn</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/access/user" ? "font-bold text-blue-950" : ""
                                                        }`}
                                                >
                                                    <Link href="/dashboard/access/user">
                                                        <span>User</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/access/social" ? "font-bold text-blue-950" : ""
                                                        }`}
                                                >
                                                    <Link href="/dashboard/access/social">
                                                        <span>Social Media Person</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )}

                            {/* Complaint Control Section */}
                            {role && (
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
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/complaints" ? "font-bold text-blue-950" : ""
                                                        }`}
                                                >
                                                    <Link href="/dashboard/complaints">
                                                        <span>All Complaints</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/complaints/types" ? "font-bold text-blue-950" : ""
                                                        }`}
                                                >
                                                    <Link href="/dashboard/complaints/types">
                                                        <span>Add New Type</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/complaints/sub-types" ? "font-bold text-blue-950" : ""
                                                        }`}
                                                >
                                                    <Link href="/dashboard/complaints/sub-types">
                                                        <span>Add New Subtype</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )}

                            {/* Render Remaining Items */}
                            {items.slice(1).map((item) => {
                                if (item.visible.includes(role)) {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className={`text-base gap-2 py-6 px-2 ${pathname === item.url ? "font-bold text-blue-950" : ""
                                                    }`}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className="w-5 h-5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
                                return null;
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-sm p-4 text-gray-400">&copy; copyright 2025</SidebarFooter>
        </Sidebar>
        </UserProvider>
    );

}
