import { Icon } from "./Icons";
import s from "./Marquee.module.css";

const ITEMS = ["Gated communities only", "Same walker, every week", "Monday to Saturday", "A photo after every visit", "Dogs and cats, all sizes", "Hyderabad"];

// CSS-only loop: the list is rendered twice and the track slides by half its width.
export default function Marquee() {
  const row = (hidden?: boolean) => (
    <ul className={s.row} aria-hidden={hidden}>
      {ITEMS.map((t) => <li key={t}>{t}<Icon id="paw" /></li>)}
    </ul>
  );
  return (
    <div className={s.band}>
      <div className={s.track}>{row()}{row(true)}</div>
    </div>
  );
}
