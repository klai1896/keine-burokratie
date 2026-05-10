"use client";

import { useEffect, useState } from "react";

type Props = {
  storageKey: string;
  title: string;
  items: string[];
};

export function Checklist({ storageKey, title, items }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) setChecked(JSON.parse(raw) as Record<number, boolean>);
      } catch {
        /* ignore */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked, storageKey]);

  return (
    <section className="mt-8 rounded-xl border border-border bg-gradient-card p-4 text-card-foreground shadow-soft">
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((label, i) => (
          <li key={label} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-border text-primary"
              checked={Boolean(checked[i])}
              onChange={(e) =>
                setChecked((prev) => ({
                  ...prev,
                  [i]: e.target.checked,
                }))
              }
            />
            <span className="text-sm leading-relaxed text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Checklist state is stored in this browser (local storage) for the MVP.
      </p>
    </section>
  );
}
