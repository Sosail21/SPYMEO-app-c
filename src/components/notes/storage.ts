// Cdw-Spm

import { Note } from "./types";

const STORAGE_KEY = "spymeo_notes";

export function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((n: any) => ({ ...n, updatedAt: new Date(n.updatedAt) }));
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
