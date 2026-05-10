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
    <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((label, i) => (
          <li key={label} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={Boolean(checked[i])}
              onChange={(e) =>
                setChecked((prev) => ({
                  ...prev,
                  [i]: e.target.checked,
                }))
              }
            />
            <span className="text-sm leading-relaxed">{label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-500">
        Checklist state is stored in this browser (local storage) for the MVP.
      </p>
    </section>
  );
}
