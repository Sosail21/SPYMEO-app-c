// Cdw-Spm
// src/components/admin/menu.ts
export type AdminItem = { label: string; href: string; icon?: string };

export const ADMIN_MENU: AdminItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: "🏠" },
  { label: "Utilisateurs",    href: "/admin/utilisateurs", icon: "👥" },
  { label: "Centres",         href: "/admin/centres", icon: "🎓" },
  { label: "Pros",            href: "/admin/pros", icon: "🧩" },
  { label: "PASS",            href: "/admin/pass", icon: "🔖" },
  { label: "Blog",            href: "/admin/blog", icon: "✍️" },
];