import type { User } from './types';

export default function ChatHeader({ me, other, onToggleInfo }: {
  me: User;
  other?: User;
  onToggleInfo: () => void;
}) {
  return (
    <div className="bg-white border-b border-border sticky top-[56px] md:top-0 z-20">
      <div className="container-spy py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#e6eef2] grid place-content-center">{other?.avatar || "👤"}</div>
          <div className="grid">
            <div className="font-semibold leading-tight">{other?.name ?? "…"}</div>
            <div className="text-xs text-muted">Conversation privée</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <a className="page" href={other ? `mailto:test@spymeo.test` : "#"}>✉️ Email</a>
          <button className="page" onClick={onToggleInfo}>ℹ️ Détails</button>
        </div>
      </div>
    </div>
  );
}
