// src/app/user/pass/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  type PassSnapshot,
  type PassResource,
  type PassDiscount,
  type CarnetShipmentStatus,
  withComputedCarnet,
  MOCK_PASS_SNAPSHOT,
} from "@/lib/mockdb/pass";

type Tab = "RESSOURCES" | "REDUCTIONS" | "CARNET" | "OFFRE";

export default function ManagePassPage() {
  const [snap, setSnap] = useState<PassSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("RESSOURCES");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/user/pass", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const j = await r.json();
        if (!cancel) setSnap(j?.pass ?? null);
      } catch {
        if (!cancel) setSnap(withComputedCarnet(MOCK_PASS_SNAPSHOT));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // ⇅ Actions API
  async function togglePlan(target?: "ANNUAL" | "MONTHLY") {
    try {
      const r = await fetch("/api/user/pass/toggle-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: target ? JSON.stringify({ plan: target }) : "{}",
      });
      if (!r.ok) throw new Error("toggle failed");
      const j = await r.json();
      setSnap(j?.pass ?? null);
    } catch {
      alert("Impossible de changer la formule (à implémenter côté back).");
    }
  }
  async function incrementMonth() {
    try {
      const r = await fetch("/api/user/pass/increment-month", { method: "POST" });
      if (!r.ok) throw new Error("increment failed");
      const j = await r.json();
      setSnap(j?.pass ?? null);
    } catch {
      alert("Impossible d'incrémenter le mois (à implémenter côté back).");
    }
  }

  const isActive = !!snap?.active;
  const isAnnual = snap?.plan === "ANNUAL";

  const sortedResources = useMemo<PassResource[]>(
    () =>
      (snap?.resources ?? [])
        .slice()
        .sort((a, b) => a.month.localeCompare(b.month))
        .reverse(),
    [snap]
  );
  const recentDiscounts = useMemo<PassDiscount[]>(
    () => (snap?.discounts ?? []).slice(0, 6),
    [snap]
  );

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* HERO */}
      <section className="section">
        <div className="soft-card p-5 bg-[linear-gradient(135deg,#0b1239,#1a2e6e)] text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm opacity-80">Espace PASS</div>
              <h1 className="text-2xl md:text-3xl font-semibold">Gérer mon PASS</h1>
              <p className="opacity-90">
                Accès illimité à vos ressources mensuelles tant que le PASS est actif.
              </p>
            </div>
            <div className="grid gap-2 justify-items-start md:justify-items-end">
              <span className="pill bg-white/15 border border-white/20">
                {isActive ? "PASS actif" : "PASS inactif"}
              </span>
              {isActive && (
                <span className="text-sm opacity-90">
                  {isAnnual
                    ? "Abonnement annuel"
                    : `Mensuel — prochain prélèvement : ${fmtDate(snap?.nextBillingAt)}`}
                </span>
              )}
            </div>
          </div>

          {/* Aperçu */}
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <div className="soft-card p-4 bg-white/95 text-[#0b1239]">
              <div className="text-sm opacity-70">Ressources débloquées</div>
              <div className="text-2xl font-semibold">{snap?.resources?.length ?? 0}</div>
            </div>
            <div className="soft-card p-4 bg-white/95 text-[#0b1239]">
              <div className="text-sm opacity-70">Réductions partenaires</div>
              <div className="text-2xl font-semibold">{snap?.discounts?.length ?? 0}</div>
            </div>
            <div className="soft-card p-4 bg-white/95 text-[#0b1239]">
              <div className="text-sm opacity-70">Carnet de vie</div>
              <div className="text-2xl font-semibold">
                {labelCarnet(snap?.carnet?.status)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onglets */}
      <section className="section">
        <div className="soft-card p-3">
          <nav className="chips-row my-0">
            {(["RESSOURCES", "REDUCTIONS", "CARNET", "OFFRE"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={"chip " + (tab === k ? "chip-active" : "")}
                onClick={() => setTab(k)}
              >
                {k === "RESSOURCES"
                  ? "Ressources mensuelles"
                  : k === "REDUCTIONS"
                  ? "Réductions"
                  : k === "CARNET"
                  ? "Carnet de vie"
                  : "Mon offre"}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Contenu */}
      <section className="section">
        {loading ? (
          <div className="soft-card p-5 animate-pulse h-40" />
        ) : !snap ? (
          <div className="soft-card p-8 text-center">
            <h3 className="text-lg font-semibold">Votre PASS n’est pas actif</h3>
            <p className="text-slate-600 mt-1">
              Souscrivez pour débloquer les avantages et ressources mensuelles.
            </p>
            <div className="mt-4">
              <Link href="/pass" className="btn">
                Découvrir le PASS
              </Link>
            </div>
          </div>
        ) : tab === "RESSOURCES" ? (
          <ResourcesPanel resources={sortedResources} active={isActive} />
        ) : tab === "REDUCTIONS" ? (
          <DiscountsPanel discounts={recentDiscounts} />
        ) : tab === "CARNET" ? (
          <CarnetPanel
            status={snap.carnet.status}
            note={snap.carnet.note}
            eta={snap.carnet.eta}
            plan={snap.plan}
            monthsPaid={snap.monthsPaid}
          />
        ) : (
          <OfferPanel
            snapshot={snap}
            onTogglePlan={togglePlan}
            onIncrementMonth={incrementMonth}
          />
        )}
      </section>
    </main>
  );
}

/* ————— PANELS ————— */

function ResourcesPanel({
  resources,
  active,
}: {
  resources: PassResource[];
  active: boolean;
}) {
  if (!resources.length) {
    return (
      <div className="soft-card p-8 text-center">
        <h3 className="font-semibold text-lg">Aucune ressource pour l’instant</h3>
        <p className="text-muted mt-1">
          Votre première ressource sera débloquée ce mois-ci.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {resources.map((r) => (
        <article
          key={r.id}
          className="soft-card p-4 grid md:grid-cols-[1fr_auto] gap-3 items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <strong>{r.title}</strong>
              <span className="affinity">{labelResType(r.type)}</span>
            </div>
            <div className="text-sm text-muted">
              Ressource du {labelMonth(r.month)}
              {r.description ? ` • ${r.description}` : ""}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={active && r.url ? r.url : "#"}
              className="pill pill-ghost"
              onClick={(e) => {
                if (!active || !r.url) {
                  e.preventDefault();
                  alert(active ? "Lien indisponible (à implémenter)" : "PASS inactif");
                }
              }}
            >
              {r.type === "PODCAST"
                ? "Écouter"
                : r.type === "VIDEO"
                ? "Regarder"
                : "Ouvrir"}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function DiscountsPanel({ discounts }: { discounts: PassDiscount[] }) {
  if (!discounts.length) {
    return (
      <div className="soft-card p-8 text-center">
        <h3 className="font-semibold text-lg">Pas encore d’avantages</h3>
        <p className="text-muted mt-1">
          Revenez bientôt, de nouveaux partenaires arrivent.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      {discounts.map((d) => (
        <div
          key={d.id}
          className="soft-card p-4 flex items-center justify-between gap-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <strong>{d.name}</strong>
              <span className="affinity">{d.kind}</span>
            </div>
            <div className="text-sm text-muted">
              {d.city ? `${d.city} • ` : ""}Réduction&nbsp;:{" "}
              <strong>{d.rate}%</strong>
            </div>
          </div>
          <Link href={d.href} className="pill pill-ghost">
            Voir la fiche
          </Link>
        </div>
      ))}
    </div>
  );
}

function CarnetPanel({
  status,
  note,
  eta,
  plan,
  monthsPaid,
}: {
  status?: CarnetShipmentStatus;
  note?: string;
  eta?: string;
  plan: "ANNUAL" | "MONTHLY";
  monthsPaid: number;
}) {
  const map: Record<CarnetShipmentStatus, { label: string; cls: string }> = {
    NOT_ELIGIBLE: { label: "Non éligible", cls: "bg-slate-100 text-slate-700" },
    PENDING: { label: "En préparation", cls: "bg-amber-100 text-amber-700" },
    PROCESSING: { label: "En cours d’envoi", cls: "bg-amber-100 text-amber-700" },
    SHIPPED: { label: "Expédié", cls: "bg-blue-100 text-blue-700" },
    DELIVERED: { label: "Livré", cls: "bg-emerald-100 text-emerald-700" },
  };
  const it = map[status ?? "NOT_ELIGIBLE"];

  return (
    <div className="soft-card p-5 grid gap-4">
      <div className="flex items-center gap-2">
        <span className={`pill ${it.cls}`}>{it.label}</span>
        <span className="text-sm text-muted">{note || "—"}</span>
      </div>

      <ul className="text-sm text-muted grid gap-1">
        <li>
          <strong>Formule :</strong>{" "}
          {plan === "ANNUAL"
            ? "Annuel (carnet envoyé à l’activation)"
            : "Mensuel (carnet après 6 mois)"}
        </li>
        {plan === "MONTHLY" && (
          <li>
            <strong>Mois de cotisation :</strong> {monthsPaid}/6
          </li>
        )}
        {eta && (
          <li>
            <strong>Estimation d’envoi :</strong> {fmtDate(eta)}
          </li>
        )}
      </ul>

      <div className="mt-2 flex gap-2">
        <button
          className="pill pill-ghost"
          onClick={() => alert("Changer d’adresse postale (à implémenter)")}
        >
          Mettre à jour mon adresse d’envoi
        </button>
        <button
          className="pill pill-muted"
          onClick={() => alert("Contacter le support (à implémenter)")}
        >
          Besoin d’aide ?
        </button>
      </div>
    </div>
  );
}

function OfferPanel({
  snapshot,
  onTogglePlan,
  onIncrementMonth,
}: {
  snapshot: PassSnapshot;
  onTogglePlan: (target?: "ANNUAL" | "MONTHLY") => void;
  onIncrementMonth: () => void;
}) {
  const isAnnual = snapshot.plan === "ANNUAL";
  return (
    <div className="soft-card p-5 grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="soft-card p-4">
          <h3 className="font-semibold">Mon abonnement</h3>
          <ul className="text-sm text-muted mt-2 grid gap-1">
            <li>
              <strong>Statut :</strong> {snapshot.active ? "Actif" : "Inactif"}
            </li>
            <li>
              <strong>Plan :</strong> {isAnnual ? "Annuel" : "Mensuel"}
            </li>
            <li>
              <strong>Début :</strong> {fmtDate(snapshot.startedAt)}
            </li>
            {snapshot.nextBillingAt && (
              <li>
                <strong>Prochain prélèvement :</strong>{" "}
                {fmtDate(snapshot.nextBillingAt)}
              </li>
            )}
            {snapshot.plan === "MONTHLY" && (
              <li>
                <strong>Mois de cotisation :</strong> {snapshot.monthsPaid}/6
              </li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="btn btn-outline"
              onClick={() => onTogglePlan()}
              title={isAnnual ? "Passer au mensuel" : "Passer à l’annuel"}
            >
              {isAnnual ? "Passer au mensuel" : "Passer à l’annuel"}
            </button>
            <button
              className="pill pill-muted"
              onClick={() =>
                alert("Mettre à jour le moyen de paiement (à implémenter)")
              }
            >
              Paiement
            </button>
            {/* Outil de démo pour franchir le palier des 6 mois */}
            <button
              className="pill pill-ghost"
              onClick={onIncrementMonth}
              title="Simuler +1 mois de cotisation"
            >
              Simuler +1 mois
            </button>
          </div>
        </div>

        <div className="soft-card p-4">
          <h3 className="font-semibold">Avantages compris</h3>
          <ul className="text-sm text-muted mt-2 list-disc pl-5">
            <li>1 ressource premium débloquée chaque mois (podcast, livret, vidéo)</li>
            <li>Réductions chez praticiens, commerçants, artisans & centres partenaires</li>
            <li>
              Carnet de vie (annuel : immédiat, mensuel : après 6 mois de cotisation)
            </li>
            <li>Accès prioritaire à certains ateliers</li>
          </ul>
        </div>
      </div>

      <div className="soft-card p-4">
        <h3 className="font-semibold">Dernières réductions</h3>
        {!snapshot.discounts.length ? (
          <p className="text-sm text-muted mt-1">Aucune réduction pour l’instant.</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-3 mt-2">
            {snapshot.discounts.slice(0, 4).map((d) => (
              <li
                key={d.id}
                className="soft-card p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong>{d.name}</strong>
                    <span className="affinity">{d.kind}</span>
                  </div>
                  <div className="text-sm text-muted">
                    {d.city ? `${d.city} • ` : ""}
                    {d.rate}% de remise
                  </div>
                </div>
                <Link href={d.href} className="pill pill-ghost">
                  Voir
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <Link href="/recherche" className="btn btn-outline">
            Explorer les partenaires
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ————— Utils ————— */

function labelResType(t?: "PODCAST" | "BOOKLET" | "VIDEO") {
  switch (t) {
    case "PODCAST":
      return "Podcast";
    case "BOOKLET":
      return "Livret";
    case "VIDEO":
      return "Vidéo";
    default:
      return "Ressource";
  }
}
function labelMonth(ym: string) {
  // "2025-09" -> "sept. 2025"
  try {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(Date.UTC(y, (m || 1) - 1, 1));
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short" });
  } catch {
    return ym;
  }
}
function labelCarnet(s?: CarnetShipmentStatus) {
  if (!s) return "—";
  switch (s) {
    case "NOT_ELIGIBLE":
      return "Non éligible";
    case "PENDING":
      return "En préparation";
    case "PROCESSING":
      return "En cours d’envoi";
    case "SHIPPED":
      return "Expédié";
    case "DELIVERED":
      return "Livré";
  }
}
function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}
