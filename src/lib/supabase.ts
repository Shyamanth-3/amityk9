// Supabase clients. Keys come from .env.local (see .env.example); only the public anon key is used,
// and the database's row-level security decides what each visitor may read or write.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured: copy .env.example to .env.local and fill in both values.");
  return { url, key };
}

// Files in the public "media" bucket. Paths come from our own uploads (folder/uuid.webp, or folder/uuid.jpg where the browser cannot encode WebP); URLs are rebuilt here, never trusted from the browser.
export const MEDIA_PATH = /^(services|gallery)\/[0-9a-f-]{36}\.(webp|jpg)$/;
export const mediaUrl = (path: string) => `${supabaseEnv().url}/storage/v1/object/public/media/${path}`;

// Public visitors: no session, sees only what the policies allow the anon role (published services).
export function publicDb() {
  const { url, key } = supabaseEnv();
  return createClient(url, key, { auth: { persistSession: false } });
}

// Owner session from cookies, for admin pages and server actions.
export async function sessionDb() {
  const { url, key } = supabaseEnv();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        // Server Components can't set cookies; the proxy refreshes the session for them
        try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {}
      },
    },
  });
}

// The signed-in user, only if they are on the admins list.
export async function currentAdmin() {
  const db = await sessionDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? { db, user } : null;
}
