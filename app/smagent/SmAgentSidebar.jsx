import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Image as ImageIcon, Video, Download, Upload, Home } from "lucide-react";
import { useSession } from "next-auth/react";

// Role mapping function (same as in page.js)
const getRoleDisplay = (roleId) => {
  const roleMap = {
    1: "CAMERA MAN",
    2: "ASSISTANT", 
    3: "PHOTOGRAPHER",
    4: "VIDEO EDITOR",
    5: "MANAGER",
    6: "CONTENT CREATOR", 
    // Add more mappings as needed
  };
  return roleMap[roleId] || "UNKNOWN ROLE";
};

// Check if user has special role (video editor or manager)
const isSpecialRole = (roleId) => {
  return roleId === 4 || roleId === 5 || roleId === 6; // video_editor or manager
};

export function SmAgentSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Get user role from session with better debugging
  const userRole = session?.user?.role;
  
  // Debug logging
  console.log("Session status:", status);
  console.log("Full session:", session);
  console.log("Session user:", session?.user);
  console.log("userRole in SmAgentSidebar:", userRole, typeof userRole);
  
  // Base links for all social media agents
  const baseLinks = [
    {
      href: "/smagent",
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: "/smagent/assigned-requests",
      label: "Assigned Requests",
      icon: <List className="w-5 h-5" />,
    },
    // {
    //   href: "/smagent/images/add",
    //   label: "Upload Images",
    //   icon: <Upload className="w-5 h-5" />,
    // },
    // {
    //   href: "/smagent/videos/add",
    //   label: "Upload Videos",
    //   icon: <Upload className="w-5 h-5" />,
    // },
  ];

  // Special links for video editors and managers
  const specialLinks = [
    {
      href: "/smagent/final-videos",
      label: "Final Videos",
      icon: <Video className="w-5 h-5" />,
    },
    {
      href: "/smagent/final-videos/add",
      label: "Upload Final Video",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      href: "/smagent/images/download",
      label: "Download Images",
      icon: <Download className="w-5 h-5" />,
    },
    {
      href: "/smagent/videos/download",
      label: "Download Videos",
      icon: <Download className="w-5 h-5" />,
    },
  ];

  // Combine links based on user role
  const links = isSpecialRole(userRole) ? [...baseLinks, ...specialLinks] : baseLinks;

  const getRoleDisplayText = () => {
    if (!userRole) return "Loading...";
    return getRoleDisplay(userRole);
  };

  if (status === "loading") {
    return (
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-800">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <span className="text-xl font-bold tracking-wide">Media Cell</span>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
          Loading...
        </div>
        <nav className="flex-1 py-6 px-2 space-y-2">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-800">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <span className="text-xl font-bold tracking-wide">Media Cell</span>
      </div>
      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
        {getRoleDisplayText()}
      </div>
      <nav className="flex-1 py-6 px-2 space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base hover:bg-gray-800 hover:text-blue-400 ${
                active ? "bg-gray-800 text-blue-400" : "text-white"
              }`}
            >
              {link.icon}
              <span className="ml-2">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 