"use client";
// Photo uploads from the admin, straight from the browser to the Supabase "media" bucket.
// The owner's session cookie travels with the request, so the bucket's owner-only policies apply.
import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;
const db = () => (client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

export type Uploaded = { path: string; url: string };

const MAX_SIDE = 1800;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

// Resize to at most 1800px on the long side and re-encode as WebP: a 6 MB phone photo ends up ~200–400 KB.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = Object.assign(document.createElement("canvas"), { width: Math.round(bmp.width * k), height: Math.round(bmp.height * k) });
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("encode"))), "image/webp", 0.82));
}

export async function uploadPhotos(files: File[], folder: string, onProgress?: (done: number) => void): Promise<{ uploaded: Uploaded[]; failed: string[] }> {
  const uploaded: Uploaded[] = [], failed: string[] = [];
  for (const [i, file] of files.entries()) {
    try {
      if (!ACCEPT.includes(file.type)) throw new Error("type");
      if (file.size > 25 * 1024 * 1024) throw new Error("size");
      const blob = await shrink(file);
      const path = `${folder}/${crypto.randomUUID()}.webp`;
      const { error } = await db().storage.from("media").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
      if (error) throw error;
      uploaded.push({ path, url: db().storage.from("media").getPublicUrl(path).data.publicUrl });
    } catch {
      failed.push(file.name);
    }
    onProgress?.(i + 1);
  }
  return { uploaded, failed };
}
