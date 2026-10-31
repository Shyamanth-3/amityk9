"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentAdmin } from "@/lib/supabase";
import { slugify, type Package, type ServiceStatus } from "@/lib/services";

const STATUSES: ServiceStatus[] = ["draft", "published", "unpublished", "archived"];
const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const int = (v: unknown) => { const n = Number(v); return v === "" || v == null || !Number.isFinite(n) || n < 0 ? null : Math.round(n); };

async function owner() {
  const a = await currentAdmin();
  if (!a) throw new Error("Not allowed");
  return a.db;
}

// Public pages read live from the database; this just clears any cached copies.
const refreshSite = () => { revalidatePath("/services"); revalidatePath("/book"); };

export async function saveService(_: string | null, f: FormData): Promise<string | null> {
  const db = await owner();
  const id = str(f, "id", 60);
  const name = str(f, "name", 80);
  if (name.length < 2) return "Give the service a name.";
  const slug = slugify(str(f, "slug", 60) || name);
  if (!slug) return "The web address can only use letters, numbers and dashes.";
  const status = str(f, "status", 20) as ServiceStatus;
  if (!STATUSES.includes(status)) return "Pick a status.";

  let packages: Package[] = [];
  try {
    packages = (JSON.parse(String(f.get("packages") || "[]")) as Package[])
      .filter((p) => p && String(p.name ?? "").trim())
      .slice(0, 8)
      .map((p) => ({ name: String(p.name).trim().slice(0, 40), price: int(p.price), visits: int(p.visits), note: String(p.note ?? "").trim().slice(0, 80) }));
  } catch { return "The packages couldn't be read. Please check them."; }

  const row = {
    name, slug, status,
    summary: str(f, "summary", 300),
    description: str(f, "description", 4000),
    inclusions: str(f, "inclusions", 2000).split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 12),
    enquiry_only: f.get("enquiry_only") === "on",
    price_from: int(str(f, "price_from", 9)),
    duration: str(f, "duration", 80),
    packages,
    service_area: str(f, "service_area", 200),
    availability: str(f, "availability", 200),
    temporarily_unavailable: f.get("temporarily_unavailable") === "on",
    booking_enabled: f.get("booking_enabled") === "on",
  };

  let error;
  if (id) {
    ({ error } = await db.from("services").update(row).eq("id", id));
  } else {
    // new services go to the end of the list
    const { data: last } = await db.from("services").select("display_order").order("display_order", { ascending: false }).limit(1).maybeSingle();
    ({ error } = await db.from("services").insert({ ...row, display_order: (last?.display_order ?? 0) + 1 }));
  }
  if (error) return error.code === "23505" ? "Another service already uses that web address. Change it slightly." : "Couldn't save. Please try again.";

  refreshSite();
  redirect(`/admin/services?saved=${encodeURIComponent(name)}`);
}

export async function setStatus(id: string, status: ServiceStatus) {
  if (!STATUSES.includes(status)) return;
  const db = await owner();
  await db.from("services").update({ status }).eq("id", id);
  refreshSite();
  revalidatePath("/admin/services");
}

// Swap a service with its neighbour in the public display order.
export async function move(id: string, dir: -1 | 1) {
  const db = await owner();
  const { data } = await db.from("services").select("id, display_order").neq("status", "archived").order("display_order");
  const list = data ?? [];
  const i = list.findIndex((r) => r.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  // renumber everything so equal orders can't stall a swap
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((r, k) => db.from("services").update({ display_order: k + 1 }).eq("id", r.id)));
  refreshSite();
  revalidatePath("/admin/services");
}
