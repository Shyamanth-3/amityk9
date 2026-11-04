"use client";
import { useActionState, useEffect, useRef } from "react";
import { keepInput } from "@/lib/keepInput";
import { signIn } from "../actions";
import s from "../admin.module.css";

export default function Login() {
  const [error, action, pending] = useActionState(signIn, null);
  const password = useRef<HTMLInputElement>(null);
  // Keep the email after a failed attempt, but never the password.
  useEffect(() => {
    if (!pending && password.current) password.current.value = "";
  }, [pending, error]);
  return (
    <main className={s.loginPage}>
      <form action={action} onSubmit={keepInput(action)} className={s.loginCard}>
        <p className={s.brand}>Amity<b>K9</b> · Admin</p>
        <h1>Sign in</h1>
        <label className={s.field}><span>Email</span><input name="email" type="email" autoComplete="username" required /></label>
        <label className={s.field}><span>Password</span><input ref={password} name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p className={s.error} role="alert">{error}</p>}
        <button className={s.primary} disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
