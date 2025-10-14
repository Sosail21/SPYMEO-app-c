// Cdw-Spm
// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7fbfc]">
      {/* Topbar admin */}
      <div className="container-spy mt-3 md:mt-4">
        <AdminTopbar />
      </div>

      {/* Shell principal */}
      <div className="container-spy mt-3 md:mt-5 grid gap-4 md:grid-cols-[260px_1fr] items-start">
        <aside className="hidden md:block sticky top-4 self-start">
          <Sidebar />
        </aside>

        <main className="space-y-4 compact-sections">
          {children}
        </main>
      </div>
    </div>
  );
}
