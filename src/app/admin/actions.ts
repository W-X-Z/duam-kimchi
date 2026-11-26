"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { adminClient, IMAGE_BUCKET } from "@/lib/supabase";
import { SITE_TAG } from "@/lib/data";
import {
  SESSION_COOKIE,
  checkPassword,
  createSessionToken,
  isAdmin,
} from "@/lib/auth";
import type { OrderStatus, PriceOption, SiteSettings } from "@/lib/types";

export type FormState = { ok?: boolean; error?: string; at?: number };

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있어요.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${randomUUID()}.${ext || "jpg"}`;
  const db = adminClient();
  const { error } = await db.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("사진 업로드에 실패했어요.");
  return db.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function pickFile(fd: FormData, key: string) {
  const f = fd.get(key);
  return f instanceof File && f.size > 0 ? f : null;
}

/* ---------- Auth ---------- */

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const password = str(fd, "password");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800));
    return { error: "비밀번호가 맞지 않아요." };
  }
  const { token, maxAge } = createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  redirect("/admin/orders");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- Menu ---------- */

function parseOptions(fd: FormData): PriceOption[] {
  const labels = fd.getAll("option_label").map((v) => String(v).trim());
  const prices = fd.getAll("option_price").map((v) => String(v).replace(/[^0-9]/g, ""));
  const out: PriceOption[] = [];
  labels.forEach((label, i) => {
    const price = Number(prices[i]);
    if (label && prices[i]) out.push({ label, price });
  });
  return out;
}

export async function saveMenuItem(_: FormState, fd: FormData): Promise<FormState> {
  await guard();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return { error: "메뉴 이름을 입력해 주세요." };
  const options = parseOptions(fd);
  if (options.length === 0) return { error: "중량과 가격을 하나 이상 입력해 주세요." };

  const db = adminClient();
  const row: Record<string, unknown> = {
    name,
    tag: str(fd, "tag"),
    options,
    is_soldout: fd.get("is_soldout") === "on",
    is_visible: fd.get("is_visible") === "on",
    updated_at: new Date().toISOString(),
  };

  try {
    const file = pickFile(fd, "image");
    if (file) row.image_url = await uploadImage(file, "menu");
    else if (fd.get("remove_image") === "on") row.image_url = null;

    if (id) {
      const { error } = await db.from("menu_items").update(row).eq("id", id);
      if (error) throw error;
    } else {
      const { data: last } = await db
        .from("menu_items")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      row.sort_order = (last?.sort_order ?? 0) + 1;
      const { error } = await db.from("menu_items").insert(row);
      if (error) throw error;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "저장하지 못했어요." };
  }

  updateTag(SITE_TAG);
  redirect("/admin");
}

export async function deleteMenuItem(fd: FormData) {
  await guard();
  const id = str(fd, "id");
  if (id) await adminClient().from("menu_items").delete().eq("id", id);
  updateTag(SITE_TAG);
  redirect("/admin");
}

export async function toggleMenuFlag(fd: FormData) {
  await guard();
  const id = str(fd, "id");
  const field = str(fd, "field");
  if (!id || (field !== "is_soldout" && field !== "is_visible")) return;
  const value = str(fd, "value") === "true";
  await adminClient().from("menu_items").update({ [field]: value }).eq("id", id);
  updateTag(SITE_TAG);
  redirect("/admin");
}

export async function moveMenuItem(fd: FormData) {
  await guard();
  const id = str(fd, "id");
  const dir = str(fd, "dir");
  const db = adminClient();
  const { data } = await db
    .from("menu_items")
    .select("id")
    .order("sort_order")
    .order("created_at");
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) redirect("/admin");
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((mid, idx) => db.from("menu_items").update({ sort_order: idx + 1 }).eq("id", mid)),
  );
  updateTag(SITE_TAG);
  redirect("/admin");
}

/* ---------- Settings ---------- */

const SETTING_FIELDS: (keyof SiteSettings)[] = [
  "shop_name",
  "tagline",
  "intro",
  "phone",
  "kakao_url",
  "instagram_url",
  "address",
  "bank_name",
  "account_number",
  "account_holder",
  "order_guide",
  "menu_intro",
  "shipping_guide",
  "business_info",
];

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await guard();
  const row: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
  for (const key of SETTING_FIELDS) row[key] = str(fd, key);
  if (!row.shop_name) return { error: "가게 이름을 입력해 주세요." };
  const fee = str(fd, "shipping_fee_amount").replace(/[^0-9]/g, "");
  const freeOver = str(fd, "free_shipping_over").replace(/[^0-9]/g, "");
  row.shipping_fee_amount = fee ? Number(fee) : 0;
  row.free_shipping_over = freeOver ? Number(freeOver) : null;
  const minOrder = str(fd, "min_order_amount").replace(/[^0-9]/g, "");
  row.min_order_amount = minOrder ? Number(minOrder) : 0;

  try {
    const file = pickFile(fd, "hero_image");
    if (file) row.hero_image_url = await uploadImage(file, "hero");
    else if (fd.get("remove_hero_image") === "on") row.hero_image_url = null;
    const { error } = await adminClient().from("site_settings").upsert(row);
    if (error) throw error;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "저장하지 못했어요." };
  }

  updateTag(SITE_TAG);
  return { ok: true, at: Date.now() };
}

/* ---------- Orders ---------- */

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export async function updateOrder(_: FormState, fd: FormData): Promise<FormState> {
  await guard();
  const id = str(fd, "id");
  const status = str(fd, "status") as OrderStatus;
  if (!id || !STATUSES.includes(status)) return { error: "잘못된 요청이에요." };
  const { error } = await adminClient()
    .from("orders")
    .update({ status, tracking_no: str(fd, "tracking_no"), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "저장하지 못했어요." };
  return { ok: true, at: Date.now() };
}

/* ---------- Menu board (bulk edit) ---------- */

export async function saveMenuBoard(_: FormState, fd: FormData): Promise<FormState> {
  await guard();
  const count = Math.min(Number(fd.get("row_count")) || 0, 60);
  const db = adminClient();

  const { data: existingRows, error: readErr } = await db.from("menu_items").select("id,options");
  if (readErr) return { error: "저장하지 못했어요." };
  const existing = new Map((existingRows ?? []).map((r) => [r.id as string, (r.options as PriceOption[]) ?? []]));

  type Op = { id?: string; name: string; label: string; price: number; soldout: boolean; order: number };
  const upserts: Op[] = [];
  const deletes: string[] = [];
  let order = 0;

  for (let i = 0; i < count; i++) {
    const id = str(fd, `id_${i}`);
    const name = str(fd, `name_${i}`);
    const label = str(fd, `weight_${i}`);
    const priceRaw = str(fd, `price_${i}`).replace(/[^0-9]/g, "");
    const soldout = fd.get(`soldout_${i}`) === "on";

    if (fd.get(`delete_${i}`) === "on") {
      if (id) deletes.push(id);
      continue;
    }
    if (!name && !label && !priceRaw) continue; // empty row
    if (!name) return { error: `${i + 1}번 칸에 김치 이름을 적어 주세요.` };
    if (!priceRaw) return { error: `${name} 가격을 적어 주세요.` };
    const price = Number(priceRaw);
    if (price < 100 || price > 10_000_000) return { error: `${name} 가격을 확인해 주세요.` };
    order += 1;
    upserts.push({ id: id || undefined, name, label: label || "1kg", price, soldout, order });
  }

  try {
    if (deletes.length) {
      const { error } = await db.from("menu_items").delete().in("id", deletes);
      if (error) throw error;
    }
    for (const op of upserts) {
      const prevRest = op.id ? (existing.get(op.id) ?? []).slice(1) : [];
      const row = {
        name: op.name,
        options: [{ label: op.label, price: op.price }, ...prevRest],
        is_soldout: op.soldout,
        sort_order: op.order,
        updated_at: new Date().toISOString(),
      };
      const { error } = op.id
        ? await db.from("menu_items").update(row).eq("id", op.id)
        : await db.from("menu_items").insert(row);
      if (error) throw error;
    }
  } catch {
    return { error: "저장하지 못했어요. 다시 눌러 주세요." };
  }

  updateTag(SITE_TAG);
  redirect("/admin?saved=1");
}
