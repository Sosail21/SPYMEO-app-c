// Cdw-Spm
"use client";
import { useState } from "react";

export default function ChatComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <form onSubmit={submit} className="sticky bottom-0 bg-white border-t border-border">
      <div className="container-spy py-3 grid gap-2">
        <div className="flex items-center gap-2">
          <button type="button" className="page">＋</button>
          <input
            className="flex-1 page"
            placeholder="Écrire un message… (Enter envoie, Shift+Enter = saut)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
            }}
          />
          <button className="btn" type="submit">Envoyer</button>
        </div>
        <div className="text-xs text-muted">
          Raccourcis : <kbd>Enter</kbd> pour envoyer • <kbd>Shift</kbd>+<kbd>Enter</kbd> pour nouvelle ligne
        </div>
      </div>
    </form>
  );
}
