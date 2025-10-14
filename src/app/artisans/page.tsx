// Cdw-Spm
import UniverseSearch, { UniverseItem } from "@/components/universe/UniverseSearch";

const MOCK: UniverseItem[] = [
  {
    id: "atelier-savon",
    name: "Atelier Savon",
    title: "Savonnier",
    city: "Beaune",
    distanceKm: 12,
    tags: ["Saponification à froid", "Bio"],
    affinity: 88,
    passPartner: { enabled: true, rate: 5 }, // Badge PASS 5%
  },
  {
    id: "cuir-co",
    name: "Cuir & Co",
    title: "Maroquinier",
    city: "Dijon",
    distanceKm: 4,
    tags: ["Fait main", "Réparation"],
    affinity: 84,
  },
  {
    id: "menuiserie-nord",
    name: "Menuiserie Nord",
    title: "Menuisier",
    city: "Quetigny",
    distanceKm: 6,
    tags: ["Bois local", "Sur-mesure"],
    affinity: 86,
  },
];

export default function Artisans() {
  return (
    <UniverseSearch
      title="Artisans"
      subtitle="Fabrication locale, matières nobles, circuits courts."
      basePath="/artisan"
      items={MOCK}
      tariffLabel="Prix max"
      specialties={["Savonnerie", "Maroquinerie", "Menuiserie", "Textile", "Céramique"]}
      formats={["Atelier", "Boutique", "En ligne"]}
      availabilities={["Cette semaine", "Week-end", "Sur commande"]}
    />
  );
}
