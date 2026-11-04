"use server";
import { currentAdmin } from "@/lib/supabase";
import { removeUnsaved } from "@/lib/storage";

// Called by the admin forms for photos uploaded but never saved: Remove before saving, Cancel, leaving the form.
// Owner only; removeUnsaved ignores anything that isn't our upload path or that a saved row still uses.
// ponytail: closing the tab, a crash or a lost connection can't be caught, so those uploads stay orphaned.
// Upgrade path: upload into a "pending/" prefix and have saves move files into place, then sweep "pending/"
// older than a day (or sweep any media object no row references) from a scheduled job.
export async function discardUploads(paths: string[]): Promise<void> {
  const a = await currentAdmin();
  if (!a) return;
  await removeUnsaved(a.db, paths);
}
