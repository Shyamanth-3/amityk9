"use server";
import { revalidatePath } from "next/cache";
import { currentAdmin } from "@/lib/supabase";
import { failIf } from "../fail";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/services";

export async function updateBooking(id: string, f: FormData) {
  const a = await currentAdmin();
  if (!a) throw new Error("Not allowed");
  const status = String(f.get("status") ?? "") as BookingStatus;
  if (!(status in BOOKING_STATUS)) return;
  await failIf(await a.db.from("bookings").update({ status, internal_notes: String(f.get("internal_notes") ?? "").trim().slice(0, 2000) }).eq("id", id),
    "Couldn't save that booking. Please try again.");
  revalidatePath("/admin/bookings");
}
