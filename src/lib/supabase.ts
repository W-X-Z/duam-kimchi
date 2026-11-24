import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

const options = { auth: { persistSession: false, autoRefreshToken: false } };

/** Read-only client (RLS: public select). Returns null when env is missing. */
export function publicClient(): SupabaseClient | null {
  if (!url || !publishableKey) return null;
  return createClient(url, publishableKey, options);
}

/** Privileged client for admin writes. Server only. */
export function adminClient(): SupabaseClient {
  if (!url || !secretKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY 환경변수가 없습니다.");
  }
  return createClient(url, secretKey, options);
}

export const IMAGE_BUCKET = "images";
