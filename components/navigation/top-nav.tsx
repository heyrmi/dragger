"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Settings, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/friends", label: "Friends", icon: Users },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center justify-between border-b border-border bg-bg-surface px-6 py-3">
      <Link
        href="/dashboard"
        className="font-heading text-lg font-bold tracking-tight text-text-primary"
      >
        dragger
      </Link>
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
          className="ml-2 flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
}
