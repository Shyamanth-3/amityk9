// Pixel-art gated community for the footer. Everything is drawn in code on a small canvas
// (H logical px tall) and scaled up with image-rendering: pixelated. No image assets.
// Day ("Walk hours"): a walker and dog loop along the path; the dog stops to sniff trees.
// Night ("Rest"): lit windows, stars, lamp glow, and the dog asleep by the bench.

export type Scene = { setNight(night: boolean): void; destroy(): void };

const H = 100;
const BASE = 72;   // building bottoms / grass top
const PATH = 80;   // path top
const FRONT = 89;  // front hedge top
const FEET = 87;   // sprites stand on this row

type Pal = Record<string, string>;
const DAY: Pal = {
  sky0: "#123124", sky1: "#1A4030", sky2: "#2E5640", sky3: "#5F7148", sky4: "#A98A45", sky5: "#D3A146",
  far: "#3E5A40", mosque: "#8A7A4A", towers: "#E4D8BF,#C9B999|#DDBB94,#C29C74|#C3CBAE,#A3AD8D", towerShade: "#C9B999", glass: "#8FA89A", glassHi: "#B9CCC0", roof: "#B4532A",
  grass: "#4F7D4F", grassHi: "#6A9A5E", path: "#CDB890", pathLine: "#B49F78", hedge: "#1E4A38", hedgeHi: "#2C5E49",
  trunk: "#5A3D27", leaf: "#2C5E49", leafHi: "#4F7D64", leafLo: "#1E4A38", lamp: "#2A2A26", lampHead: "#E9E1CF", bench: "#8E5A33",
};
const NIGHT: Pal = {
  ...DAY,
  sky0: "#123124", sky1: "#0F281C", sky2: "#112C20", sky3: "#133024", sky4: "#163528", sky5: "#1A3A2C",
  far: "#163428", mosque: "#24493A", towers: "#2A4A3C,#203D31|#304B3B,#25402F|#27463D,#1D3A31", towerShade: "#203D31", glass: "#183329", glassHi: "#F0C66E", roof: "#5E3322",
  grass: "#1F3F2C", grassHi: "#2A4E37", path: "#4A5244", pathLine: "#3C4438", hedge: "#0F271C", hedgeHi: "#163428",
  trunk: "#2A2018", leaf: "#163A2B", leafHi: "#1F4A37", leafLo: "#0F2A1F", lampHead: "#F7D88A", bench: "#4A3020",
};

// sprites face right; "." is transparent
const SPR: Pal = {
  H: "#2A1E16", S: "#C68B5E", W: "#EDE5D3", P: "#56654A", K: "#1E1B18",
  D: "#D99A4E", d: "#B57836", E: "#A86A2E", N: "#2A1E16", C: "#B4532A",
};
const WALK_A = ["..HHH..", "..HSS..", "..SSS..", "...S...", ".WWWWW.", ".WWWWW.", ".WWWWWS", ".SWWWW.", ".WWWWW.", ".PPPPP.", ".PP.PP.", "PP...PP", "P.....P", "P.....P", "KK...KK"];
const WALK_B = [...WALK_A.slice(0, 9), ".PPPPP.", "..PPP..", "..PPP..", "..PP...", "..PP...", "..KKK.."];
const DOG_BODY = [".........EE..", "........DDDDN", "........DDDD.", ".......CDDD..", "..DDDDDDDD...", "..DDDDDDDd..."];
const DOG_A = [...DOG_BODY, "..d.d...d.d..", "..d.d...d.d.."];
const DOG_B = [...DOG_BODY, "..dd....dd...", ".d..d..d..d.."];
const DOG_SNIFF = [".............", ".............", ".............", "........EE...", "..DDDDDCDDDD.", "..DDDDDDDDDDN", "..d.d...d.d..", "..d.d...d.d.."];
const DOG_SLEEP = ["......EE....", "..DDDDDDDD..", ".DDDDDDDDDDN", "DDDDDDDDDDD."];
const GLYPH: Record<string, string[]> = {
  W: ["1...1", "1...1", "1.1.1", "1.1.1", ".1.1."], O: ["111", "1.1", "1.1", "1.1", "111"], F: ["111", "1..", "11.", "1..", "1.."],
  "!": ["1", "1", "1", ".", "1"], Z: ["111", "..1", ".1.", "1..", "111"],
};

const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

export function createScene(canvas: HTMLCanvasElement, night0: boolean, reduced: boolean): Scene {
  const ctx = canvas.getContext("2d")!;
  let night = night0, W = 0, scale = 3;
  let bg: HTMLCanvasElement | null = null;
  let trees: number[] = [], lamps: number[] = [], stars: [number, number][] = [], cat = { x: 0, y: 0 }, bench = 0;
  // walker state
  let x = -30, sniffUntil = 0, toSniff: number[] = [], bubble = 0, raf = 0, visible = false, last = 0, t = 0;

  const px = (c: CanvasRenderingContext2D, col: string, x: number, y: number, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const sprite = (rows: string[], x: number, y: number) => {
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== ".") px(ctx, SPR[r[i]], x + i, y + j); });
  };
  const text = (s: string, x: number, y: number, col: string) => {
    for (const ch of s) { const g = GLYPH[ch]; g.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === "1") px(ctx, col, x + i, y + j); }); x += g[0].length + 1; }
  };
  const disc = (c: CanvasRenderingContext2D, cx: number, cy: number, r: number, col: string) => {
    for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); px(c, col, cx - w, cy + j, w * 2 + 1, 1); }
  };

  // static layer: sky, skyline, trees, lamps, path. Rebuilt on resize and theme change.
  const build = () => {
    const p = night ? NIGHT : DAY, r = rng(7);
    const c = (bg ??= document.createElement("canvas")).getContext("2d")!;
    bg.width = W; bg.height = H;
    // sky in bands, dithered where they meet
    const bands = [p.sky0, p.sky1, p.sky2, p.sky3, p.sky4, p.sky5], bh = BASE / bands.length;
    bands.forEach((col, i) => {
      const y0 = Math.round(i * bh);
      px(c, col, 0, y0, W, Math.ceil(bh));
      if (i) for (let xx = 0; xx < W; xx += 2) px(c, bands[i - 1], xx + (y0 % 2), y0, 1, 1);
    });
    stars = [];
    if (night) {
      for (let i = 0; i < W / 9; i++) { const s: [number, number] = [Math.floor(r() * W), Math.floor(r() * 46)]; stars.push(s); px(c, "#E9E1CF", s[0], s[1]); }
      disc(c, Math.round(W * 0.14), 14, 5, "#EDE5D3"); px(c, "#CFC6B2", Math.round(W * 0.14) + 1, 12, 2, 2); px(c, "#CFC6B2", Math.round(W * 0.14) - 2, 16);
    }
    // the Charminar sits in a clearing the towers leave open; the morning sun rises just behind it
    const mx = Math.round(W * (W < 260 ? 0.7 : 0.62)), m = p.mosque;
    if (!night) { disc(c, mx + 22, 46, 9, "#E9B95A"); disc(c, mx + 22, 46, 7, "#F3D07E"); }
    // far hills
    for (let xx = 0; xx < W; xx++) { const hgt = 6 + Math.round(3 * Math.sin(xx / 23) + 2 * Math.sin(xx / 9)); px(c, p.far, xx, BASE - hgt, 1, hgt); }
    // Charminar, front view: square body, a corner minaret each side, big pointed arch, gallery of small arches
    const cut = night ? p.sky4 : p.sky5;
    px(c, m, mx - 11, BASE - 24, 23, 24);                                   // body
    for (const o of [-13, 11]) {                                            // minarets with balcony rings and bulb tops
      px(c, m, mx + o, BASE - 40, 3, 40);
      for (const y of [BASE - 25, BASE - 31, BASE - 37]) px(c, m, mx + o - 1, y, 5, 1);
      px(c, m, mx + o, BASE - 42, 3, 2); px(c, m, mx + o + 1, BASE - 45, 1, 3);
    }
    px(c, m, mx - 4, BASE - 27, 9, 3); px(c, m, mx - 2, BASE - 29, 5, 2);   // small mosque dome on the roof
    for (let i = -8; i <= 7; i += 3) px(c, cut, mx + i, BASE - 21, 1, 2);   // gallery of small arches
    px(c, cut, mx - 4, BASE - 13, 9, 13); px(c, cut, mx - 3, BASE - 15, 7, 2); px(c, cut, mx - 1, BASE - 17, 3, 2); // pointed arch
    // apartment towers
    let tx = 4 + Math.floor(r() * 10), catSet = false;
    const kinds = p.towers.split("|").map((k) => k.split(","));
    while (tx < W) {
      const w = 16 + Math.floor(r() * 12), h = 26 + Math.floor(r() * 26), top = BASE - h;
      if (tx + w > mx - 30 && tx < mx + 30) { tx = mx + 30; continue; }  // keep the Charminar clear
      const [face, shade] = kinds[Math.floor(r() * kinds.length)];
      px(c, face, tx, top, w, h); px(c, shade, tx + w - 3, top, 3, h);
      px(c, p.roof, tx - 1, top - 2, w + 2, 2);
      if (r() < 0.5) px(c, p.towerShade, tx + 3, top - 5, 5, 3);            // water tank
      for (let wy = top + 4; wy < BASE - 5; wy += 5)
        for (let wx = tx + 3; wx < tx + w - 4; wx += 4) {
          const lit = night && r() < 0.35;
          px(c, lit ? p.glassHi : p.glass, wx, wy, 2, 2);
          if (!night) px(c, p.glassHi, wx, wy);
        }
      if (!catSet && tx > W * 0.3) { cat = { x: tx + 3, y: top + 9 }; px(c, p.towerShade, tx + 1, top + 13, 9, 1); catSet = true; } // balcony ledge
      tx += w + 10 + Math.floor(r() * 22);
    }
    // grass, path, slabs
    px(c, p.grass, 0, BASE, W, PATH - BASE);
    for (let xx = 0; xx < W; xx += 3) px(c, p.grassHi, xx + (xx % 2), BASE, 1, 1);
    px(c, p.path, 0, PATH, W, FRONT - PATH); px(c, p.pathLine, 0, PATH, W, 1);
    for (let xx = 4; xx < W; xx += 9) px(c, p.pathLine, xx, PATH + 2, 1, FRONT - PATH - 2);
    // trees
    trees = [];
    for (let xx = 18 + Math.floor(r() * 20); xx < W - 6; xx += 38 + Math.floor(r() * 30)) {
      const rad = 6 + Math.floor(r() * 4), cy = BASE + 2 - 7 - rad;
      if (Math.abs(xx - mx) < 24) continue;                                 // don't hide the Charminar
      px(c, p.trunk, xx - 1, cy + rad - 2, 2, BASE + 4 - (cy + rad - 2));
      disc(c, xx, cy, rad, p.leafLo); disc(c, xx - 1, cy - 1, rad - 1, p.leaf); disc(c, xx - 2, cy - 3, Math.max(2, rad - 5), p.leafHi);
      trees.push(xx);
    }
    // lamps and one bench
    lamps = [];
    for (let xx = 46; xx < W; xx += 92) {
      px(c, p.lamp, xx, PATH - 16, 1, 16); px(c, p.lamp, xx - 1, PATH - 17, 3, 1); px(c, p.lampHead, xx - 1, PATH - 16, 3, 2);
      // night: a dithered pool of light on the path under the lamp
      if (night) for (let y = PATH + 1; y < FRONT; y++) { const half = Math.round(12 - Math.abs(y - (PATH + 4)) * 1.5); for (let i = -half; i <= half; i++) if ((i + y) % 2 === 0) px(c, "rgba(247,216,138,.16)", xx + i, y); }
      lamps.push(xx);
    }
    bench = Math.round(W * 0.28);
    px(c, p.bench, bench, PATH - 5, 14, 2); px(c, p.bench, bench, PATH - 8, 14, 1); px(c, p.lamp, bench + 1, PATH - 3, 1, 3); px(c, p.lamp, bench + 12, PATH - 3, 1, 3);
    // front hedge
    for (let xx = 0; xx < W; xx++) {
      const bump = Math.round(1.5 + 1.5 * Math.sin(xx / 3.2) + Math.sin(xx / 11));
      px(c, p.hedge, xx, FRONT + 2 - bump, 1, H);
      if (xx % 4 === 1) px(c, p.hedgeHi, xx, FRONT + 3 - bump, 1, 1);
    }
  };

  const frame = () => {
    if (!bg) return;
    ctx.drawImage(bg, 0, 0);
    const p = night ? NIGHT : DAY, step = Math.floor(t * 6) % 2;
    // twinkling stars, blinking cat
    if (night) for (let i = 0; i < stars.length; i += 4) if ((Math.floor(t * 2) + i) % 7 === 0) px(ctx, p.sky1, stars[i][0], stars[i][1]);
    const blink = t % 4 < 0.18;
    px(ctx, "#9C8F7E", cat.x, cat.y + 1, 5, 3); px(ctx, "#9C8F7E", cat.x, cat.y, 1, 1); px(ctx, "#9C8F7E", cat.x + 4, cat.y, 1, 1);
    if (!blink) { const eye = night ? "#F0C66E" : "#2A2A26"; px(ctx, eye, cat.x + 1, cat.y + 2); px(ctx, eye, cat.x + 3, cat.y + 2); }
    px(ctx, "#9C8F7E", cat.x + 5, cat.y + 2 + (Math.floor(t * 1.5) % 2), 1, 2);

    let dx: number, dy: number;
    if (night) {
      dx = bench + 16; dy = FEET - 4;
      sprite(DOG_SLEEP, dx, dy);
      const z = (t * 0.6) % 1;
      text("Z", dx + 9 + Math.round(z * 4), dy - 6 - Math.round(z * 10), `rgba(237,229,211,${(1 - z).toFixed(2)})`);
    } else {
      const sniffing = t < sniffUntil, wx = Math.round(x);
      dx = wx + 14; dy = FEET - 8;
      sprite(sniffing ? WALK_B : step ? WALK_A : WALK_B, wx, FEET - 15);
      sprite(sniffing ? DOG_SNIFF : step ? DOG_A : DOG_B, dx, dy);
      const wag = Math.floor(t * (sniffing ? 9 : 4)) % 2;
      px(ctx, SPR.d, dx + 1, dy + 3 + wag); px(ctx, SPR.d, dx, dy + 2 + wag * 2);
      // leash: hand to collar
      const hx = wx + 6, hy = FEET - 9, cx2 = dx + 7, cy2 = dy + (sniffing ? 4 : 3);
      for (let i = 0; i <= 8; i++) px(ctx, "#B4532A", Math.round(hx + ((cx2 - hx) * i) / 8), Math.round(hy + ((cy2 - hy) * i) / 8 + Math.sin((i / 8) * Math.PI) * 1.5));
    }
    if (t < bubble) {
      const bx = dx + 2, by = dy - 14;
      px(ctx, "#F6F0E4", bx - 2, by - 2, 25, 9); px(ctx, "#F6F0E4", bx + 2, by + 7, 2, 2); px(ctx, "#F6F0E4", bx + 3, by + 9, 1, 1);
      text("WOOF!", bx, by, "#1E4A38");
    }
  };

  const update = (dt: number) => {
    t += dt;
    if (night || t < sniffUntil) return;
    x += 13 * dt;
    if (x > W + 20) { x = -40; toSniff = trees.filter(() => Math.random() < 0.45); }
    const nose = x + 14 + 12;
    const hit = toSniff.findIndex((tx) => nose >= tx - 2);
    if (hit >= 0) { toSniff.splice(hit, 1); sniffUntil = t + 2.4; }
  };

  const loop = (now: number) => {
    if (!last) last = now;
    const dt = Math.min(0.1, (now - last) / 1000);
    // pixel art moves in whole pixels: redraw at ~20fps, a third of the work of every frame
    if (dt < 0.048) { raf = visible ? requestAnimationFrame(loop) : 0; return; }
    last = now;
    update(dt);
    frame();
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  const start = () => { if (!raf && visible && !reduced) { last = 0; raf = requestAnimationFrame(loop); } };

  const resize = () => {
    const cw = canvas.parentElement!.clientWidth;
    scale = cw >= 1200 ? 4 : cw >= 700 ? 3 : 2;
    const nw = Math.ceil(cw / scale);
    if (nw === W) return;
    W = canvas.width = nw; canvas.height = H;
    canvas.style.width = `${W * scale}px`; canvas.style.height = `${H * scale}px`;
    if (!bg || x > W) x = Math.round(W * 0.22); // first paint: pair already on stage
    build();
    toSniff = trees.filter((tx) => tx > x + 30);
    frame();
  };

  const hitDog = (e: PointerEvent | MouseEvent) => {
    const r = canvas.getBoundingClientRect(), lx = (e.clientX - r.left) / scale, ly = (e.clientY - r.top) / scale;
    const dx = night ? bench + 16 : x + 14, dy = night ? FEET - 4 : FEET - 8;
    return lx >= dx - 2 && lx <= dx + 15 && ly >= dy - 3 && ly <= FEET + 1;
  };
  const click = (e: MouseEvent) => { if (hitDog(e)) { bubble = t + 1.4; if (reduced) { frame(); setTimeout(() => { bubble = 0; frame(); }, 1400); } } };
  const hover = (e: PointerEvent) => { canvas.style.cursor = hitDog(e) ? "pointer" : ""; };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); });
  io.observe(canvas);
  canvas.addEventListener("click", click);
  canvas.addEventListener("pointermove", hover);
  resize();

  return {
    setNight(n) { if (n === night) return; night = n; build(); frame(); },
    destroy() { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); canvas.removeEventListener("click", click); canvas.removeEventListener("pointermove", hover); },
  };
}
