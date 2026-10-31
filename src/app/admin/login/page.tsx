"use client";
import { useActionState } from "react";
import { signIn } from "../actions";
import s from "../admin.module.css";

export default function Login() {
  const [error, action, pending] = useActionState(signIn, null);
  return (
    <main className={s.loginPage}>
      <form action={action} className={s.loginCard}>
        <p className={s.brand}>Amity<b>K9</b> · Admin</p>
        <h1>Sign in</h1>
        <label className={s.field}><span>Email</span><input name="email" type="email" autoComplete="username" required /></label>
        <label className={s.field}><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p className={s.error} role="alert">{error}</p>}
        <button className={s.primary} disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
