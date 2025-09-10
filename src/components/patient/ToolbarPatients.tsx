"use client";
export default function ToolbarPatients() {
  return (
    <header className="flex items-center justify-between bg-white border border-border rounded-lg p-4 shadow-sm">
      <h1 className="font-semibold text-lg">Fiche Patient</h1>
      <div className="flex gap-2">
        <button className="btn">Enregistrer</button>
        <button className="btn btn-outline">Actions</button>
      </div>
    </header>
  );
}
