"use client";
import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PhotoPicker from "../../PhotoPicker";
import { addPhotos, addVideo, deleteMedia } from "./actions";
import s from "../../admin.module.css";

export function GalleryUpload() {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <PhotoPicker folder="gallery" label="+ Upload photos"
      onUploaded={(list) => start(async () => { await addPhotos(list.map((u) => u.path)); router.refresh(); })} />
  );
}

export function VideoForm() {
  const [error, action, pending] = useActionState(addVideo, null);
  return (
    <form action={action} className={s.videoForm}>
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
