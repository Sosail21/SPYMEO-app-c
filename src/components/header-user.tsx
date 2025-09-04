import Link from "next/link";
import { cookies } from "next/headers";
import { COOKIE_NAME, type Session } from "@/lib/auth/session";
import { UserAvatarMenu } from "@/components/header/UserAvatarMenu"; // ⟵ nouveau composant client

async function getSession(): Promise<Session | null> {
  try {
    const raw = cookies().get(COOKIE_NAME)?.value;
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export default async function HeaderUser() {
  const session = await getSession();
  const isPass = session?.role === "PASS_USER";
  const baseDash = isPass ? "/pass/tableau-de-bord" : "/user/tableau-de-bord";

  const userMenu: { label: string; href: string }[] = [
    { label: "Tableau de bord", href: baseDash },
    { label: "Mes rendez-vous", href: "/user/mes-rendez-vous" },
    { label: "Mes activités", href: "/user/mes-activites" },
    { label: "Mon compte", href: "/user/compte" },
    { label: "Mon forfait", href: "/pass" },
    { label: "Nouveautés SPYM'Blog", href: "/blog" },
    ...(isPass ? [
      { label: "Mes ressources", href: "/pass/ressources" },
      { label: "Mes réductions", href: "/pass/reductions" },
    ] : []),
  ];

  return (
    <>
      {/* Rangée 1 : marque seule (plus de “Bonjour …” ici) */}
      <div className="container-spy flex items-center gap-4 py-3">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          <span className="brand-word">SPYMEO</span>
        </Link>
      </div>

      {/* Rangée 2 : menu utilisateur à gauche + avatar menu à droite */}
      <div className="border-t bg-white">
        <div className="container-spy py-2 flex items-center gap-3">
          {/* Pills du menu (scroll horizontal si trop long) */}
          <nav aria-label="Navigation utilisateur" className="min-w-0 flex-1">
            <ul
              className="
                flex gap-2 m-0 p-0 list-none
                overflow-x-auto whitespace-nowrap
                [-ms-overflow-style:none] [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {userMenu.map((item) => (
                <li key={item.href} className="shrink-0">
                  <Link className="pill pill-ghost hover:shadow-elev" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="ml-auto shrink-0">
                <Link className="pill pill-muted" href="/recherche">Explorer</Link>
              </li>
            </ul>
          </nav>

          {/* Avatar + dropdown (client) */}
          <UserAvatarMenu name={session?.name ?? "Utilisateur"} />
        </div>
      </div>
    </>
  );
}