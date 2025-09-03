import UniverseSearch, { UniverseItem } from "@/components/universe/UniverseSearch";

const MOCK: UniverseItem[] = [
  { id: "epicerie-locale", name: "Épicerie Locale", title: "Épicerie vrac", city: "Dijon", distanceKm: 2, tags: ["Bio", "Zéro déchet"], affinity: 87 },
  { id: "maison-vrac", name: "Maison Vrac", title: "Vrac & réemploi", city: "Chenôve", distanceKm: 7, tags: ["Réductions PASS", "Local"], affinity: 83 },
  { id: "cosmetiques-bio", name: "Cosmétiques Bio", title: "Boutique beauté", city: "Talant", distanceKm: 5, tags: ["Naturel", "Sans plastique"], affinity: 85 },
];

export default function Commercants() {
  return (
    <UniverseSearch
      title="Commerçants"
      subtitle="Épiceries vrac, bio, zéro plastique, cosmétiques naturels…"
      basePath="/commercant"
      items={MOCK}
      tariffLabel="Prix max"
      specialties={["Épicerie", "Beauté", "Maison", "Bébé", "Hygiène"]}
      formats={["Boutique", "Drive", "Livraison"]}
      availabilities={["Ouvert aujourd’hui", "Ouvert week-end", "Click & collect"]}
    />
  );
}
