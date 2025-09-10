"use client";
import { useState } from "react";
import type { Conversation, User } from "./types";

export default function ConversationList({
  me,
  conversations,
  activeId,
  onSelect,
  onSearch,
}: {
  me: User;
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onSearch: (q: string) => void;
}) {
  const [q, setQ] = useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between gap-2">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-word">Messages</span>
        </div>
      </div>

      <div className="p-3">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Rechercher une conversation…"
          className="input-pill w-full"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 grid gap-1">
        {conversations.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`text-left rounded-lg p-3 border border-transparent hover:bg-[#f7fbfd] transition ${
                active ? "bg-[#e9f8fb] text-[#0b5b68] border-accent/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e6eef2] grid place-content-center text-base">
                  {c.with.avatar || "👤"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{c.with.name}</div>
                    <div className="text-[11px] text-muted shrink-0">
                      {new Date(c.lastAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-sm text-muted truncate">{c.lastMessage}</div>
                </div>
                {c.unread ? <span className="text-[11px] bg-accent text-white px-2 py-0.5 rounded-full">{c.unread}</span> : null}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
