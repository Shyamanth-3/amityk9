"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { parseVideo, type MediaItem } from "@/lib/media";
import s from "./gallery.module.css";

export default function Gallery({ items }: { items: MediaItem[] }) {
  const box = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<MediaItem | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const show = (m: MediaItem) => { setOpen(m); box.current?.showModal(); };

  return (
    <>
      <div className={s.grid}>
        {items.map((m) => {
          if (m.kind === "photo") return (
            <figure key={m.id} className={s.item}>
              <button type="button" className={s.photoBtn} onClick={() => show(m)} aria-label={m.caption ? `Open photo: ${m.caption}` : "Open photo"}>
                <Image src={m.url} alt={m.caption || "AmityK9 walk photo"} width={900} height={675} sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 400px" />
              </button>
              {m.caption && <figcaption>{m.caption}</figcaption>}
            </figure>
          );
          const v = parseVideo(m.url);
          if (!v) return null;
          return (
            <figure key={m.id} className={s.item}>
              {v.site === "youtube" ? (
                playing === m.id ? (
                  <div className={s.video}>
                    <iframe src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={m.caption || "AmityK9 video"}
                      allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  // the YouTube player only loads after a tap, so the page stays fast
                  <button type="button" className={`${s.video} ${s.poster}`} onClick={() => setPlaying(m.id)} aria-label={`Play video${m.caption ? `: ${m.caption}` : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
                    <span className={s.play} aria-hidden="true" />
                  </button>
                )
              ) : (
                <a className={`${s.video} ${s.insta}`} href={v.url} target="_blank" rel="noopener">
                  <span className={s.play} aria-hidden="true" /><b>Watch on Instagram</b>
                </a>
              )}
              {m.caption && <figcaption>{m.caption}</figcaption>}
            </figure>
          );
        })}
      </div>

      <dialog ref={box} className={s.lightbox} onClose={() => setOpen(null)} onClick={(e) => e.target === e.currentTarget && box.current?.close()}>
        {open && (
          <figure>
            <Image src={open.url} alt={open.caption || "AmityK9 walk photo"} width={1800} height={1350} sizes="92vw" />
            {open.caption && <figcaption>{open.caption}</figcaption>}
          </figure>
        )}
        <form method="dialog"><button className={s.close} aria-label="Close">×</button></form>
      </dialog>
    </>
  );
}
