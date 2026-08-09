// ============================================================
// FILE: src/app/components/ui/shared/nav-tabs.tsx
// ============================================================
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavTabsProps {
  tabs: TabItem[];
  variant?: "pills" | "underlined";
}

export function NavTabs({ tabs, variant = "pills" }: NavTabsProps) {
  const pathname = usePathname();

  // Exact match pehle, phir longest prefix match (nested routes ke liye)
  const activeTab =
    tabs.find((tab) => pathname === tab.href) ??
    [...tabs]
      .sort((a, b) => b.href.length - a.href.length)
      .find((tab) => pathname.startsWith(tab.href + "/") || pathname.startsWith(tab.href)) ??
    tabs[0];

  const activeHref = activeTab?.href ?? tabs[0]?.href;

  // ── PILLS ──────────────────────────────────────────────────
  if (variant === "pills") {
    return (
      <div className="flex items-center gap-0.5">
        {tabs.map((tab) => {
          const isActive = tab.href === activeHref;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/25"
                  : "text-neutral-500 hover:bg-white/5 hover:text-neutral-300",
              ].join(" ")}
            >
              {tab.icon && <span className="opacity-70">{tab.icon}</span>}
              {tab.name}
            </Link>
          );
        })}
      </div>
    );
  }

  // ── UNDERLINED ─────────────────────────────────────────────
  return (
    <nav className="flex items-end gap-0">
      {tabs.map((tab) => {
        const isActive = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "relative flex items-center gap-1.5 px-5 pb-3 pt-2 text-sm font-medium transition-colors whitespace-nowrap",
              "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:transition-all",
              isActive
                ? "text-white after:bg-violet-500"
                : "text-neutral-500 after:bg-transparent hover:text-neutral-300 hover:after:bg-white/10",
            ].join(" ")}
          >
            {tab.icon && tab.icon}
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}