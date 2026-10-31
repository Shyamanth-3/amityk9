import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Keeps the owner's Supabase session fresh and sends signed-out visitors from /admin to the login page.
// The real permission checks live in the database policies and in each admin page/action.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const db = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // responses that set auth cookies must never be cached
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data: { user }, error } = await db.auth.getUser();
  const isLogin = request.nextUrl.pathname === "/admin/login";
  // a missing session is normal when signed out; anything else is worth seeing in the server log
  if (error && error.name !== "AuthSessionMissingError") console.error("admin session check failed:", error.status, error.message);
  if (!user && !isLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (user && isLogin) return NextResponse.redirect(new URL("/admin", request.url));
  return response;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
