import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

type Result = { error: unknown };

// If any Supabase write failed, send the owner back to the screen they were on
// with a message; <Notice /> in the panel layout shows it.
export async function failIf(res: Result | Result[], message: string) {
  if (![res].flat().some((r) => r.error)) return;
  const back = new URL((await headers()).get("referer") ?? "/admin", "http://x");
  back.searchParams.set("error", message);
  redirect(back.pathname + back.search, RedirectType.replace);
}
