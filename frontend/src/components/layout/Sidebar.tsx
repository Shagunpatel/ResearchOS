"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  Home,
  Upload,
  Sparkles,
  Database,
  ArrowUpRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Library",
    href: "/dashboard/papers",
    icon: BookOpen,
  },
  {
    label: "Research Studio",
    href: "/dashboard/research",
    icon: Brain,
  },
  {
    label: "Upload",
    href: "/dashboard/upload",
    icon: Upload,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
            <Sparkles className="h-6 w-6 text-violet-300" />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              ResearchOS
            </h1>

            <p className="text-sm text-zinc-500">
              AI Research Assistant
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
          Workspace
        </p>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200 ${
                  active
                    ? "border border-violet-400/20 bg-violet-400/10 text-white shadow-lg shadow-violet-950/30"
                    : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 transition ${
                      active
                        ? "bg-violet-400/15 text-violet-300"
                        : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </div>

                {active && (
                  <ArrowUpRight className="h-4 w-4 text-violet-300" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-5">
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2">
              <Database className="h-5 w-5 text-emerald-300" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Research Workspace
              </p>

              <p className="text-xs text-zinc-500">
                AI-powered paper analysis
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Version
            </p>

            <p className="mt-1 text-sm font-medium text-zinc-300">
              ResearchOS v1
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}