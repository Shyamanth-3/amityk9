"use client";
import { useEffect, useRef } from "react";

// The rust leash: runs down the page gutters, crosses between sections and ends at the paw tag
// above the booking panel. It draws itself as you scroll. Desktop/tablet only.
export default function Leash() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current!, group = svg.querySelector("g")!, ring = svg.querySelector("circle")!;
    const main = svg.parentElement!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // One <path> per straight run / corner, so a scroll only repaints the small piece being drawn
    // (a single page-tall path repainted its whole bounds on every scroll tick).
    // Each piece maps scroll key range [k0,k1] linearly onto its own length.
    let pieces: { k0: number; k1: number; len: number; el: SVGPathElement; dash: string }[] = [], origin = 0, raf = 0;

    const draw = () => {
      if (innerWidth < 900) { svg.style.display = "none"; return; }
      svg.style.display = "";
      const W = document.documentElement.clientWidth, H = main.offsetHeight;
      origin = main.getBoundingClientRect().top + scrollY;
      svg.setAttribute("width", String(W)); svg.setAttribute("height", String(H));
      const top = (id: string) => document.getElementById(id)!.getBoundingClientRect().top + scrollY - origin;
      const bot = (id: string) => document.getElementById(id)!.getBoundingClientRect().bottom + scrollY - origin;
      const end = document.querySelector("[data-leash-end]")!.getBoundingClientRect();
      const tx = end.left + end.width / 2, ty = end.top + scrollY - origin;
      const g = Math.max(18, (W - 1280) / 4), L = g, R = W - g;
      const pts = [[R, top("services") + 70], [R, bot("services")], [L, bot("services")], [L, bot("updates")], [R, bot("updates")],
        [R, bot("plans")], [L, bot("plans")], [L, bot("know")], [R, bot("know")], [R, bot("faq") - 80], [tx, bot("faq") - 80], [tx, ty]];

      // Straight runs joined by rounded corners. Lengths are computed here rather than sampled with
      // getPointAtLength, so redrawing every frame (e.g. while a FAQ answer opens) stays cheap.
      // Scroll key: horizontal travel spends 0.28 × its width of scroll, then vertical runs
      // wait until page y catches up with the key (monotone, never ahead of the page).
      let key = pts[0][1], cx = pts[0][0], cy = pts[0][1], n = 0;
      const piece = (d: string, dx: number, endY: number, len: number) => {
        const k = Math.max(key + dx * 0.28, endY);
        const el = (group.children[n] as SVGPathElement) ?? group.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path"));
        el.setAttribute("d", d);
        pieces[n++] = { k0: key, k1: k, len, el, dash: "" };
        key = k;
      };
      const run = (x: number, y: number) => {
        piece(`M${cx},${cy}L${x},${y}`, Math.abs(x - cx), y, Math.abs(x - cx) + Math.abs(y - cy)); cx = x; cy = y;
      };
      for (let i = 1; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
        const v1 = [Math.sign(x1 - x0), Math.sign(y1 - y0)], v2 = [Math.sign(x2 - x1), Math.sign(y2 - y1)];
        const r = Math.min(70, Math.hypot(x1 - x0, y1 - y0) / 2, Math.hypot(x2 - x1, y2 - y1) / 2);
        const ax = x1 - v1[0] * r, ay = y1 - v1[1] * r, bx = x1 + v2[0] * r, by = y1 + v2[1] * r;
        run(ax, ay);
        // a right-angle quadratic corner of radius r is 1.6232·r long
        piece(`M${ax},${ay}Q${x1},${y1} ${bx},${by}`, r, by, 1.6232 * r); cx = bx; cy = by;
      }
      run(tx, ty);
      pieces.length = n;
      while (group.children.length > n) group.lastChild!.remove();
      ring.setAttribute("cx", String(pts[0][0])); ring.setAttribute("cy", String(pts[0][1] - 11));
      update();
    };

    const update = () => {
      const target = reduced ? Infinity : scrollY + innerHeight * 0.62 - origin;
      for (const p of pieces) {
        const f = target >= p.k1 ? 1 : target <= p.k0 ? 0 : (target - p.k0) / (p.k1 - p.k0);
        // drawn length then a gap; only touch the DOM when a piece actually changes
        const dash = f === 0 ? "0 1e5" : f === 1 ? "none" : `${(f * p.len).toFixed(1)} 1e5`;
        if (dash !== p.dash) { p.el.style.strokeDasharray = dash; p.dash = dash; }
      }
    };

    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
    draw();
    const ro = new ResizeObserver(schedule); // covers resize, FAQ open/close, late images and fonts
    ro.observe(main);
    addEventListener("resize", schedule);
    addEventListener("scroll", update, { passive: true });
    document.fonts.ready.then(schedule);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); removeEventListener("resize", schedule); removeEventListener("scroll", update); };
  }, []);

  return (
    <svg ref={svgRef} aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 0, overflow: "visible", display: "none" }}>
      {/* butt caps: pieces join end to end, and a 0-length dash must not leave a round dot */}
      <g fill="none" stroke="#B4532A" strokeWidth="2.4" />

      <circle r="11" fill="none" stroke="#B4532A" strokeWidth="2.4" />
    </svg>
  );
}
