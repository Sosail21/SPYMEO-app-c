// Cdw-Spm

"use client";
import { useState, useEffect } from "react";
import { Note } from "./types";

type Props = {
  note: Note | undefined;
  onChange: (n: Note) => void;
};

export default function NoteEditor({ note, onChange }: Props) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
  }, [note?.id]);

  if (!note) return <div className="p-4 text-muted">Sélectionnez une note</div>;

  return (
    <div className="grid gap-3 h-full">
      <input
        className="input-pill font-semibold text-lg"
        value={title}
        placeholder="Titre"
        onChange={(e) => {
          setTitle(e.target.value);
          onChange({ ...note, title: e.target.value, updatedAt: new Date() });
        }}
      />
      <textarea
        className="flex-1 border border-border rounded-lg p-3"
        value={content}
        placeholder="Contenu de la note..."
        onChange={(e) => {
          setContent(e.target.value);
          onChange({ ...note, content: e.target.value, updatedAt: new Date() });
        }}
      />
    </div>
  );
}
