// Shapes of the `services` and `bookings` tables (supabase/setup.sql), plus their display labels.

export type Package = { name: string; price: number | null; visits: number | null; note: string };

export type ServiceStatus = "draft" | "published" | "unpublished" | "archived";

export type Service = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  inclusions: string[];
  status: ServiceStatus;
  enquiry_only: boolean;
  price_from: number | null;
  duration: string;
  packages: Package[];
  service_area: string;
  availability: string;
  temporarily_unavailable: boolean;
  booking_enabled: boolean;
  display_order: number;
  updated_at: string;
};

export const SERVICE_STATUS: Record<ServiceStatus, string> = {
  draft: "Draft", published: "Published", unpublished: "Unpublished", archived: "Archived",
};

export type BookingStatus = "new" | "contacted" | "awaiting_customer" | "confirmed" | "completed" | "cancelled";

export const BOOKING_STATUS: Record<BookingStatus, string> = {
  new: "New", contacted: "Contacted", awaiting_customer: "Awaiting customer",
  confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled",
};

export type Booking = {
  id: string;
  request_code: string;
  created_at: string;
  service_id: string;
  service_name: string;
  customer_name: string;
  phone: string;
  pet_name: string;
  pet_type: string;
  community: string;
  preferred_date: string | null;
  preferred_time: string;
  notes: string;
  status: BookingStatus;
  internal_notes: string;
};

export const priceLabel = (s: Pick<Service, "enquiry_only" | "price_from">) =>
  s.enquiry_only || s.price_from == null ? "Contact for pricing" : `From ₹${s.price_from.toLocaleString("en-IN")} / month`;

export const slugify = (name: string) =>
  name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
