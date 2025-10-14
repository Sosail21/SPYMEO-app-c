// Cdw-Spm

"use client";
import { useState, useEffect } from "react";
import { Note } from "./types";
import { loadNotes, saveNotes } from "./storage";
import NoteList from "./NoteList";
import NoteEditor from "./NoteEditor";

export default function NotesShell() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  function updateNote(updated: Note) {
    const newNotes = notes.map((n) => (n.id === updated.id ? updated : n));
    setNotes(newNotes);
    saveNotes(newNotes);
  }

  function addNote() {
    const newNote: Note = {
      id: Math.random().toString(36).slice(2),
      title: "Nouvelle note",
      content: "",
      updatedAt: new Date(),
    };
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    saveNotes(newNotes);
    setSelectedId(newNote.id);
  }

  const selected = notes.find((n) => n.id === selectedId);

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-4 h-[calc(100vh-120px)]">
      <div className="flex flex-col">
        <button className="btn mb-2" onClick={addNote}>+ Nouvelle note</button>
        <NoteList notes={notes} onSelect={setSelectedId} selectedId={selectedId} />
      </div>
      <div className="soft-card p-4">
        <NoteEditor note={selected} onChange={updateNote} />
      </div>
    </div>
  );
}
