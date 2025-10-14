// Cdw-Spm

"use client";
import { Note } from "./types";

type Props = {
  notes: Note[];
  onSelect: (id: string) => void;
  selectedId?: string;
};

export default function NoteList({ notes, onSelect, selectedId }: Props) {
  return (
    <aside className="soft-card p-3 h-full overflow-y-auto">
      <h2 className="font-semibold mb-3">Mes notes</h2>
      <ul className="grid gap-2">
        {notes.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => onSelect(n.id)}
              className={`w-full text-left p-2 rounded-md transition ${
                n.id === selectedId
                  ? "bg-accent text-white"
                  : "hover:bg-[#f7fbfd]"
              }`}
            >
              <div className="font-medium truncate">{n.title || "Sans titre"}</div>
              <div className="text-xs text-muted">
                {n.updatedAt.toLocaleDateString()} {n.updatedAt.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
