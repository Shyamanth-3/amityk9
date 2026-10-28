import { ImageResponse } from "next/og";

// iOS home-screen icon: the paw on forest green (same shapes as icon.svg)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#1E4A38" }}>
        <svg width="110" height="110" viewBox="0 0 32 32" fill="#F6F0E4">
          <ellipse cx="16" cy="21.5" rx="7.2" ry="6.2" />
          <ellipse cx="7.3" cy="13.8" rx="3" ry="3.7" transform="rotate(-18 7.3 13.8)" />
          <ellipse cx="12.6" cy="8.4" rx="3" ry="3.8" transform="rotate(-6 12.6 8.4)" />
          <ellipse cx="19.4" cy="8.4" rx="3" ry="3.8" transform="rotate(6 19.4 8.4)" />
          <ellipse cx="24.7" cy="13.8" rx="3" ry="3.7" transform="rotate(18 24.7 13.8)" />
        </svg>
      </div>
    ),
    size,
  );
}
