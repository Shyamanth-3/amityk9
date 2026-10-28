// GSAP + ScrollTrigger, fetched only once the page has painted and gone idle, so they never
// sit on the critical path. Everything they drive is an extra on top of visible content.
let p: Promise<{ gsap: typeof import("gsap").gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger }> | undefined;

export const loadGsap = () =>
  (p ??= new Promise<void>((r) => ("requestIdleCallback" in window ? requestIdleCallback(() => r(), { timeout: 2000 }) : setTimeout(r, 200)))
    .then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")]))
    .then(([{ gsap }, { ScrollTrigger }]) => { gsap.registerPlugin(ScrollTrigger); return { gsap, ScrollTrigger }; }));
