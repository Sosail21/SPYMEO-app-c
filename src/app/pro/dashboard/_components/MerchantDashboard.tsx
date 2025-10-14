// Cdw-Spm
"use client";

function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`soft-card border border-slate-200 bg-white rounded-2xl shadow-sm ${className}`}>{children}</div>;
}
function SectionTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-sm font-semibold text-slate-900">{children}</h3>;
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
function Badge({ tone = "default", children }: { tone?: "ok" | "warn" | "default"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{children}</span>;
}

export default function MerchantDashboard({ name }: { name: string }) {
  const stats = {
    ordersYesterday: 6,
    revenueYesterday: 274.2,
    views: 320,
    likes: 28,
    stockAlerts: 3,
  };
  const topOrders = [
    { id: "CMD-1023", title: "Tisane détox bio", qty: 2, total: 25.8, when: "il y a 2h" },
    { id: "CMD-1022", title: "Huile essentielle lavande", qty: 1, total: 9.5, when: "hier" },
  ];
  const lowStock = [
    { sku: "HEL-010", title: "Huile essentielle lavande", stock: 0 },
    { sku: "TDX-100", title: "Tisane détox bio 100g", stock: 2 },
    { sku: "BGL-001", title: "Bouillotte graines de lin", stock: 5 },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Col 1 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Commandes récentes</SectionTitle>
          <div className="mt-2 space-y-2 text-sm">
            {topOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.id}</div>
                  <div className="text-xs text-slate-500">
                    {o.title} · {o.qty} ×
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{o.total.toFixed(2)} €</div>
                  <div className="text-xs text-slate-500">{o.when}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="/pro/ventes/commandes" className="text-sky-700 text-xs mt-3 inline-block">
            Voir toutes les commandes
          </a>
        </Card>

        <Card className="p-4">
          <SectionTitle>A faire aujourd’hui</SectionTitle>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" /> Préparer les envois 10h30
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" /> Mettre à jour stock “Lavande”
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" /> Publier “Coffret détente”
            </li>
          </ul>
        </Card>
      </div>

      {/* Col 2 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Chiffres rapides (veille)</SectionTitle>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label="Commandes" value={stats.ordersYesterday} />
            <Stat label="CA TTC" value={`${stats.revenueYesterday.toFixed(2)} €`} />
            <Stat label="Vues catalogue" value={stats.views} />
            <Stat label="Likes" value={stats.likes} />
            <Stat label="Alertes stock" value={stats.stockAlerts} />
            <Stat label="Taux conv." value={"3,2%"} />
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Alertes stock</SectionTitle>
          <div className="mt-2 space-y-2 text-sm">
            {lowStock.map((p) => (
              <div key={p.sku} className="flex items-center justify-between">
                <div>
                  {p.title} <span className="text-xs text-slate-500">({p.sku})</span>
                </div>
                <Badge tone={p.stock === 0 ? "warn" : "default"}>
                  {p.stock === 0 ? "Rupture" : `${p.stock} restants`}
                </Badge>
              </div>
            ))}
          </div>
          <a href="/pro/stock" className="text-sky-700 text-xs mt-3 inline-block">
            Gérer le stock
          </a>
        </Card>
      </div>

      {/* Col 3 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Raccourcis</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <a className="btn-ghost" href="/pro/catalogue">
              Catalogue
            </a>
            <a className="btn-ghost" href="/pro/ventes/commandes">
              Commandes
            </a>
            <a className="btn-ghost" href="/pro/catalogue/nouveau-produit">
              Nouveau produit
            </a>
            <a className="btn-ghost" href="/pro/precompta">
              Pré-compta
            </a>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Messages récents</SectionTitle>
          <div className="mt-2 text-sm space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <b>Julie</b> — “Le point relais ?”
              </div>
              <a href="/pro/messages" className="text-sky-700 text-xs">
                Répondre
              </a>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <b>Antoine</b> — “Dispo en boutique ?”
              </div>
              <a href="/pro/messages" className="text-sky-700 text-xs">
                Répondre
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm italic text-slate-700">“Progresser un peu, mais tous les jours.”</div>
          <div className="text-xs text-slate-500 mt-1">— James Clear</div>
        </Card>
      </div>
    </div>
  );
}
