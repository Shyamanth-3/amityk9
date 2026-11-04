// Server-only cleanup for photos uploaded straight from the browser (see src/lib/upload.ts).
// A photo lands in the public "media" bucket the moment it's picked, before any row points at it,
// so anything the owner removes, cancels or fails to save has to be deleted here or it stays public forever.
import { MEDIA_PATH, type sessionDb } from "@/lib/supabase";

type Db = Awaited<ReturnType<typeof sessionDb>>;

// Delete uploads that no saved row uses. Paths must be our own folder/uuid.webp names, and anything still
// listed on a service or in the gallery is kept, so a buggy or hostile caller can't wipe live photos.
// If the check itself fails we can't prove a photo is unused, so nothing is deleted.
export async function removeUnsaved(db: Db, paths: unknown): Promise<void> {
  const list = [...new Set((Array.isArray(paths) ? paths : []).map(String).filter((p) => MEDIA_PATH.test(p)))].slice(0, 60);
  if (!list.length) return;
  const [svc, med] = await Promise.all([
    db.from("services").select("images"),
    db.from("media").select("path").in("path", list),
  ]);
  if (svc.error || med.error) return;
  const used = new Set<string>([
    ...(svc.data ?? []).flatMap((r: { images: { path?: string }[] | null }) => (r.images ?? []).map((p) => String(p?.path))),
    ...(med.data ?? []).map((r: { path: string | null }) => String(r.path)),
  ]);
  const unused = list.filter((p) => !used.has(p));
  if (unused.length) await db.storage.from("media").remove(unused);
}
