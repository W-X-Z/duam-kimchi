"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartEntry } from "@/lib/types";

const KEY = "duam-cart-v1";

type CartCtx = {
  ready: boolean;
  entries: CartEntry[];
  count: number;
  add: (menuId: string, option: string, qty: number) => void;
  setQty: (menuId: string, option: string, qty: number) => void;
  remove: (menuId: string, option: string) => void;
  replace: (entries: CartEntry[]) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

function read(): CartEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((e) => e && typeof e.menuId === "string" && typeof e.option === "string" && e.qty > 0)
      : [];
  } catch {
    return [];
  }
}

function write(entries: CartEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage once on mount
    setEntries(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setEntries(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: (prev: CartEntry[]) => CartEntry[]) => {
    setEntries((prev) => {
      const v = next(prev);
      write(v);
      return v;
    });
  }, []);

  const value = useMemo<CartCtx>(
    () => ({
      ready,
      entries,
      count: entries.reduce((n, e) => n + e.qty, 0),
      add: (menuId, option, qty) =>
        commit((prev) => {
          const i = prev.findIndex((e) => e.menuId === menuId && e.option === option);
          if (i < 0) return [...prev, { menuId, option, qty }];
          const copy = [...prev];
          copy[i] = { ...copy[i], qty: Math.min(50, copy[i].qty + qty) };
          return copy;
        }),
      setQty: (menuId, option, qty) =>
        commit((prev) =>
          prev.map((e) =>
            e.menuId === menuId && e.option === option ? { ...e, qty: Math.max(1, Math.min(50, qty)) } : e,
          ),
        ),
      remove: (menuId, option) =>
        commit((prev) => prev.filter((e) => !(e.menuId === menuId && e.option === option))),
      replace: (next) => commit(() => next),
      clear: () => commit(() => []),
    }),
    [entries, ready, commit],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
