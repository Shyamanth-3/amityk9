"use client";
import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";

type G = typeof import("gsap").gsap;

// Below-the-fold motion: scroll reveals, the chat timeline, card tilt and FAQ heights.
// Scrolling is native (no Lenis): a smoothing library adds input latency and restyles <html> on every scroll start/stop.
// Everything is visible in the server HTML; from-states are only applied here, after GSAP loads at idle.
export default function PageMotion() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];
    let dead = false;
    if (reduced) return; // native <details> and static content

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (dead) return;
      faq(gsap, cleanups);
      // anything already on screen when GSAP arrives stays put, so nothing visible blinks out and back in
      const later = (el: Element) => !ScrollTrigger.isInViewport(el);
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-rv]").filter(later).forEach((el) =>
          gsap.from(el, { y: 34, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }));
        gsap.utils.toArray<HTMLElement>("[data-rvg]").filter(later).forEach((g) =>
          // cards have CSS transform transitions for hover; switch them off while GSAP owns transform
          gsap.fromTo(g.children, { y: 50, opacity: 0, transition: "none" }, { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out",
            clearProps: "transform,opacity,transition", scrollTrigger: { trigger: g, start: "top 82%" } }));
        chat(gsap);
      });
      cleanups.push(() => ctx.revert());
      if (matchMedia("(pointer: fine)").matches) tilt(gsap, cleanups);
    });
    return () => { dead = true; cleanups.forEach((f) => f()); };
  }, []);

  return null;
}

function chat(gsap: G) {
  const phone = document.querySelector<HTMLElement>("[data-phone]");
  if (!phone) return;
  const ms = phone.querySelectorAll<HTMLElement>("[data-m]");
  const typing = phone.querySelector("[data-typing]")!, done = phone.querySelector("[data-done]")!, out = phone.querySelector("[data-out]")!;
  const pop = { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)" };
  gsap.set(ms, { opacity: 0, y: 14, scale: 0.96, transformOrigin: "0% 100%" });
  gsap.set(out, { transformOrigin: "100% 100%" });
  gsap.set(done, { display: "none" });
  gsap.from(phone, { y: 60, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: phone, start: "top 90%" } });
  gsap.timeline({ scrollTrigger: { trigger: phone, start: "top 65%" } })
    .to(ms[0], pop, 0.3)
    .to(ms[1], { ...pop, duration: 0.5 }, 1.3)
    .set(typing, { display: "flex" }, 2.4)
    .to(typing, { ...pop, duration: 0.3 }, 2.4)
    .to(typing.children, { y: -3, duration: 0.28, stagger: { each: 0.12, repeat: 5, yoyo: true }, ease: "sine.inOut" }, 2.5)
    .set(typing, { display: "none" }, 3.9)
    .set(done, { display: "block" }, 3.9)
    .to(done, pop, 3.9)
    .to(out, pop, 4.9);
}

// 3D tilt toward the pointer on service cards
function tilt(gsap: G, cleanups: (() => void)[]) {
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 7);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
    };
    const leave = () => { rx(0); ry(0); };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); gsap.set(card, { clearProps: "transform" }); });
  });
}

// Animate <details> open/close heights; without JS (or with reduced motion) they just toggle.
function faq(gsap: G, cleanups: (() => void)[]) {
  document.querySelectorAll<HTMLDetailsElement>("[data-faq]").forEach((d) => {
    const sum = d.querySelector("summary")!, body = d.querySelector<HTMLElement>("summary + *")!;
    const click = (e: MouseEvent) => {
      e.preventDefault();
      gsap.killTweensOf(body);
      if (d.open) {
        gsap.to(body, { height: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height" }); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.6, ease: "power3.inOut", clearProps: "height" });
      }
    };
    sum.addEventListener("click", click);
    cleanups.push(() => sum.removeEventListener("click", click));
  });
}
