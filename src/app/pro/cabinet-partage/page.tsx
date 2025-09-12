export const metadata = {
  title: "Cabinet partagé — SPYMEO",
};

type Ad = {
  id: number;
  title: string;
  description: string;
  location: string;
  price: string;
  author: string;
};

const ads: Ad[] = [
  { id: 1, title: "Cabinet à partager à Dijon", description: "Espace lumineux disponible 2j/semaine", location: "Dijon", price: "250€/mois", author: "Alice" },
  { id: 2, title: "Salle de consultation à Lyon", description: "Parfait pour sophrologue ou kiné", location: "Lyon", price: "400€/mois", author: "Marc" },
  { id: 3, title: "Location partagée à Paris 11e", description: "Cabinet équipé proche métro", location: "Paris", price: "600€/mois", author: "Sarah" },
];

export default function CabinetPartagePage() {
  return (
    <main className="section">
      <div className="container-spy">
        <h1 className="text-2xl font-semibold mb-6">Cabinet partagé</h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher une annonce..."
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ads.map(ad => (
            <div key={ad.id} className="soft-card p-4 flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{ad.title}</h2>
              <p className="text-sm text-muted">{ad.description}</p>
              <div className="text-sm"><strong>Ville :</strong> {ad.location}</div>
              <div className="text-sm"><strong>Prix :</strong> {ad.price}</div>
              <div className="text-sm"><strong>Auteur :</strong> {ad.author}</div>
              <a
                href={`/pro/messages?to=${ad.author}`}
                className="btn btn-primary mt-2 self-start"
              >
                Contacter
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
