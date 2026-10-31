"use client";
import { useRef, useState } from "react";
import { uploadPhotos, type Uploaded } from "@/lib/upload";
import s from "./admin.module.css";

// "Add photos" button: pick one or more JPG/PNG/WebP files, they're shrunk and uploaded, then handed back.
export default function PhotoPicker({ folder, multiple = true, label = "+ Add photos", onUploaded }:
  { folder: string; multiple?: boolean; label?: string; onUploaded: (list: Uploaded[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (files: File[]) => {
    if (!files.length) return;
    setError(null);
    setBusy(`Uploading 0 of ${files.length}…`);
    const { uploaded, failed } = await uploadPhotos(files, folder, (n) => setBusy(`Uploading ${n} of ${files.length}…`));
    setBusy(null);
    if (uploaded.length) onUploaded(uploaded);
    if (failed.length) setError(`Couldn't upload ${failed.join(", ")}. Use JPG, PNG or WebP photos under 25 MB.`);
    if (input.current) input.current.value = "";
  };

  return (
    <div className={s.picker}>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} hidden
        onChange={(e) => pick(Array.from(e.target.files ?? []))} />
      <button type="button" className={s.ghost} disabled={!!busy} onClick={() => input.current?.click()}>{busy ?? label}</button>
      {error && <p className={s.error} role="alert">{error}</p>}
    </div>
  );
}
