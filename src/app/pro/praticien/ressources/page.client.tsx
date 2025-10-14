// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";

type Resource = {
  id: string;
  title: string;
  category: string;         // "Respiration", "Nutrition", "Exercices", etc.
  format: "pdf" | "image" | "doc" | "sheet" | "link";
  level?: "débutant" | "intermédiaire" | "avancé";
  tags?: string[];
  sizeKb?: number;
  updatedAt?: string;
  coverUrl?: string;
  downloadUrl?: string;
  shareable?: boolean;
};

export default function ResourcesPageClient() {
  const [all, setAll] = useState<Resource[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [onlyShareable, setOnlyShareable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/resources")
      .then(r => r.json())
      .then((data: Resource[]) => { if (!cancelled) setAll(data); })
      .catch(() => { if (!cancelled) setAll([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const s = new Set(all.map(r => r.category));
    return ["all", ...Array.from(s)];
  }, [all]);

  const formats = useMemo(() => {
    const s = new Set(all.map(r => r.format));
    return ["all", ...Array.from(s)];
  }, [all]);

  const filtered = useMemo(() => {
    return all.filter(r => {
      if (q) {
        const hay = [r.title, r.category, r.tags?.join(" ")].join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (cat !== "all" && r.category !== cat) return false;
      if (format !== "all" && r.format !== format) return false;
      if (level !== "all" && r.level !== level) return false;
      if (onlyShareable && !r.shareable) return false;
      return true;
    });
  }, [all, q, cat, format, level, onlyShareable]);

  return (
    <div className="grid gap-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ressources</h1>
          <p className="text-muted">Bibliothèque de supports à consulter, télécharger et partager à vos clients.</p>
        </div>
        <a href="/pro/ressources/mes-partages" className="btn btn-outline">Mes partages</a>
      </header>

      {/* Barre de recherche + filtres */}
      <div className="soft-card p-3 grid gap-3">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="search-wrap">
            <input
              className="input-pill"
              placeholder="Rechercher une ressource (ex: respiration, nutrition...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="pill pill-ghost flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyShareable}
                onChange={(e) => setOnlyShareable(e.target.checked)}
              />
              Partageables aux clients uniquement
            </label>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <select className="pill pill-ghost" value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c === "all" ? "Toutes catégories" : c}</option>)}
          </select>
          <select className="pill pill-ghost" value={format} onChange={(e) => setFormat(e.target.value)}>
            {formats.map(f => <option key={f} value={f}>{f === "all" ? "Tous formats" : f.toUpperCase()}</option>)}
          </select>
          <select className="pill pill-ghost" value={level} onChange={(e) => setLevel(e.target.value)}>
            {["all", "débutant", "intermédiaire", "avancé"].map(l => (
              <option key={l} value={l}>{l === "all" ? "Tous niveaux" : l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille de ressources */}
      {loading ? (
        <div className="soft-card p-6 text-center text-muted">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="soft-card p-6 text-center">
          <div className="text-lg font-semibold mb-1">Aucune ressource</div>
          <p className="text-muted">Ajuste ta recherche ou tes filtres.</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(r => (
            <article key={r.id} className="soft-card overflow-hidden group hover:shadow-[0_12px_30px_rgba(11,18,57,0.15)] transition">
              <div className="h-40 bg-[#e6eef2]" style={r.coverUrl ? { backgroundImage:`url(${r.coverUrl})`, backgroundSize:"cover", backgroundPosition:"center" } : undefined} />
              <div className="p-4 grid gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{r.title}</h3>
                  <span className="pill pill-muted text-xs">{r.format.toUpperCase()}</span>
                </div>
                <p className="text-sm text-muted">
                  {r.category}{r.level ? ` · ${r.level}` : ""}{r.updatedAt ? ` · maj ${new Date(r.updatedAt).toLocaleDateString("fr-FR")}` : ""}
                </p>
                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {r.tags.slice(0, 4).map(t => <span key={t} className="pill pill-muted text-xs">{t}</span>)}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  {r.downloadUrl && (
                    <a className="pill pill-ghost" href={r.downloadUrl} download target="_blank" rel="noreferrer">Télécharger</a>
                  )}
                  <button
                    className="pill pill-solid"
                    onClick={() => alert("Partagé au client (mock)")}
                    disabled={!r.shareable}
                    title={r.shareable ? "Partager à un client (mock)" : "Non partageable"}
                  >
                    Partager au client
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}