// Shared SVG symbols, referenced with <use href="#paw" /> etc.
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="paw" viewBox="0 0 32 32"><ellipse cx="16" cy="21.5" rx="7.2" ry="6.2"/><ellipse cx="7.3" cy="13.8" rx="3" ry="3.7" transform="rotate(-18 7.3 13.8)"/><ellipse cx="12.6" cy="8.4" rx="3" ry="3.8" transform="rotate(-6 12.6 8.4)"/><ellipse cx="19.4" cy="8.4" rx="3" ry="3.8" transform="rotate(6 19.4 8.4)"/><ellipse cx="24.7" cy="13.8" rx="3" ry="3.7" transform="rotate(18 24.7 13.8)"/></symbol>
        <symbol id="chat" viewBox="0 0 24 24"><path d="M12 3.2c-4.9 0-8.8 3.6-8.8 8.1 0 1.7.6 3.3 1.6 4.6L4 20.6l4.9-1.5c.9.3 2 .5 3.1.5 4.9 0 8.8-3.6 8.8-8.1S16.9 3.2 12 3.2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9.2 9.1c.2-.4.5-.4.7-.4h.4c.2 0 .3.1.4.3l.6 1.4c.1.2 0 .4-.1.5l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.1.3-.2.5-.1l1.4.6c.2.1.3.2.3.4v.4c0 .3-.1.6-.5.8-.5.3-1.3.5-2.3.1-1.8-.7-3.3-2.1-4.1-3.9-.4-1-.2-1.8.1-2.3Z" fill="currentColor"/></symbol>
        <symbol id="tick" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8.2" fill="none" stroke="currentColor" strokeOpacity=".25"/><path d="M5.4 9.2 7.8 11.5 12.6 6.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      </defs>
    </svg>
  );
}

export const Icon = ({ id, className }: { id: "paw" | "chat" | "tick"; className?: string }) => (
  <svg className={className} aria-hidden="true"><use href={`#${id}`} /></svg>
);
