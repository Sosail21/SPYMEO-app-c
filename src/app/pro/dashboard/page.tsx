import Link from "next/link";

const CARDS = [
  { title: "Ma fiche", desc: "Votre fiche publique SPYMEO", href: "/pro/fiche" },
  { title: "SPYM'Com", desc: "Espace d’échanges façon Discord", href: "/pro/spymcom" },
  { title: "Répertoire SPYMEO", desc: "Annuaire des membres", href: "/pro/repertoire/spymeo" },
  { title: "Répertoire perso", desc: "Vos contacts privés", href: "/pro/repertoire/perso" },
  { title: "Notes", desc: "Prise de notes personnelle", href: "/pro/notes" },
  { title: "Messagerie", desc: "Messages (pro ⇄ PASS/Pros)", href: "/pro/messages" },
];

export default function Page() {
  return (
    <main className="section">
      <div className="container-spy grid gap-6">
        <header className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted">Accédez rapidement à vos espaces clés.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="soft-card p-4 hover:shadow-lg hover:-translate-y-[2px] transition">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-muted">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
