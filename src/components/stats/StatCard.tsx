// Cdw-Spm
"use client";

export default function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="soft-card p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
