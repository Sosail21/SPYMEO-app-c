'use client';
export default function FiltersCabinet() {
  return (
    <form className="soft-card mb-4 grid gap-3 md:grid-cols-4">
      <input placeholder="Localisation" className="input-pill" />
      <select className="pill pill-muted">
        <option>Offre</option>
        <option>Demande</option>
      </select>
      <select className="pill pill-muted">
        <option>Toutes surfaces</option>
        <option>&lt; 20m²</option>
        <option>20–40m²</option>
        <option>&gt; 40m²</option>
      </select>
      <select className="pill pill-muted">
        <option>Équipé ou non</option>
        <option>Équipé</option>
        <option>Non équipé</option>
      </select>
    </form>
  );
}
