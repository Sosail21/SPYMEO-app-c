"use client";
export default function SidebarPatients() {
  return (
    <aside className="w-64 bg-white border-r border-border p-4 flex flex-col gap-2">
      <button className="btn">+ Nouveau patient</button>
      <nav className="flex flex-col gap-2 text-sm">
        <a className="page">Listing Patients</a>
        <a className="page">Listing Consultations</a>
        <a className="page">Agenda</a>
        <a className="page">Messagerie</a>
        <a className="page">Statistiques</a>
      </nav>
    </aside>
  );
}
