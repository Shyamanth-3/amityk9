"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import s from "../admin.module.css";

// Shows the ?error= message from a failed save, then tidies the address bar.
// The message stays until the owner presses another button.
export default function Notice() {
  const params = useSearchParams();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const e = params.get("error");
    if (!e) return;
    setMsg(e);
    const rest = new URLSearchParams(params);
    rest.delete("error");
    window.history.replaceState(null, "", location.pathname + (rest.size ? `?${rest}` : ""));
  }, [params]);

  useEffect(() => {
    if (!msg) return;
    const clear = (e: MouseEvent) => { if ((e.target as Element).closest("button")) setMsg(null); };
    document.addEventListener("click", clear, true);
    return () => document.removeEventListener("click", clear, true);
  }, [msg]);

  return msg ? <p className={s.error} role="alert" style={{ marginBottom: 18 }}>{msg}</p> : null;
}
