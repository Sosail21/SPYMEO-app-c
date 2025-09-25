// src/components/admin/CommandPalette.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type Command = {
  id: string;
  title: string;
  subtitle?: string;
  section: string;        // ex: "Navigation", "Actions"
  href?: string;          // navigation
  onRun?: () => void;     // action custom
  icon?: string;          // émoji/icone
  shortcut?: string;      // libellé indicatif (ex: "U")
};

type Props = {
  open: boolean;
  onClose: () => void;
  commands: Command[];
};

export default function CommandPalette({ open, onClose, commands }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filtrage simple (title + subtitle)
  const results = useMemo(() => {
    const hay = q.trim().toLowerCase();
    const base = !hay
      ? commands
      : commands.filter((c) =>
          (c.title + " " + (c.subtitle || "")).toLowerCase().includes(hay)
        );
    // group by section
    const bySection = base.reduce<Record<string, Command[]>>((acc, c) => {
      acc[c.section] = acc[c.section] || [];
      acc[c.section].push(c);
      return acc;
    }, {});
    const sections = Object.entries(bySection)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, items]) => ({ name, items }));
    return sections;
  }, [q, commands]);

  // Focus input à l’ouverture
  useEffect(() => {
    if (open) {
      setQ("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Fermer sur ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Navigation clavier ↑ ↓ Enter
  const flatResults = results.flatMap((s) => s.items);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!flatResults.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(flatResults.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = flatResults[activeIdx];
        if (!cmd) return;
        run(cmd);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flatResults, activeIdx]);

  function run(cmd: Command) {
    onClose();
    if (cmd.href) router.push(cmd.href);
    else if (cmd.onRun) cmd.onRun();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[90%] max-w-2xl soft-card p-0 overflow-hidden">
        {/* Barre de recherche */}
        <div className="border-b border-slate-100 p-2">
          <div className="flex items-center gap-2 px-2">
            <span className="text-slate-500">⌘K</span>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une page ou une action…"
              className="w-full px-2 py-2 text-sm rounded-md outline-none"
              aria-label="Recherche admin"
            />
          </div>
        </div>

        {/* Résultats */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-auto p-2 grid gap-2"
        >
          {flatResults.length === 0 ? (
            <div className="p-6 text-center text-slate-600">
              Aucun résultat pour <strong>“{q}”</strong>
            </div>
          ) : (
            results.map((section, sectionIdx) => (
              <div key={section.name} className="grid gap-1">
                <div className="px-2 pt-1 text-[12px] uppercase tracking-wide text-slate-500">
                  {section.name}
                </div>
                {section.items.map((c) => {
                  const idx = flatResults.findIndex((x) => x.id === c.id);
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => run(c)}
                      className={`text-left w-full rounded-lg px-3 py-2 transition ${
                        isActive
                          ? "bg-[#f2fbfd] text-accent"
                          : "hover:bg-[#f7fafb]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {c.icon && <span className="shrink-0">{c.icon}</span>}
                        <div className="min-w-0">
                          <div className="truncate font-medium">{c.title}</div>
                          {c.subtitle && (
                            <div className="truncate text-xs text-slate-600">
                              {c.subtitle}
                            </div>
                          )}
                        </div>
                        {c.shortcut && (
                          <kbd className="ml-auto text-[11px] text-slate-500">
                            {c.shortcut}
                          </kbd>
                        )}
                      </div>
                    </button>
                  );
                })}
                {sectionIdx < results.length - 1 && (
                  <div className="h-2" aria-hidden />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
