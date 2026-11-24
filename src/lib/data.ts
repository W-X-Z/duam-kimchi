import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { adminClient, publicClient } from "./supabase";
import { DEFAULT_SETTINGS, type MenuItem, type Order, type OrderStatus, type SiteSettings } from "./types";

export const SITE_TAG = "site";

const MENU_COLUMNS =
  "id,name,description,detail,tag,image_url,options,is_soldout,is_visible,sort_order";

function normalizeSettings(row: Partial<SiteSettings> | null): SiteSettings {
  const merged = { ...DEFAULT_SETTINGS };
  if (!row) return merged;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const v = row[key];
    if (v !== undefined && v !== null) (merged as Record<string, unknown>)[key] = v;
  }
  return merged;
}

/* ---------- Public (cached; invalidated by updateTag(SITE_TAG)) ---------- */

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  const db = publicClient();
  if (!db) return DEFAULT_SETTINGS;
  const { data } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return normalizeSettings(data);
}

export async function getMenu(): Promise<MenuItem[]> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  const db = publicClient();
  if (!db) return [];
  const { data } = await db
    .from("menu_items")
    .select(MENU_COLUMNS)
    .eq("is_visible", true)
    .order("sort_order")
    .order("created_at");
  return (data as MenuItem[] | null) ?? [];
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const menu = await getMenu();
  return menu.find((m) => m.id === id) ?? null;
}

/* ---------- Orders (never cached) ---------- */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Order lookup by its unguessable id (used by the order-complete page). */
export async function getOrder(id: string): Promise<Order | null> {
  if (!UUID_RE.test(id)) return null;
  const { data } = await adminClient().from("orders").select("*").eq("id", id).maybeSingle();
  return (data as Order | null) ?? null;
}

export async function adminGetOrders(status?: OrderStatus): Promise<Order[]> {
  let q = adminClient().from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Order[]) ?? [];
}

export async function adminCountOrders(): Promise<Record<OrderStatus, number>> {
  const { data } = await adminClient().from("orders").select("status");
  const counts: Record<OrderStatus, number> = { pending: 0, paid: 0, shipped: 0, cancelled: 0 };
  for (const r of data ?? []) counts[r.status as OrderStatus]++;
  return counts;
}

/* ---------- Admin (always fresh) ---------- */

export async function adminGetSettings(): Promise<SiteSettings> {
  const { data } = await adminClient()
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return normalizeSettings(data);
}

export async function adminGetMenu(): Promise<MenuItem[]> {
  const { data, error } = await adminClient()
    .from("menu_items")
    .select(MENU_COLUMNS)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data as MenuItem[]) ?? [];
}

export async function adminGetMenuItem(id: string): Promise<MenuItem | null> {
  const { data } = await adminClient()
    .from("menu_items")
    .select(MENU_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as MenuItem | null) ?? null;
}
