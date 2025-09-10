"use client";
export default function PatientSection({ title }: { title: string }) {
  return (
    <section className="bg-white border border-border rounded-lg shadow-sm p-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="text-sm text-muted">[Contenu à venir]</div>
    </section>
  );
}
