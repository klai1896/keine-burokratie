"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { journeys, journeyPath } from "@/lib/journeys";

const tools = [
  { href: "/einbuergerungstest", label: "Test slots", emoji: "📅" },
  { href: "/exams", label: "A1 / B1 exams", emoji: "📝" },
] as const;

function navLinkClass(active: boolean) {
  return [
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  ].join(" ");
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Journeys</div>
      <nav className="flex flex-col gap-1">
        {journeys.map((j) => {
          const href = journeyPath[j.slug];
          const active = pathname === href;
          return (
            <Link
              key={j.slug}
              href={href}
              onClick={() => onNavigate?.()}
              className={navLinkClass(active)}
            >
              <span aria-hidden>{j.emoji}</span>
              <span className="leading-snug">{j.title}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        MVP tools
      </div>
      <nav className="flex flex-col gap-1">
        {tools.map((t) => {
          const active = pathname === t.href;
          return (
            <Link key={t.href} href={t.href} onClick={() => onNavigate?.()} className={navLinkClass(active)}>
              <span aria-hidden>{t.emoji}</span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function MobileSidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 flex h-full w-[min(20rem,92vw)] flex-col border-r border-sidebar-border bg-sidebar shadow-pop">
        <div className="border-b border-sidebar-border p-4">
          <p className="font-display text-lg font-semibold text-sidebar-foreground">Keine Bürokratie</p>
          <p className="text-xs text-muted-foreground">Berlin paperwork companion</p>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">English UI · non-official helper</p>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 pb-8">
          <SidebarNav onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background/80 text-foreground shadow-sm md:hidden"
      aria-label="Open navigation menu"
    >
      <span className="text-lg leading-none" aria-hidden>
        ☰
      </span>
    </button>
  );
}
