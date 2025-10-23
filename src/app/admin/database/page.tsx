"use client";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  role: string;
  status: string;
  plan: string | null;
  city: string | null;
  createdAt: string;
  updatedAt: string;
  profileData?: any;
  businessData?: any;
}

interface DbStats {
  overview: {
    totalUsers: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  };
  recentUsers: User[];
  allUsers: User[];
}

export default function DatabasePage() {
  const [stats, setStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "recent" | "all">("overview");

  useEffect(() => {
    fetch("/api/admin/db-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Base de données</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Base de données</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700">Erreur: {error || "Données non disponibles"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📊 Base de données</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "overview"
              ? "border-b-2 border-accent text-accent"
              : "text-gray-500"
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "recent"
              ? "border-b-2 border-accent text-accent"
              : "text-gray-500"
          }`}
        >
          Récents ({stats.recentUsers.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "all"
              ? "border-b-2 border-accent text-accent"
              : "text-gray-500"
          }`}
        >
          Tous les utilisateurs ({stats.allUsers.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-semibold mb-2">TOTAL UTILISATEURS</h3>
              <p className="text-4xl font-bold text-accent">{stats.overview.totalUsers}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-semibold mb-2">PAR RÔLE</h3>
              <div className="space-y-1">
                {Object.entries(stats.overview.byRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between">
                    <span className="text-sm">{role}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-semibold mb-2">PAR STATUT</h3>
              <div className="space-y-1">
                {Object.entries(stats.overview.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="text-sm">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Users Tab */}
      {activeTab === "recent" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rôle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : user.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : user.status === "PENDING_VALIDATION"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.plan || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === "all" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Rôle</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ville</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Créé le</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Mis à jour</th>
                </tr>
              </thead>
              <tbody>
                {stats.allUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : user.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : user.status === "PENDING_VALIDATION"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.plan || "-"}</td>
                    <td className="px-4 py-3 text-sm">{user.city || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.updatedAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
