import Link from "next/link";
import {
  BookOpen,
  Brain,
  Home,
  Settings,
  Upload,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Library", href: "/dashboard/papers", icon: BookOpen },
  { label: "Research Studio", href: "/dashboard/research", icon: Brain },
  { label: "Upload", href: "/dashboard/upload", icon: Upload },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r border-zinc-800 bg-black p-5">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h1 className="font-bold text-white">ResearchOS</h1>
        <p className="mt-1 text-xs text-zinc-400">AI Research Platform</p>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}