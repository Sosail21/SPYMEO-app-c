"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function Initials({ name }: { name?: string }) {
  const initials = (name ?? "U")
    .split(" ").filter(Boolean).map((s) => s[0]?.toUpperCase()).slice(0,2).join("");
  return (
    <div className="w-10 h-10 rounded-full bg-[#e6eef2] text-[#0b1239] grid place-content-center font-semibold">
      {initials || "U"}
    </div>
  );
}

export default function UserAvatarMenu({ name }: { name?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent){ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function onKey(e: KeyboardEvent){ if(e.key === "Escape") setOpen(false); }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen(v=>!v)} title={name || "Compte"}
      >
        <Initials name={name} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-[0_10px_30px_rgba(11,18,57,0.12)] p-2 grid gap-1 z-50">
          <Link role="menuitem" className="page hover:bg-[#f7fbfd]" href="/" onClick={()=>setOpen(false)}>Mon compte</Link>
          <form role="menuitem" action="/api/auth/logout" method="POST">
            <button className="page w-full text-left hover:bg-[#f7fbfd]" type="submit">Se déconnecter</button>
          </form>
        </div>
      )}
    </div>
  );
}
