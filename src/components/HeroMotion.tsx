"use client";
import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

// Hero scroll parallax and the paw-print cursor trail. The intro itself is CSS (globals.css, Hero.module.css).
export default function HeroMotion() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = ref.current!.closest("section")!;
    let cleanup = () => {}, dead = false;

    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const ctx = gsap.context(() => {
        hero.querySelectorAll<HTMLElement>("[data-par]").forEach((el) =>
          gsap.to(el, { y: Number(el.dataset.par), ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.4 } }));
      }, hero);
      cleanup = () => ctx.revert();

      // paw trail, fine pointers only: stamps a paw every ~64px of travel, alternating left/right
      if (!matchMedia("(pointer: fine)").matches) return;
      const layer = hero.querySelector<HTMLElement>("[data-trail]")!;
      const pool = Array.from({ length: 14 }, () => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.innerHTML = '<use href="#paw"/>';
        layer.appendChild(svg);
        return svg;
      });
      let i = 0, lx = 0, ly = 0, side = 1;
      const move = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        const dx = x - lx, dy = y - ly;
        if (Math.hypot(dx, dy) < 64) return;
        const a = Math.atan2(dy, dx), nx = -Math.sin(a) * 9 * side, ny = Math.cos(a) * 9 * side;
        side = -side; lx = x; ly = y;
        const p = pool[i++ % pool.length];
        gsap.killTweensOf(p);
        gsap.set(p, { x: x + nx - 11, y: y + ny - 11, rotation: (a * 180) / Math.PI + 90, scale: 0.7, opacity: 0.5 });
        gsap.to(p, { opacity: 0, scale: 1, duration: 1.4, ease: "power2.in" });
      };
      hero.addEventListener("pointermove", move);
      cleanup = () => { hero.removeEventListener("pointermove", move); pool.forEach((p) => p.remove()); ctx.revert(); };
    });
    return () => { dead = true; cleanup(); };
  }, []);

  return <span ref={ref} hidden />;
}
