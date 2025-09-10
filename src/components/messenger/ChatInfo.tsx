import Link from "next/link";
import type { User } from "./types";

export default function ChatInfo({ me, other }: { me: User; other?: User }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border font-semibold">Infos</div>
      <div className="p-4 grid gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6eef2] grid place-content-center text-base">
            {other?.avatar || "👤"}
          </div>
          <div>
            <div className="font-semibold">{other?.name ?? "—"}</div>
            <div className="text-xs text-muted">Utilisateur</div>
          </div>
        </div>
        <div className="grid gap-2">
          <Link className="pill pill-ghost text-center" href={other ? `/pro/messages?to=${other.id}` : "#"}>
            Ouvrir dans SPYM’Com
          </Link>
          <a className="pill pill-ghost text-center" href={other ? `mailto:test@spymeo.test` : "#"}>
            Envoyer un e‑mail
          </a>
        </div>

        <div className="mt-2">
          <div className="text-xs uppercase text-muted mb-1">Confidentialité</div>
          <ul className="list-disc ml-4 text-xs text-muted grid gap-1">
            <li>Messages chiffrés en transit</li>
            <li>Signalements et blocage à venir</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
