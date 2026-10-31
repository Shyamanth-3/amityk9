import { redirect } from "next/navigation";
import { currentAdmin, sessionDb } from "@/lib/supabase";
import { signOut } from "../actions";
import s from "../admin.module.css";

// Per-request: depends on the signed-in user, never prerendered.
export const dynamic = "force-dynamic";

// Every admin screen renders inside this shell, and only for users on the admins list.
export default async function Panel({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) {
    const { data: { user } } = await (await sessionDb()).auth.getUser();
    if (!user) redirect("/admin/login");
    return (
      <main className={s.loginPage}>
        <div className={s.loginCard}>
          <h1>No access</h1>
          <p>{user.email} is signed in but isn&apos;t an owner of this site.</p>
          <form action={signOut}><button className={s.primary}>Sign out</button></form>
        </div>
      </main>
    );
  }

  return (
    <div className={s.shell}>
      <header className={s.top}>
        <a href="/admin" className={s.brand}>Amity<b>K9</b> · Admin</a>
        <nav className={s.nav}>
          <a href="/admin/bookings">Bookings</a>
          <a href="/admin/services">Services</a>
          <a href="/services" target="_blank" rel="noopener">View site ↗</a>
        </nav>
        <form action={signOut} className={s.who}><span>{admin.user.email}</span><button>Sign out</button></form>
      </header>
      <main className={s.main}>{children}</main>
    </div>
  );
}
