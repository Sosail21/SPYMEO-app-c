import Link from "next/link";

const DB = {
  "comprendre-errance-medicale": {
    title: "Comprendre l’errance médicale",
    date: "2025-08-20",
    author: "Équipe SPYMEO",
    readingMinutes: 6,
    category: "Santé globale",
    content: `
### Pourquoi parle-t-on d’errance ?
Parce qu'entre symptômes flous, examens rassurants et fatigue chronique, beaucoup se sentent "entre deux". Ici, on **structure la démarche**.

- Clarifier son besoin
- Multiplier les angles (pratiques complémentaires **sérieuses**)
- Documenter ses essais (carnet de vie)
- Reprendre le fil avec son médecin traitant

### 3 pistes concrètes
1. **Journal de bord** : symptômes, contexte, intensité (0–10) → visibilité.
2. **Expérimentations courtes** (2–3 semaines), une à la fois.
3. **Second avis** : quand ? comment le préparer efficacement.

> On ne cherche pas la magie. On construit une **trajectoire** utile.
    `,
  },
} as const;

export default function BlogPost({ params }: { params: { slug: string } }) {
  const data = DB[params.slug as keyof typeof DB];
  return (
    <main>
      <section className="post-hero">
        <div className="post-hero-inner">
          <div className="post-hero-media" />
          <div>
            <span className="badge">{data?.category ?? "SPYM'Blog"}</span>
            <h1 className="section-title" style={{ marginTop: 8 }}>
              {data?.title ?? "Article"}
            </h1>
            <p className="muted">
              {formatDate(data?.date)} · {data?.readingMinutes ?? 5} min · {data?.author ?? "Équipe SPYMEO"}
            </p>
            <div className="mt-2">
              <Link className="btn btn-outline" href="/blog">← Retour au blog</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="post-layout">
          <article className="prose card p-6">
            <div
              dangerouslySetInnerHTML={{ __html: mdToHtml(data?.content ?? "*Contenu bientôt disponible.*") }}
            />
          </article>
          <aside className="grid gap-4">
            <div className="soft-card p-4">
              <h3 className="m-0 mb-2">À lire aussi</h3>
              <ul className="grid gap-2">
                <li><Link className="link-muted" href="/blog/consommer-local-responsable">Consommer local & responsable</Link></li>
                <li><Link className="link-muted" href="/blog/bien-choisir-son-praticien">Bien choisir son praticien</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "2-digit" });
  } catch {
    return iso;
  }
}

// mini markdown → HTML (juste pour la maquette)
function mdToHtml(md: string) {
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/\n$/gim, "<br/>")
    .replace(/\n\n/g, "<br/><br/>");
}