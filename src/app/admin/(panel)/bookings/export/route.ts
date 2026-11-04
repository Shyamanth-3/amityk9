import { currentAdmin } from "@/lib/supabase";
import { fetchAllPages } from "@/lib/pages";
import { csvCell as cell } from "@/lib/csv";

// CSV download of every booking, for the owner's own backups.
export async function GET() {
  const a = await currentAdmin();
  if (!a) return new Response("Not allowed", { status: 403 });
  // Page through everything: one request is capped at 1000 rows by PostgREST.
  // created_at then id gives a stable order so pages don't overlap or skip.
  let rows: Record<string, unknown>[];
  try {
    rows = await fetchAllPages<Record<string, unknown>>((from, to) =>
      a.db.from("bookings").select("*", { count: "exact" })
        .order("created_at", { ascending: true }).order("id", { ascending: true })
        .range(from, to));
  } catch {
    // never hand out a partial file that claims to be a full backup
    return new Response("Export failed", { status: 500 });
  }
  const cols = ["request_code", "created_at", "service_name", "customer_name", "phone", "pet_name", "pet_type", "community", "preferred_date", "preferred_time", "notes", "status", "internal_notes"];
  // every cell is quoted and formula-like values are neutralised (see lib/csv)
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amityk9-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
