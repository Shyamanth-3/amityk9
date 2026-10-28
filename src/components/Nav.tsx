"use client";
import { useEffect, useState } from "react";
import { NAV, wa } from "@/lib/site";
import { Icon } from "./Icons";
import s from "./Nav.module.css";

export function Logo({ className }: { className?: string }) {
  return (
    <a className={`${s.logo} ${className ?? ""}`} href="/" aria-label="AmityK9 home">
      <svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="16" fill="#1E4A38"/><use href="#paw" x="8" y="8" width="18" height="18" fill="#F6F0E4"/></svg>
      <span>Amity<b>K9</b></span>
    </a>
  );
}

export default function Nav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setCompact(scrollY > 40);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className={`${s.nav} ${compact ? s.compact : ""} ${open ? s.open : ""}`}>
      <div className={`wrap ${s.row}`}>
        <Logo />
        <nav aria-label="Main">
          <ul className={s.links} id="menu">
            {NAV.map((l) => (
              <li key={l.href}><a href={l.href} onClick={() => setOpen(false)}>{l.label}</a></li>
            ))}
          </ul>
        </nav>
        <a className={`btn btn-primary ${s.cta}`} href={wa()}><Icon id="chat" />WhatsApp us</a>
        <button className={s.menuBtn} aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          <span className="sr-only">Menu</span><i /><i />
        </button>
      </div>
    </header>
  );
}
