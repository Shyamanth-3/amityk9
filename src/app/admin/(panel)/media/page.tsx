import { currentAdmin } from "@/lib/supabase";
import { parseVideo, type MediaItem } from "@/lib/media";
import { moveMedia, updateMedia } from "./actions";
import { DeleteButton, GalleryUpload, VideoForm } from "./MediaTools";
import s from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function Media() {
  const { db } = (await currentAdmin())!;
  const { data } = await db.from("media").select("*").order("display_order");
  const items = (data ?? []) as MediaItem[];

  return (
    <>
      <div className={s.head}>
        <div><h1>Gallery</h1><p>Photos and videos shown on the website&apos;s gallery page. Hidden items stay here but aren&apos;t shown.</p></div>
      </div>

      <div className={s.mediaAdd}>
        <section className={s.section}><h2>Photos</h2><p className={s.muted}>JPG, PNG or WebP. They&apos;re resized automatically before uploading.</p><GalleryUpload /></section>
        <section className={s.section}><h2>Videos</h2><VideoForm /></section>
      </div>

      <div className={s.mediaGrid}>
        {items.map((m, i) => {
          const v = m.kind === "video" ? parseVideo(m.url) : null;
          return (
            <article key={m.id} className={`${s.mediaCard} ${m.published ? "" : s.hiddenItem}`}>
              <div className={s.mediaThumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.kind === "photo" ? <img src={m.url} alt="" loading="lazy" />
                  : v?.site === "youtube" ? <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
                  : <span className={s.igThumb}>Instagram</span>}
                {m.kind === "video" && <span className={s.cover}>Video</span>}
              </div>
              <form action={updateMedia.bind(null, m.id)} className={s.mediaForm}>
                <input name="caption" defaultValue={m.caption} maxLength={200} placeholder="Caption (optional)" aria-label="Caption" />
                <label className={s.check}><input type="checkbox" name="published" defaultChecked={m.published} />Show on website</label>
                <button className={s.ghost}>Save</button>
              </form>
              <div className={s.actions}>
                <form action={moveMedia.bind(null, m.id, -1)}><button className={s.ghost} disabled={i === 0} aria-label="Move earlier">←</button></form>
                <form action={moveMedia.bind(null, m.id, 1)}><button className={s.ghost} disabled={i === items.length - 1} aria-label="Move later">→</button></form>
                <DeleteButton id={m.id} />
              </div>
            </article>
          );
        })}
      </div>
      {!items.length && <p className={s.muted}>Nothing in the gallery yet. Upload some photos to get started.</p>}
    </>
  );
}
