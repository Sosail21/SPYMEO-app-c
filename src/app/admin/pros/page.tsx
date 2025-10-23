// Cdw-Spm: Admin Pro Validation Page - Phase 2
"use client";

import { useEffect, useState } from 'react';

interface Documents {
  diploma?: string;
  insurance?: string;
  kbis?: string;
  criminalRecord?: string;
}

interface PendingUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  siret?: string;
  role: string;
  status: string;
  profileData?: any;
  businessData?: any;
  applicationDocuments?: Documents;
  createdAt: string;
}

export default function AdminProPage() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pending-pros');
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();
      setPending(data.users || []);
    } catch (err) {
      setError('Erreur lors du chargement des candidatures');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (userId: string, approved: boolean) => {
    const notes = prompt(
      approved
        ? 'Notes pour le candidat (optionnel):'
        : 'Raison du refus (optionnel):'
    );

    try {
      const res = await fetch('/api/admin/validate-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved, adminNotes: notes || '' }),
      });

      const result = await res.json();

      if (result.success) {
        alert(result.message);
        fetchPending(); // Refresh list
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'PRACTITIONER': return 'Praticien';
      case 'ARTISAN': return 'Artisan';
      case 'COMMERCANT': return 'Commerçant';
      case 'CENTER': return 'Centre';
      default: return role;
    }
  };

  const getDisplayName = (user: PendingUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email;
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container-spy">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Candidatures en attente</h1>
          <div className="mt-4">
            <div className="soft-card p-8 text-center">
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container-spy">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Candidatures en attente</h1>
          <div className="mt-4">
            <div className="soft-card p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button className="btn mt-4" onClick={fetchPending}>Réessayer</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-spy">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">
              Candidatures en attente
            </h1>
            <p className="text-slate-600">
              Validation des candidatures professionnelles ({pending.length} en attente)
            </p>
          </div>
          <button className="btn btn-outline" onClick={fetchPending}>
            🔄 Actualiser
          </button>
        </div>

        <div className="mt-6">
          {pending.length === 0 ? (
            <div className="soft-card p-8 text-center">
              <h3 className="text-lg font-semibold">Aucune candidature en attente</h3>
              <p className="text-slate-600 mt-1">Toutes les candidatures ont été traitées.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pending.map((user) => (
                <div key={user.id} className="soft-card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{getDisplayName(user)}</h3>
                      <p className="text-slate-600">
                        {getRoleName(user.role)} · {user.email}
                      </p>
                    </div>
                    <span className="pill bg-amber-100 text-amber-700">
                      En attente de validation
                    </span>
                  </div>

                  {/* Contact et infos générales */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-3 text-blue-900">📞 Contact</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <a href={`mailto:${user.email}`} className="font-medium text-blue-600 hover:underline">
                          {user.email}
                        </a>
                      </div>
                      {user.phone && (
                        <div>
                          <p className="text-sm text-slate-500">Téléphone</p>
                          <a href={`tel:${user.phone}`} className="font-medium text-blue-600 hover:underline">
                            {user.phone}
                          </a>
                        </div>
                      )}
                      {user.siret && (
                        <div>
                          <p className="text-sm text-slate-500">SIRET</p>
                          <p className="font-medium font-mono">{user.siret}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-slate-500">Date de candidature</p>
                      <p className="text-slate-700">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Informations professionnelles */}
                  {user.profileData && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-3">💼 Informations professionnelles</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {user.profileData.discipline && (
                          <div>
                            <p className="text-sm text-slate-500">Discipline</p>
                            <p className="font-medium">{user.profileData.discipline}</p>
                          </div>
                        )}
                        {user.profileData.city && (
                          <div>
                            <p className="text-sm text-slate-500">Ville</p>
                            <p className="font-medium">{user.profileData.city}</p>
                          </div>
                        )}
                        {user.profileData.experience !== undefined && (
                          <div>
                            <p className="text-sm text-slate-500">Expérience</p>
                            <p className="font-medium">{user.profileData.experience} ans</p>
                          </div>
                        )}
                        {user.profileData.presentation && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-slate-500 mb-1">Présentation</p>
                            <p className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">
                              {user.profileData.presentation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents justificatifs */}
                  {user.applicationDocuments && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-3 text-yellow-900">📎 Documents justificatifs</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-semibold">Diplôme / Certificat</p>
                            <p className="text-xs text-slate-500">Formation et qualification</p>
                          </div>
                          {user.applicationDocuments.diploma ? (
                            <a
                              href={user.applicationDocuments.diploma}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                            >
                              📄 Voir
                            </a>
                          ) : (
                            <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-sm">Non fourni</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-semibold">Assurance RC Pro</p>
                            <p className="text-xs text-slate-500">Responsabilité civile</p>
                          </div>
                          {user.applicationDocuments.insurance ? (
                            <a
                              href={user.applicationDocuments.insurance}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                            >
                              📄 Voir
                            </a>
                          ) : (
                            <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-sm">Non fourni</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-semibold">Kbis</p>
                            <p className="text-xs text-slate-500">Extrait d'immatriculation</p>
                          </div>
                          {user.applicationDocuments.kbis ? (
                            <a
                              href={user.applicationDocuments.kbis}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                            >
                              📄 Voir
                            </a>
                          ) : (
                            <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-sm">Non fourni</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-semibold">Casier judiciaire</p>
                            <p className="text-xs text-slate-500">Volet 3 vierge</p>
                          </div>
                          {user.applicationDocuments.criminalRecord ? (
                            <a
                              href={user.applicationDocuments.criminalRecord}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                            >
                              📄 Voir
                            </a>
                          ) : (
                            <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-sm">Non fourni</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Business data pour artisans/commerçants */}
                  {user.businessData && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">Informations de l'entreprise</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {user.businessData.businessName && (
                          <div>
                            <p className="text-sm text-slate-500">Raison sociale</p>
                            <p className="font-medium">{user.businessData.businessName}</p>
                          </div>
                        )}
                        {user.businessData.city && (
                          <div>
                            <p className="text-sm text-slate-500">Ville</p>
                            <p className="font-medium">{user.businessData.city}</p>
                          </div>
                        )}
                        {user.businessData.categories && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-slate-500">Catégories</p>
                            <p className="text-sm mt-1">{user.businessData.categories}</p>
                          </div>
                        )}
                        {user.businessData.description && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-slate-500">Description</p>
                            <p className="text-sm mt-1">{user.businessData.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      className="btn"
                      onClick={() => handleValidate(user.id, true)}
                    >
                      ✅ Approuver
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleValidate(user.id, false)}
                    >
                      ❌ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
