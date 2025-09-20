// src/lib/mockdb/precompta-artisan.ts
// Écritures simples pour pilotage pré-comptable.

export type ArtisanLedgerItem = {
  id: string;
  date: string;       // ISO
  ref: string;        // réf pièce (facture/dépense)
  label: string;      // libellé
  type: "INVOICE" | "EXPENSE";
  amount: number;     // TTC €
  vatRate: number;    // % TVA
};

export const MOCK_PRECOMPTA_ARTISAN: ArtisanLedgerItem[] = [
  {
    id: "l1",
    date: "2025-09-15",
    ref: "ART-2025-01012",
    label: "Restauration fauteuil — Marc Dupont",
    type: "INVOICE",
    amount: 280,
    vatRate: 20,
  },
  {
    id: "l2",
    date: "2025-09-17",
    ref: "ART-2025-01024",
    label: "Atelier maroquinerie — Alice Martin",
    type: "INVOICE",
    amount: 95,
    vatRate: 20,
  },
  {
    id: "l3",
    date: "2025-09-16",
    ref: "EXP-2025-0916-A",
    label: "Achat cuir végétal & fil de lin (fournisseur)",
    type: "EXPENSE",
    amount: -84,
    vatRate: 20,
  },
  {
    id: "l4",
    date: "2025-09-12",
    ref: "ART-2025-00988",
    label: "Objet déco en fer forgé — Sophie Leroy",
    type: "INVOICE",
    amount: 220,
    vatRate: 20,
  },
  {
    id: "l5",
    date: "2025-09-10",
    ref: "EXP-2025-0910-B",
    label: "Teintures naturelles & huile de lin",
    type: "EXPENSE",
    amount: -56,
    vatRate: 20,
  },
];
