// Cdw-Spm: Client List for Practitioners
"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  totalVisits: number;
  lastVisitAt?: string | null;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ClientList() {
  const { data, error, isLoading, mutate } = useSWR("/api/pro/clients", fetcher);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const confirmDialog = useConfirm();

  // Extract clients from response
  const clients: Client[] = data?.success && Array.isArray(data.clients) ? data.clients : [];

  const needle = (search ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!needle) return clients;
    return clients.filter((c) =>
      `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase().includes(needle)
    );
  }, [clients, needle]);

  async function addClient(formData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }) {
    try {
      const res = await fetch("/api/pro/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!result.success) {
        await confirmDialog.confirm({
          title: "Erreur",
          message: result.error || "Erreur lors de la création du client",
          confirmText: "OK",
          cancelText: "",
          variant: "danger"
        });
        return;
      }

      // Revalider les données
      mutate();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating client:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de la création du client",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
    }
  }

  if (error) return <div className="text-red-600">Erreur de chargement</div>;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client…"
          className="input-pill flex-1"
        />
        <button onClick={() => setShowAddModal(true)} className="btn">
          + Nouveau client
        </button>
      </div>

      {isLoading ? (
        <div className="soft-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Chargement des clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="soft-card p-8 text-center">
          <p className="text-muted">
            {needle ? "Aucun résultat pour cette recherche." : "Aucun client pour le moment."}
          </p>
          {!needle && (
            <button onClick={() => setShowAddModal(true)} className="btn mt-4">
              Créer votre premier client
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="soft-card p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-semibold text-lg">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-sm text-muted grid gap-1 mt-1">
                  {c.email && <div>📧 {c.email}</div>}
                  {c.phone && <div>📞 {c.phone}</div>}
                  <div className="flex gap-3 text-xs">
                    <span>{c.totalVisits} consultation{c.totalVisits > 1 ? "s" : ""}</span>
                    {c.lastVisitAt && (
                      <span>
                        Dernière visite : {new Date(c.lastVisitAt).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link className="pill pill-solid" href={`/pro/praticien/fiches-clients/${c.id}`}>
                Voir la fiche
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout de client */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSubmit={addClient}
        />
      )}

      <ConfirmModal
        open={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </div>
  );
}

// Modal pour ajouter un client
function AddClientModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { firstName: string; lastName: string; email?: string; phone?: string }) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const confirmDialog = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      await confirmDialog.confirm({
        title: "Attention",
        message: "Prénom et nom sont requis",
        confirmText: "OK",
        cancelText: "",
        variant: "warning"
      });
      return;
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold">Nouveau client</h3>
          <button className="btn btn-ghost px-2 py-1" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg"
              placeholder="Jean"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg"
              placeholder="Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg"
              placeholder="jean.dupont@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Annuler
            </button>
            <button type="submit" className="btn">
              Créer le client
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </div>
  );
}
