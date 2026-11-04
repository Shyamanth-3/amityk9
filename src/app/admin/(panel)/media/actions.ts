"use server";
import { revalidatePath } from "next/cache";
import { currentAdmin, MEDIA_PATH, mediaUrl } from "@/lib/supabase";
import { parseVideo, videoUrl } from "@/lib/media";
import { failIf } from "../fail";
import { removeUnsaved } from "@/lib/storage";

async function owner() {
  const a = await currentAdmin();
  if (!a) throw new Error("Not allowed");
  return a.db;
}
const refresh = () => { revalidatePath("/admin/media"); revalidatePath("/gallery"); };

async function nextOrder(db: Awaited<ReturnType<typeof owner>>) {
  const { data } = await db.from("media").select("display_order").order("display_order", { ascending: false }).limit(1).maybeSingle();
  return (data?.display_order ?? 0) + 1;
}

// Photos are already in the bucket (uploaded from the browser); this records them in the gallery.
// Any that can't be recorded (over the 30 limit, or a failed insert) are deleted so they don't sit in the public bucket.
export async function addPhotos(paths: string[]) {
  const db = await owner();
  const valid = (Array.isArray(paths) ? paths : []).map(String).filter((p) => MEDIA_PATH.test(p) && p.startsWith("gallery/"));
  const ok = valid.slice(0, 30);
  await removeUnsaved(db, valid.slice(30));
  if (!ok.length) return;
  const start = await nextOrder(db);
  const { error } = await db.from("media").insert(ok.map((path, i) => ({ kind: "photo", path, url: mediaUrl(path), display_order: start + i })));
  if (error) await removeUnsaved(db, ok); // delete first: failIf redirects
  await failIf({ error }, "The photos couldn't be added to the gallery. Please upload them again.");
  refresh();
  await failIf({ error: valid.length > 30 }, "Only the first 30 photos were added. Upload the rest in another batch.");
}

export async function addVideo(_: string | null, f: FormData): Promise<string | null> {
  const db = await owner();
  const v = parseVideo(String(f.get("url") ?? ""));
  if (!v) return "Paste a YouTube or Instagram link (for example https://youtu.be/… or https://www.instagram.com/reel/…).";
  const { error } = await db.from("media").insert({
    kind: "video", url: videoUrl(v), caption: String(f.get("caption") ?? "").trim().slice(0, 200), display_order: await nextOrder(db),
  });
  if (error) return "Couldn't add that video. Please try again.";
  refresh();
  return null;
}

export async function updateMedia(id: string, f: FormData) {
  const db = await owner();
  await failIf(await db.from("media").update({ caption: String(f.get("caption") ?? "").trim().slice(0, 200), published: f.get("published") === "on" }).eq("id", id),
    "Couldn't save that change. Please try again.");
  refresh();
}

export async function moveMedia(id: string, dir: -1 | 1) {
  const db = await owner();
  const read = await db.from("media").select("id").order("display_order");
  await failIf(read, "Couldn't move that item. Please try again.");
  const list = read.data ?? [];
  const i = list.findIndex((r) => r.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await failIf(await Promise.all(list.map((r, k) => db.from("media").update({ display_order: k + 1 }).eq("id", r.id))),
    "Couldn't save the new order. Refresh the page to check it.");
  refresh();
}

// Gallery items aren't booking history, so they're deleted for good, photo file included.
export async function deleteMedia(id: string) {
  const db = await owner();
  const { data } = await db.from("media").select("path").eq("id", id).maybeSingle();
  const { error } = await db.from("media").delete().eq("id", id);
  await failIf({ error }, "Couldn't delete that item. Please try again.");
  if (!error && data?.path) await db.storage.from("media").remove([data.path]);
  refresh();
}
