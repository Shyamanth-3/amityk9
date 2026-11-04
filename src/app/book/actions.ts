"use server";
import { publicDb } from "@/lib/supabase";

export type BookState = { error?: string; code?: string; service?: string; summary?: string } | null;

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const UUID = /^[0-9a-f-]{36}$/i;

// Today's date in India, as YYYY-MM-DD. The database checks the same thing (supabase/003_booking_limits.sql).
const todayInIndia = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

// Errors raised by submit_booking() in the database, in plain words. Anything else gets the generic message.
const DB_ERRORS: Record<string, string> = {
  service_unavailable: "That service can't be booked right now. Please choose another.",
  date_in_past: "Pick a date from today onwards.",
  rate_limited_phone: "We've already received a few requests from this number today. We'll be in touch soon, or message us on WhatsApp.",
  rate_limited_global: "We're getting a lot of requests right now. Please try again in a little while, or message us on WhatsApp.",
};
const dbError = (message: string) =>
  Object.entries(DB_ERRORS).find(([code]) => message.includes(code))?.[1] ?? "We couldn't save your request. Please try again or message us on WhatsApp.";

// Saves the enquiry before anything else; WhatsApp is only offered afterwards.
export async function submitBooking(_: BookState, f: FormData): Promise<BookState> {
  if (str(f, "website", 100)) return { error: "Something went wrong. Please try again." }; // bots fill the hidden field

  const service = str(f, "service", 40), name = str(f, "name", 80), phone = str(f, "phone", 20).replace(/[\s-]/g, "");
  const date = str(f, "date", 10), time = str(f, "time", 40);
  if (!UUID.test(service)) return { error: "Choose a service." };
  if (name.length < 2) return { error: "Enter your name." };
  if (!/^\+?[0-9]{10,13}$/.test(phone)) return { error: "Enter a 10-digit mobile number." };
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInIndia())) return { error: "Pick a date from today onwards." };

  const fields = { pet: str(f, "pet_name", 60), type: str(f, "pet_type", 40), community: str(f, "community", 120), notes: str(f, "notes", 1000) };
  const { data: code, error } = await publicDb().rpc("submit_booking", {
    p_service: service, p_name: name, p_phone: phone, p_pet_name: fields.pet, p_pet_type: fields.type,
    p_community: fields.community, p_date: date || null, p_time: time, p_notes: fields.notes,
  });
  if (error) {
    console.error("booking not saved:", error.code, error.message); // limits and failures show up in the server log
    return { error: dbError(error.message) };
  }

  const serviceName = str(f, "service_name", 80);
  const summary = [
    `Hi AmityK9! I just sent request ${code} for ${serviceName.toLowerCase()}.`,
    fields.pet && `Pet: ${fields.pet}${fields.type ? ` (${fields.type})` : ""}.`,
    fields.community && `Community: ${fields.community}.`,
    date && `Preferred: ${date}${time ? `, ${time}` : ""}.`,
  ].filter(Boolean).join(" ");
  return { code: String(code), service: serviceName, summary };
}
