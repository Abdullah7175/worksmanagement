import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, List, Image as ImageIcon, Video } from "lucide-react";

const links = [
  {
    href: "/agent/requests/add",
    label: "Add Request",
    icon: <PlusCircle className="w-5 h-5 mr-2" />,
  },
  {
    href: "/agent/requests",
    label: "Request List",
    icon: <List className="w-5 h-5 mr-2" />,
  },
  {
    href: "/agent/images/add",
    label: "Add Image",
    icon: <ImageIcon className="w-5 h-5 mr-2" />,
  },
  {
    href: "/agent/videos/add",
    label: "Add Video",
    icon: <Video className="w-5 h-5 mr-2" />,
  },
];

export function AgentSidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-800">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <span className="text-xl font-bold tracking-wide">Agent Panel</span>
      </div>
      <nav className="flex-1 py-6 px-2 space-y-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base hover:bg-gray-800 hover:text-blue-400 ${active ? "bg-gray-800 text-blue-400" : "text-white"}`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 