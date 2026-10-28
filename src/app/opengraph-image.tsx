import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Share card for every page (rendered once at build time)
export const alt = "AmityK9: pet walking and sitting in Hyderabad's gated communities";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const dir = join(process.cwd(), "src/assets");
  const [photo, serif] = await Promise.all([readFile(join(dir, "og-photo.jpg")), readFile(join(dir, "og-fraunces-500.ttf"))]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#1E4A38", fontFamily: "Fraunces" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 540, padding: "56px 52px", color: "#F6F0E4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 40 }}>
            <svg width="46" height="46" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="17" fill="#F6F0E4" />
              <g fill="#1E4A38" transform="translate(8 8) scale(.5625)">
                <ellipse cx="16" cy="21.5" rx="7.2" ry="6.2" /><ellipse cx="7.3" cy="13.8" rx="3" ry="3.7" transform="rotate(-18 7.3 13.8)" />
                <ellipse cx="12.6" cy="8.4" rx="3" ry="3.8" transform="rotate(-6 12.6 8.4)" /><ellipse cx="19.4" cy="8.4" rx="3" ry="3.8" transform="rotate(6 19.4 8.4)" />
                <ellipse cx="24.7" cy="13.8" rx="3" ry="3.7" transform="rotate(18 24.7 13.8)" />
              </g>
            </svg>
            <span>Amity</span><span style={{ color: "#F0B48E", marginLeft: -14 }}>K9</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, lineHeight: 1, letterSpacing: -2 }}>Your dog&apos;s</div>
            <div style={{ fontSize: 76, lineHeight: 1, letterSpacing: -2 }}>favourite</div>
            <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2, color: "#F0B48E" }}>neighbour.</div>
          </div>
          <div style={{ fontSize: 26, color: "#B9CDC0", lineHeight: 1.35 }}>Pet walking &amp; sitting · Gated communities, Hyderabad</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/jpeg;base64,${photo.toString("base64")}`} width={660} height={630} alt="" />
      </div>
    ),
    { ...size, fonts: [{ name: "Fraunces", data: serif, weight: 500, style: "normal" }] },
  );
}
