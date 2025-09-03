import UniverseSearch, { UniverseItem } from "@/components/universe/UniverseSearch";

const MOCK: UniverseItem[] = [
  { id: "aline-dupont", name: "Aline Dupont", title: "Naturopathe", city: "Dijon", distanceKm: 3, tags: ["Visio", "Éthique vérifiée", "Dispo cette semaine"], affinity: 92 },
  { id: "nicolas-perrin", name: "Nicolas Perrin", title: "Sophrologue", city: "Chenôve", distanceKm: 6, tags: ["Première consult.", "Soir & week-end"], affinity: 89 },
  { id: "salome-nguyen", name: "Salomé Nguyen", title: "Réflexologue", city: "Quetigny", distanceKm: 5, tags: ["À domicile", "Dispo cette semaine"], affinity: 86 },
];

export default function Praticiens() {
  return (
    <UniverseSearch
      title="Praticiens"
      subtitle="Naturopathes, sophrologues, réflexologues, hypnothérapeutes, nutrition… Filtrez par spécialité, format et disponibilités."
      basePath="/praticien"
      items={MOCK}
      tariffLabel="Tarif max"
      specialties={["Naturopathie", "Sophrologie", "Réflexologie", "Hypnose", "Nutrition", "Massage bien-être"]}
      formats={["Cabinet", "Domicile", "Visio"]}
      availabilities={["Aujourd’hui", "Cette semaine", "Soir & week-end"]}
    />
  );
}
