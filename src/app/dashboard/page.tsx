// Cdw-Spm: User Dashboard (FREE & PASS)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  if (loading || status === "loading") {
    return (
      <main className="section">
        <div className="container-spy text-center">
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  const user = session?.user as any;
  const isFreeUser = user?.role === 'FREE_USER';
  const isPassUser = user?.role === 'PASS_USER';

  return (
    <main className="section">
      <div className="container-spy">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.name || user?.email} !
          </h1>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isPassUser ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {isPassUser ? '( PASS' : 'Gratuit'}
            </span>
          </div>
        </header>

        {isFreeUser && (
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-lg border border-accent/20 mb-8">
            <h2 className="text-xl font-semibold mb-2">< Passez au PASS Premium</h2>
            <p className="text-gray-700 mb-4">
              D�bloquez toutes les fonctionnalit�s : carnet de vie, ressources premium, r�ductions exclusives et bien plus !
            </p>
            <div className="flex gap-4 items-center">
              <a href={`/payment/pass?userId=${user?.id}`} className="btn">
                D�couvrir le PASS
              </a>
              <span className="text-sm text-gray-600">� partir de 6,90 �/mois</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profil */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              =d Mon profil
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              G�rez vos informations personnelles
            </p>
            <button className="text-accent hover:underline text-sm font-semibold">
              Modifier mon profil �
            </button>
          </div>

          {/* Favoris */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              P Mes favoris
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Retrouvez vos praticiens pr�f�r�s
            </p>
            <button className="text-accent hover:underline text-sm font-semibold">
              Voir mes favoris �
            </button>
          </div>

          {/* Recherche */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              = Rechercher
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Trouvez le praticien id�al
            </p>
            <button className="text-accent hover:underline text-sm font-semibold">
              Lancer une recherche �
            </button>
          </div>
        </div>

        {/* Fonctionnalit�s PASS */}
        {isPassUser ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">( Vos fonctionnalit�s PASS</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Carnet de vie */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  =� Carnet de vie
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Suivez votre �volution personnelle et vos objectifs bien-�tre
                </p>
                <button className="bg-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                  Acc�der au carnet �
                </button>
              </div>

              {/* Ressources premium */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  =� Ressources premium
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Acc�dez � du contenu exclusif de qualit�
                </p>
                <button className="bg-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                  Voir les ressources �
                </button>
              </div>

              {/* R�ductions */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <� R�ductions exclusives
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Profitez d'offres sp�ciales chez nos partenaires
                </p>
                <button className="bg-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                  Voir les offres �
                </button>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  =� Support prioritaire
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Une �quipe d�di�e pour vous accompagner
                </p>
                <button className="bg-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                  Contacter le support �
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <div className="text-6xl mb-4">=</div>
            <h3 className="text-xl font-semibold mb-2">Contenu premium</h3>
            <p className="text-gray-600 mb-4">
              Passez au PASS pour d�bloquer toutes ces fonctionnalit�s
            </p>
            <a href={`/payment/pass?userId=${user?.id}`} className="btn inline-block">
              D�couvrir le PASS
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
