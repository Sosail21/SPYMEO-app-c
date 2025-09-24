// src/lib/rbac.ts
// Cdw-Spm — RBAC robuste (segments dynamiques + container /admin)

import { ROUTES, type Role, type RouteEntry } from "./routes";

/** Normalise le pathname : retire la query, le hash et la slash finale (sauf racine). */
function normalizePathname(pathname: string): string {
  try {
    // Si on reçoit déjà un pathname (sans origin), new URL() va râler.
    // On coupe à ? ou # manuellement.
    const cut = pathname.split("?")[0].split("#")[0] || "/";
    if (cut !== "/" && cut.endsWith("/")) return cut.slice(0, -1);
    return cut;
  } catch {
    return "/";
  }
}

/** Échappe une chaîne pour l’insérer dans une RegExp. */
function esc(segment: string): string {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Compile un path type "/praticien/:slug" en RegExp.
 * - Segments dynamiques ":param" -> [^/]+
 * - Trailing slash optionnelle
 * - Container spécial pour "/admin" -> couvre "/admin" ET "/admin/*"
 */
function pathToRegex(path: string): RegExp {
  if (path === "/") return /^\/$/;

  // Container admin : couvre tout le sous-espace.
  if (path === "/admin") {
    return /^\/admin(?:\/.*)?$/;
  }

  const parts = path.split("/").filter(Boolean);
  const compiled = parts
    .map((p) => (p.startsWith(":") ? "[^/]+" : esc(p)))
    .join("/");
  return new RegExp(`^/${compiled}(?:/)?$`);
}

/** Précompile les routes une fois pour toutes. */
type CompiledRoute = RouteEntry & { regex: RegExp; specificity: number };
const COMPILED: CompiledRoute[] = ROUTES.map((r) => {
  const regex = pathToRegex(r.path);
  // Specificité simple : longueur du path + nb de segments (favorise les détails)
  const segments = r.path.split("/").filter(Boolean).length;
  const specificity = r.path.length * 10 + segments;
  return { ...r, regex, specificity };
});

/** Résout la meilleure route correspondant au pathname. */
function resolveRoute(pathname: string): CompiledRoute | undefined {
  const p = normalizePathname(pathname);
  // Filtre par regex, garde la plus spécifique
  const matches = COMPILED.filter((r) => r.regex.test(p));
  if (matches.length === 0) return undefined;
  matches.sort((a, b) => b.specificity - a.specificity);
  return matches[0];
}

/**
 * Vérifie l’accès : public => true, sinon rôle requis.
 * Si aucune route ne correspond : on autorise (même logique qu’avant).
 */
export function canAccess(pathname: string, userRole?: Role): boolean {
  const route = resolveRoute(pathname);

  // Aucune règle déclarée => on laisse passer
  if (!route) return true;

  // Route publique
  if (route.public) return true;

  // Route protégée, pas de rôle
  if (!userRole) return false;

  // RBAC : rôle inclus ?
  return route.roles.includes(userRole);
}

// (Optionnel) utilitaires exportables
export function getRouteMeta(pathname: string): RouteEntry | undefined {
  const r = resolveRoute(pathname);
  return r ? { path: r.path, roles: r.roles, titleKey: r.titleKey, breadcrumb: r.breadcrumb, feature: r.feature, public: r.public } : undefined;
}
