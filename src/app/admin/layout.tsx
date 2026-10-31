import type { Metadata } from "next";

// Nothing under /admin is ever indexed by search engines
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
