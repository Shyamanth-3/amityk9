// Faint line-art drawings that fill the empty margins and gaps between sections.
// Pure decoration: inline SVG strokes (no downloads), hidden from screen readers.
import s from "./Doodles.module.css";

type P = { className?: string };
const svg = (vb: string, cls: string | undefined, children: React.ReactNode) => (
  <svg className={`${s.doodle} ${cls ?? ""}`} viewBox={vb} aria-hidden="true" focusable="false">{children}</svg>
);

// beagle with its nose to the grass, facing left
export const DogSniff = ({ className }: P) => svg("0 0 240 130", className, <>
  <path d="M188 52c6-12 10-24 8-38-2 10-6 22-10 32" />{/* tail up */}
  <path d="M188 52c-28-10-60-12-80-6-12 4-20 10-26 16" />{/* back to neck */}
  <path d="M82 62c-6-4-14-2-18 4-6 10-14 24-20 34" />{/* forehead and muzzle */}
  <path d="M44 100c-2 4 0 8 4 7 8-3 16-9 22-13 6-2 12-2 18 0" />{/* nose, jaw, throat */}
  <path d="M88 94c4 4 4 12 4 22M100 116c0-8 1-14 4-18 20-4 44-4 62-2 2 6 4 12 2 20" />{/* chest, legs, belly */}
  <path d="M180 116c4-12 12-24 12-40 0-10-2-18-4-24" />{/* hind leg */}
  <path d="M108 116l2-12M160 116l2-12" />{/* far legs */}
  <path d="M80 64c-8 6-10 22-6 32 6 2 10-4 10-12 0-8-2-14-4-20" />{/* floppy ear */}
  <path d="M86 58c4 8 6 20 4 30" />{/* collar */}
  <path d="M120 46c10 14 40 14 56 4" strokeDasharray="3 5" />{/* saddle marking */}
  <circle cx="64" cy="74" r="1.8" className={s.fill} />
  <path d="M34 106l-7-3M35 111h-8" />{/* sniff */}
  <path d="M10 116h220" className={s.ground} />{/* replaced by the leash where it's drawn */}
  <path d="M28 116l-4-8M34 116l2-9M200 116l-3-7M206 116l3-8" />
</>);

// cat asleep in a loaf, tail wrapped round
export const CatCurl = ({ className }: P) => svg("0 0 180 110", className, <>
  <path d="M34 86c-10-20 6-50 50-52 42-2 64 22 62 44-2 14-22 20-58 20-30 0-48-2-54-12z" />
  <path d="M146 78c6 14-18 22-58 21-16 0-24-4-20-10" />
  <path d="M34 86c-8-6-10-20-2-28 8-7 22-8 30-2" />
  <path d="M33 60l-3-14 12 9M52 54l5-12 6 14" />
  <path d="M38 72q4 3 8 0M52 71q4 3 8 0" />
  <path d="M46 80l-1 2 2 0" />
  <path d="M120 22q4-2 6 0-4 4 0 4h6M132 12q3-2 5 0-3 3 0 3h5" />
</>);

// a leafy sprig
export const Sprig = ({ className }: P) => svg("0 0 120 180", className, <>
  <path d="M62 176c-4-40 2-100-4-168" />
  {[[150, 1], [122, -1], [96, 1], [70, -1], [46, 1], [24, -1]].map(([y, d]) => (
    // leaf from the stem out to a tip, back along the other edge
    <path key={y} d={`M60 ${y}Q${60 + d * 40} ${y - 6} ${60 + d * 40} ${y - 30}Q${60 + d * 8} ${y - 28} 60 ${y}M60 ${y}L${60 + d * 30} ${y - 20}`} />
  ))}
</>);

// Charminar, quick ink sketch
export const Charminar = ({ className }: P) => svg("0 0 150 160", className, <>
  <path d="M22 156V46M34 156V46M116 156V46M128 156V46" />
  <path d="M22 46c0-12 12-12 12 0M116 46c0-12 12-12 12 0M28 36V24M122 36V24" />
  <path d="M18 76h20M18 106h20M112 76h20M112 106h20" />
  <path d="M34 72h82M34 84h82M34 156h82" />
  <path d="M42 80v-4m10 4v-4m10 4v-4m10 4v-4m10 4v-4m10 4v-4m10 4v-4" />
  <path d="M54 156v-42c0-24 42-24 42 0v42" />
  <path d="M62 72c0-16 26-16 26 0M75 56v-6" />
</>);

// a curving line of paw prints (filled, very faint)
export const PawTrail = ({ className }: P) => svg("0 0 160 300", className, <>
  {[[26, 280, -10], [70, 250, 8], [40, 206, -16], [86, 176, 4], [58, 130, -20], [106, 104, 0], [84, 58, -24], [130, 30, -6]].map(([x, y, r]) => (
    <use key={y} href="#paw" x={x - 14} y={y - 14} width="28" height="28" transform={`rotate(${r} ${x} ${y})`} className={s.paw} />
  ))}
</>);
