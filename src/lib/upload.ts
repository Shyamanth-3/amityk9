"use client";
// Photo uploads from the admin, straight from the browser to the Supabase "media" bucket.
// The owner's session cookie travels with the request, so the bucket's owner-only policies apply.
import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;
const db = () => (client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

export type Uploaded = { path: string; url: string };
export type Encoded = { blob: Blob; contentType: "image/webp" | "image/jpeg"; ext: "webp" | "jpg" };

const MAX_SIDE = 1800;
const BUCKET_LIMIT = 5 * 1024 * 1024; // the "media" bucket's file_size_limit (002_media.sql)
// HEIC/HEIF only gets through when the browser itself can decode it (Safari); elsewhere decoding fails and the file is reported as failed.
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
// Tried in order until the result fits under the bucket limit: [scale of the 1800px size, quality].
const ATTEMPTS: [number, number][] = [[1, 0.82], [1, 0.7], [0.75, 0.7], [0.5, 0.6]];

// Decode with EXIF orientation applied so portrait phone photos don't come out sideways.
// Older browsers that reject the option fall back to the default (which modern browsers also orient).
async function decode(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return createImageBitmap(file);
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, quality));

// Resize to at most 1800px on the long side and re-encode. WebP where the browser can encode it;
// browsers that can't (Safari/iOS) silently hand back a PNG for "image/webp", so check blob.type and
// use JPEG instead, painted onto white because JPEG has no transparency. Shrinks further if still too big.
export async function encodeImage(bmp: ImageBitmap): Promise<Encoded> {
  let webp = true;
  for (const [scale, quality] of ATTEMPTS) {
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height)) * scale;
    const canvas = Object.assign(document.createElement("canvas"), {
      width: Math.max(1, Math.round(bmp.width * k)),
      height: Math.max(1, Math.round(bmp.height * k)),
    });
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    const draw = (background?: string) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    };

    let out: Encoded | undefined;
    if (webp) {
      draw();
      const b = await toBlob(canvas, "image/webp", quality);
      if (b?.type === "image/webp") out = { blob: b, contentType: "image/webp", ext: "webp" };
      else webp = false; // PNG (or nothing) came back: this browser can't encode WebP, stop asking
    }
    if (!out) {
      draw("#fff");
      const b = await toBlob(canvas, "image/jpeg", quality);
      if (b?.type !== "image/jpeg") throw new Error("encode");
      out = { blob: b, contentType: "image/jpeg", ext: "jpg" };
    }
    if (out.blob.size <= BUCKET_LIMIT) return out;
  }
  throw new Error("size");
}

async function shrink(file: File): Promise<Encoded> {
  const bmp = await decode(file);
  try {
    return await encodeImage(bmp);
  } finally {
    bmp.close();
  }
}

export async function uploadPhotos(files: File[], folder: string, onProgress?: (done: number) => void): Promise<{ uploaded: Uploaded[]; failed: string[] }> {
  const uploaded: Uploaded[] = [], failed: string[] = [];
  for (const [i, file] of files.entries()) {
    try {
      if (!ACCEPT.includes(file.type)) throw new Error("type");
      if (file.size > 25 * 1024 * 1024) throw new Error("size");
      const { blob, contentType, ext } = await shrink(file);
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await db().storage.from("media").upload(path, blob, { contentType, cacheControl: "31536000" });
      if (error) throw error;
      uploaded.push({ path, url: db().storage.from("media").getPublicUrl(path).data.publicUrl });
    } catch {
      failed.push(file.name);
    }
    onProgress?.(i + 1);
  }
  return { uploaded, failed };
}
