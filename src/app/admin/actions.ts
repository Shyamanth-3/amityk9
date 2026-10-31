"use server";
import { redirect } from "next/navigation";
import { sessionDb } from "@/lib/supabase";

export async function signIn(_: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get("email") ?? "").trim(), password = String(form.get("password") ?? "");
  if (!email || !password) return "Enter your email and password.";
  const db = await sessionDb();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("admin sign-in failed:", error.code ?? error.status, error.message); // reason only, never the password
    if (error.code === "email_not_confirmed") return "This account isn't confirmed yet. In Supabase → Authentication → Users, confirm the user (or recreate it with “Auto Confirm User” ticked).";
    if (error.code === "invalid_credentials") return "That email and password don't match.";
    return "Couldn't sign in right now. Please try again in a minute.";
  }
  redirect("/admin");
}

export async function signOut() {
  const db = await sessionDb();
  await db.auth.signOut();
  redirect("/admin/login");
}
