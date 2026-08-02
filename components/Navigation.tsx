"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Chart, Zap } from "@/components/icons";

export default function Navigation() {
  const pathname = usePathname();

  // Hide nav on auth & admin pages
  if (pathname.startsWith("/auth/") || pathname.startsWith("/admin/")) return null;

  const tabs = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/stats", label: "Stats", Icon: Chart },
    { href: "/settings", label: "Tasks", Icon: Zap },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)]
                    bg-[var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px]">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold
                          transition-all duration-200
                          ${active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
              <Icon size={20} className={active ? "drop-shadow-[0_0_6px_var(--accent-glow)]" : ""} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
