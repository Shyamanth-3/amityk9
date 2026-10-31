import { currentAdmin } from "@/lib/supabase";

// CSV download of every booking, for the owner's own backups.
export async function GET() {
  const a = await currentAdmin();
  if (!a) return new Response("Not allowed", { status: 403 });
  const { data, error } = await a.db.from("bookings").select("*").order("created_at");
  if (error) return new Response("Export failed", { status: 500 });

  const rows = data ?? [];
  const cols = ["request_code", "created_at", "service_name", "customer_name", "phone", "pet_name", "pet_type", "community", "preferred_date", "preferred_time", "notes", "status", "internal_notes"];
  // quote every cell; a leading = + - @ is neutralised so spreadsheets don't run it as a formula
  const cell = (v: unknown) => `"${String(v ?? "").replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell((r as Record<string, unknown>)[c])).join(","))].join("\r\n");

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amityk9-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
