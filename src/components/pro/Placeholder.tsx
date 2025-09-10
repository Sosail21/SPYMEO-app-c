export default function Placeholder({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main className="section">
      <div className="container-spy grid gap-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="soft-card p-4">
          {children ?? <p className="text-muted">TODO : implémentation à venir.</p>}
        </div>
      </div>
    </main>
  );
}
