// Gallery items (the `media` table, supabase/002_media.sql) and the video links we support.

export type MediaItem = {
  id: string;
  kind: "photo" | "video";
  path: string | null;
  url: string;
  caption: string;
  published: boolean;
  display_order: number;
};

export type Video = { site: "youtube"; id: string } | { site: "instagram"; url: string };

// YouTube (watch, youtu.be, shorts, embed) and Instagram posts/reels only; anything else is rejected.
export function parseVideo(raw: string): Video | null {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  const yt = (id: string | null | undefined) => (id && /^[\w-]{11}$/.test(id) ? { site: "youtube" as const, id } : null);
  if (host === "youtu.be") return yt(u.pathname.slice(1));
  if (host === "youtube.com") {
    if (u.pathname === "/watch") return yt(u.searchParams.get("v"));
    const m = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]{11})/);
    return yt(m?.[2]);
  }
  if (host === "instagram.com") {
    const m = u.pathname.match(/^\/(p|reel|reels|tv)\/([\w-]+)/);
    return m ? { site: "instagram", url: `https://www.instagram.com/${m[1] === "reels" ? "reel" : m[1]}/${m[2]}/` } : null;
  }
  return null;
}

// canonical form stored in the database
export const videoUrl = (v: Video) => (v.site === "youtube" ? `https://www.youtube.com/watch?v=${v.id}` : v.url);
