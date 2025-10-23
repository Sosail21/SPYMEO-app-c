// Cdw-Spm
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "@/components/pro/Sidebar";
import Topbar from "@/components/pro/Topbar";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const raw = cookies().get(COOKIE_NAME)?.value;
  let userId: string | undefined;
  let role: string | undefined = "PRACTITIONER";
  let name: string | undefined = "Utilisateur";

  try {
    if (raw) {
      const s = JSON.parse(raw);
      userId = s?.id;
      role = s?.role ?? role;
      name = s?.name ?? name;
    }
  } catch {}

  // Check user status in database
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { status: true },
      });

      if (user) {
        if (user.status === 'PENDING_VALIDATION') {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold mb-4">Candidature en cours d'étude</h1>
                <p className="text-gray-600 mb-6">
                  Votre candidature est actuellement en cours d'examen par notre équipe.
                </p>
                <p className="text-gray-600 mb-6">
                  Vous recevrez une réponse par email sous <strong>72 heures</strong>.
                </p>
                <p className="text-sm text-gray-500">
                  En cas d'approbation, vous pourrez accéder à votre espace praticien.
                </p>
                <a href="/" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Retour à l'accueil
                </a>
              </div>
            </div>
          );
        }

        if (user.status === 'REJECTED') {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold mb-4">Candidature non approuvée</h1>
                <p className="text-gray-600 mb-6">
                  Malheureusement, votre candidature n'a pas été approuvée.
                </p>
                <p className="text-gray-600 mb-6">
                  Pour plus d'informations, contactez-nous à <a href="mailto:contact@spymeo.fr" className="text-blue-600 underline">contact@spymeo.fr</a>
                </p>
                <a href="/" className="mt-6 inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Retour à l'accueil
                </a>
              </div>
            </div>
          );
        }

        if (user.status === 'SUSPENDED') {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold mb-4">Compte suspendu</h1>
                <p className="text-gray-600 mb-6">
                  Votre compte a été temporairement suspendu.
                </p>
                <p className="text-gray-600 mb-6">
                  Pour plus d'informations, contactez-nous à <a href="mailto:contact@spymeo.fr" className="text-blue-600 underline">contact@spymeo.fr</a>
                </p>
                <a href="/" className="mt-6 inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Retour à l'accueil
                </a>
              </div>
            </div>
          );
        }

        if (user.status === 'PENDING_PAYMENT') {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">💳</div>
                <h1 className="text-2xl font-bold mb-4">Paiement en attente</h1>
                <p className="text-gray-600 mb-6">
                  Votre candidature a été approuvée ! Pour accéder à vos services, veuillez effectuer le paiement de votre cotisation.
                </p>
                <a href="/payment/pro" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Procéder au paiement
                </a>
                <p className="mt-4 text-sm text-gray-500">
                  Une fois le paiement effectué, vous aurez accès à tous vos services.
                </p>
              </div>
            </div>
          );
        }
      }
    } catch (error) {
      console.error('[PRO_LAYOUT] Error checking user status:', error);
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar role={role} name={name} />
      {/* Right side */}
      <main className="flex-1 min-w-0 flex flex-col">
        <Topbar name={name} />
        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}