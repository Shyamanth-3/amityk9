"use client";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { keepInput } from "@/lib/keepInput";
import PhotoPicker from "../../PhotoPicker";
import { addPhotos, addVideo, deleteMedia } from "./actions";
import { discardUploads } from "../../uploads";
import s from "../../admin.module.css";

export function GalleryUpload() {
  const router = useRouter();
  const [, start] = useTransition();
  const save = async (paths: string[]) => {
    try {
      await addPhotos(paths); // if recording fails the server deletes the uploads and shows the error
    } catch {
      // the request itself failed: clean up; the server keeps any photo that did get recorded
      await discardUploads(paths).catch(() => {});
    }
    router.refresh();
  };
  return <PhotoPicker folder="gallery" label="+ Upload photos" onUploaded={(list) => start(() => save(list.map((u) => u.path)))} />;
}

export function VideoForm() {
  const [error, action, pending] = useActionState(addVideo, null);
  const form = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);
  // Inputs survive an error; clear them only once the video was actually added.
  useEffect(() => {
    if (wasPending.current && !pending && !error) form.current?.reset();
    wasPending.current = pending;
  }, [pending, error]);
  return (
    <form ref={form} action={action} onSubmit={keepInput(action)} className={s.videoForm}>
      <label className={s.field}><span>Video link</span><input name="url" type="url" required placeholder="https://youtu.be/… or https://www.instagram.com/reel/…" /></label>
      <label className={s.field}><span>Caption (optional)</span><input name="caption" maxLength={200} /></label>
      <button className={s.ghost} disabled={pending}>{pending ? "Adding…" : "+ Add video"}</button>
      {error && <p className={s.error} role="alert">{error}</p>}
    </form>
  );
}

// Two-step delete on the page itself (no browser pop-up).
export function DeleteButton({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  if (!armed) return <button type="button" className={`${s.ghost} ${s.danger}`} onClick={() => setArmed(true)}>Delete</button>;
  return (
    <span className={s.actions}>
      <button type="button" className={`${s.ghost} ${s.danger}`} disabled={pending} onClick={() => start(() => deleteMedia(id))}>{pending ? "Deleting…" : "Yes, delete"}</button>
      <button type="button" className={s.ghost} onClick={() => setArmed(false)}>Keep</button>
    </span>
  );
}
