// Cdw-Spm
"use client";

export default function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="soft-card p-4 flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}
