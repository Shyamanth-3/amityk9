"use server";
import { publicDb } from "@/lib/supabase";

export type BookState = { error?: string; code?: string; service?: string; summary?: string } | null;

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const UUID = /^[0-9a-f-]{36}$/i;

// Saves the enquiry before anything else; WhatsApp is only offered afterwards.
export async function submitBooking(_: BookState, f: FormData): Promise<BookState> {
  if (str(f, "website", 100)) return { error: "Something went wrong. Please try again." }; // bots fill the hidden field

  const service = str(f, "service", 40), name = str(f, "name", 80), phone = str(f, "phone", 20).replace(/[\s-]/g, "");
  const date = str(f, "date", 10), time = str(f, "time", 40);
  if (!UUID.test(service)) return { error: "Choose a service." };
  if (name.length < 2) return { error: "Enter your name." };
  if (!/^\+?[0-9]{10,13}$/.test(phone)) return { error: "Enter a 10-digit mobile number." };
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < new Date().toISOString().slice(0, 10))) return { error: "Pick a date from today onwards." };

  const fields = { pet: str(f, "pet_name", 60), type: str(f, "pet_type", 40), community: str(f, "community", 120), notes: str(f, "notes", 1000) };
  const { data: code, error } = await publicDb().rpc("submit_booking", {
    p_service: service, p_name: name, p_phone: phone, p_pet_name: fields.pet, p_pet_type: fields.type,
    p_community: fields.community, p_date: date || null, p_time: time, p_notes: fields.notes,
  });
  if (error) return { error: error.message.includes("service_unavailable") ? "That service can't be booked right now. Please choose another." : "We couldn't save your request. Please try again or message us on WhatsApp." };

  const serviceName = str(f, "service_name", 80);
  const summary = [
    `Hi AmityK9! I just sent request ${code} for ${serviceName.toLowerCase()}.`,
    fields.pet && `Pet: ${fields.pet}${fields.type ? ` (${fields.type})` : ""}.`,
    fields.community && `Community: ${fields.community}.`,
    date && `Preferred: ${date}${time ? `, ${time}` : ""}.`,
  ].filter(Boolean).join(" ");
  return { code: String(code), service: serviceName, summary };
}
