import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  GitCompare,
  Home,
  MessageSquare,
  Settings,
  Upload,
  FlaskConical,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Library", href: "/dashboard/papers", icon: BookOpen },
  { label: "Upload", href: "/dashboard/upload", icon: Upload },
  { label: "Research Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Research Studio", href: "/dashboard/research", icon: GitCompare },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r border-zinc-800 bg-black p-5">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
            <BarChart3 size={20} />
          </div>

          <div>
            <h1 className="font-bold text-white">ResearchOS</h1>
            <p className="text-xs text-zinc-400">AI Research Copilot</p>
          </div>
        </div>
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