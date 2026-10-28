"use client";
import { useEffect, useRef, useState } from "react";
import type { Scene } from "@/lib/pixelScene";
import { PHONE, PHONE_DISPLAY, wa } from "@/lib/site";
import { Logo } from "./Nav";
import s from "./Footer.module.css";

const COLS = [
  { title: "Services", links: [["Pet walking", "/pet-walking-hyderabad"], ["Pet sitting", "/pet-sitting-hyderabad"], ["Plans & prices", "/#plans"], ["Walk updates", "/#updates"]] },
  { title: "Good to know", links: [["Before you book", "/#know"], ["Questions", "/#faq"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
  { title: "Say hello", links: [["WhatsApp us", wa("Hi AmityK9!")], [`Call ${PHONE_DISPLAY}`, `tel:${PHONE}`], ["Book a meet-and-greet", "/#book"]] },
];

// Night in Hyderabad (IST) before 6 am or from 7 pm
const istNight = () => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  return h < 6 || h >= 19;
};

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);
  const [night, setNight] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const n = istNight();
    setNight(n);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dead = false;
    // load the scene code only when the footer is getting close
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setInView(true);
      import("@/lib/pixelScene").then(({ createScene }) => {
        if (!dead) scene.current = createScene(canvasRef.current!, istNight(), reduced);
      });
    }, { rootMargin: "0px 0px 300px 0px" });
    io.observe(ref.current!);
    return () => { dead = true; io.disconnect(); scene.current?.destroy(); };
  }, []);

  useEffect(() => { scene.current?.setNight(night); }, [night]);

  let i = 0;
  return (
    <footer ref={ref} className={`${s.footer} ${inView ? s.in : ""}`}>
      <svg className={s.arcs} viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="1180" cy="760" r="520" /><circle cx="1180" cy="760" r="380" /><circle cx="160" cy="-80" r="300" />
        <line x1="0" y1="190" x2="1440" y2="190" />
      </svg>
      <div className={`wrap ${s.top}`}>
        <div className={s.brand}>
          <Logo className={s.logo} />
          <p>Unhurried walks and home visits for dogs and cats, inside Hyderabad&apos;s gated communities.</p>
        </div>
        <nav className={s.cols} aria-label="Footer">
          {COLS.map((c) => (
            <div key={c.title}>
              <h2 className={s.h}>{c.title}</h2>
              <ul>
                {c.links.map(([label, href]) => (
                  <li key={label} style={{ ["--i" as string]: i++ }}>
                    <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
                      <span data-t={label}>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className={s.toggle} role="group" aria-label="Footer scene">
          <button type="button" aria-pressed={!night} onClick={() => setNight(false)}>Walk hours</button>
          <span aria-hidden="true">|</span>
          <button type="button" aria-pressed={night} onClick={() => setNight(true)}>Rest</button>
        </div>
      </div>

      <div className={`wrap ${s.where}`}>
        <span className={s.h}>Where we walk</span>
        <p>Gated communities across Hyderabad · Monday to Saturday · <a className="link-u" href={wa("Hi AmityK9, do you cover my community?")}>Ask if yours is on our list</a></p>
      </div>

      <div className={s.scene}>
        <canvas ref={canvasRef} role="img" aria-label={night
          ? "Pixel-art gated community at night: lit windows, stars, and a dog asleep by a bench"
          : "Pixel-art gated community in the morning: a walker and a dog stroll along the path past trees and towers, with the Charminar on the horizon"} />
      </div>

      <div className={s.bottom}>
        <div className="wrap">
          <span>© {new Date().getFullYear()} AmityK9 · Pet walking &amp; sitting, Hyderabad</span>
          <span className={s.hint}>psst, click the dog</span>
        </div>
      </div>
    </footer>
  );
}
