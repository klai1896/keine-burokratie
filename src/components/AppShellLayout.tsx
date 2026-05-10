"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { MobileMenuButton, MobileSidebarDrawer, SidebarNav } from "@/components/SidebarNav";
import { SiteFooter } from "@/components/SiteFooter";

export function AppShellLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-sidebar text-sidebar-foreground">
      <aside className="relative hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border p-4">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-sidebar-foreground">
            Keine Bürokratie
          </Link>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">English UI · non-official helper</p>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 pb-8">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-gradient-hero">
        <MobileSidebarDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/60 px-4 backdrop-blur-md">
          <MobileMenuButton onClick={() => setMobileOpen(true)} />
          <div className="hidden text-sm text-muted-foreground md:block">Berlin paperwork companion</div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://service.berlin.de/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              Service Berlin ↗
            </a>
          </div>
        </header>

        <div className="flex-1">
          <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">{children}</main>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
