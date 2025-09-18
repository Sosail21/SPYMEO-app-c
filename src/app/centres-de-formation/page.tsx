import UniverseSearch, { UniverseItem } from "@/components/universe/UniverseSearch";

const MOCK: UniverseItem[] = [
  {
    id: "centre-horizon",
    name: "Centre Horizon",
    title: "Naturopathie — certifiant",
    city: "Dijon",
    distanceKm: 0,
    tags: ["Prochaine session : Oct"],
    affinity: 90,
    passPartner: { enabled: true, rate: 10 }, // Badge PASS affiché
  },
  {
    id: "academie-bien-etre",
    name: "Académie Bien-Être",
    title: "Sophrologie — intensif",
    city: "Beaune",
    distanceKm: 15,
    tags: ["Week-end"],
    affinity: 86,
  },
  {
    id: "institut-soma",
    name: "Institut Soma",
    title: "Réflexologie — pro",
    city: "Quetigny",
    distanceKm: 6,
    tags: ["Éligible CPF (exemple)"],
    affinity: 85,
  },
];

export default function CentresDeFormation() {
  return (
    <UniverseSearch
      title="Centres de formation"
      subtitle="Programmes certifiants, petits groupes, intervenants pros."
      basePath="/centre-de-formation"
      items={MOCK}
      tariffLabel="Tarif jour max"
      specialties={["Naturopathie", "Sophrologie", "Réflexologie", "Hypnose"]}
      formats={["Présentiel", "Hybride", "Distanciel"]}
      availabilities={["Sessions proches", "Week-end", "Soir"]}
    />
  );
}
