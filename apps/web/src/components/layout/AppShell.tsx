"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Trophy, Users, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/he", icon: Home, key: "home" as const },
  { href: "/he/tournament", icon: Trophy, key: "tournament" as const },
  { href: "/he/groups", icon: Users, key: "groups" as const },
  { href: "/he/leaderboard", icon: BarChart3, key: "leaderboard" as const },
  { href: "/he/profile", icon: User, key: "profile" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-accent">ChampionsSport</h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-4">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface">
        <div className="mx-auto flex max-w-lg justify-around py-2">
          {navItems.map(({ href, icon: Icon, key }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                  active ? "text-accent" : "text-muted"
                )}
              >
                <Icon size={20} />
                <span>{t(key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
