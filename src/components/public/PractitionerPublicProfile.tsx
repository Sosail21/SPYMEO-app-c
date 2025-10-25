// Cdw-Spm: Composant profil public d'un praticien
"use client";

import Link from "next/link";
import AvailabilityPicker from "./AvailabilityPicker";
import { useState } from "react";

type Props = {
  practitioner: {
    id: string;
    slug: string;
    publicName: string;
    specialties: string[];
    description: string | null;
    city: string | null;
    postalCode: string | null;
    address: string | null;
    user: {
      id: string;
      phone: string | null;
      email: string | null;
      agendaSettings: any;
    };
  };
};

export default function PractitionerPublicProfile({ practitioner }: Props) {
  const [showAvailabilities, setShowAvailabilities] = useState(false);

  const agendaSettings = practitioner.user.agendaSettings;
  const appointmentTypes = (agendaSettings?.appointmentTypes || []) as any[];

  return (
    <main>
      {/* HERO */}
      <section className="fiche-hero">
        <div className="container-spy fiche-hero-inner">
          <div className="fiche-avatar" aria-hidden />
          <div>
            <h1 className="fiche-name flex items-center gap-3">
              <span>{practitioner.publicName}</span>
            </h1>
            <p className="fiche-sub">
              {practitioner.specialties.join(", ")} — {practitioner.city || "France"}
            </p>
            <div className="fiche-ctas">
              <button
                onClick={() => setShowAvailabilities(!showAvailabilities)}
                className="btn"
              >
                {showAvailabilities ? "Masquer" : "Prendre RDV"}
              </button>
              <Link
                href={`/auth/login?next=/praticien/${practitioner.slug}#message`}
                className="btn btn-outline"
              >
                Envoyer un message
              </Link>
              <button className="btn btn-ghost" type="button" title="Ajouter aux favoris (connexion requise)">
                ☆ Favori
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LAYOUT */}
      <section className="section">
        <div className="fiche-layout">
          {/* MAIN */}
          <div className="fiche-main space-y-3 sm:space-y-4">
            {/* Présentation */}
            <article className="card">
              <h2 className="section-title m-0 mb-2">Présentation</h2>
              <p className="lead">{practitioner.description || "Praticien vérifié sur SPYMEO"}</p>
              <div className="badges mt-2">
                <span className="badge">Éthique vérifiée</span>
                {appointmentTypes.some((t: any) => t.location === "visio") && (
                  <span className="badge">Visio</span>
                )}
                {appointmentTypes.some((t: any) => t.location === "domicile") && (
                  <span className="badge">À domicile</span>
                )}
              </div>
            </article>

            {/* Spécialités */}
            {practitioner.specialties.length > 0 && (
              <article className="card">
                <h2 className="section-title m-0 mb-2">Spécialités</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {practitioner.specialties.map((s) => (
                    <li key={s} className="pill pill-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* Types de consultations / Tarifs */}
            {appointmentTypes.length > 0 && (
              <article className="card">
                <h2 className="section-title m-0 mb-2">Consultations & Tarifs</h2>
                <ul className="grid gap-2">
                  {appointmentTypes.map((t: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-baseline justify-between gap-3 border-b border-[rgba(11,18,57,.08)] pb-2 last:border-0"
                    >
                      <span>
                        {t.label} — {t.durationMin} min {t.location && `• ${t.location}`}
                      </span>
                      <strong>{t.price ? `${t.price}€` : "—"}</strong>
                    </li>
                  ))}
                </ul>
                <p className="text-muted text-sm mt-2">
                  Règlements acceptés : CB, espèces. Remboursement mutuelle possible selon contrat.
                </p>
              </article>
            )}

            {/* Disponibilités / RDV */}
            {showAvailabilities && (
              <AvailabilityPicker
                practitionerSlug={practitioner.slug}
                practitionerName={practitioner.publicName}
                onBookingComplete={() => {
                  // Optionnel: rafraîchir ou afficher un message
                  setShowAvailabilities(false);
                }}
              />
            )}
          </div>

          {/* SIDE */}
          <aside className="fiche-side space-y-3 sm:space-y-4">
            {/* Contact */}
            <div className="card">
              <h3 className="m-0 mb-2">Contact</h3>
              <ul className="fiche-contact">
                {practitioner.user.phone && (
                  <li>
                    <span className="text-muted">Téléphone :</span> {practitioner.user.phone}
                  </li>
                )}
                {practitioner.user.email && (
                  <li>
                    <span className="text-muted">Email :</span> {practitioner.user.email}
                  </li>
                )}
                {practitioner.address && (
                  <li>
                    <span className="text-muted">Adresse :</span> {practitioner.address},{" "}
                    {practitioner.postalCode} {practitioner.city}
                  </li>
                )}
              </ul>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/auth/login?next=/praticien/${practitioner.slug}#message`}
                  className="btn btn-outline"
                >
                  Écrire
                </Link>
                {practitioner.user.phone && (
                  <a href={`tel:${practitioner.user.phone}`} className="btn">
                    Appeler
                  </a>
                )}
              </div>
            </div>

            {/* Infos pratiques */}
            <div className="card">
              <h3 className="m-0 mb-2">Infos pratiques</h3>
              <ul className="fiche-infos">
                <li>
                  <span className="text-muted">Formats :</span>
                  {appointmentTypes
                    .map((t: any) => t.location)
                    .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
                    .join(", ") || "Cabinet"}
                </li>
                {practitioner.city && (
                  <li>
                    <span className="text-muted">Ville :</span> {practitioner.city}
                  </li>
                )}
              </ul>
            </div>

            {/* CTA PASS */}
            <div className="card">
              <h3 className="m-0 mb-2">PASS SPYMEO</h3>
              <p className="m-0 text-sm">
                Tarifs préférentiels, ressources premium et carnet de vie.
              </p>
              <Link href="/pass" className="btn mt-3 w-full">
                Découvrir le PASS
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
