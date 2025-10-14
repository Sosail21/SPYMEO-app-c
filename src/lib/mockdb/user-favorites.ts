// Cdw-Spm
// src/lib/mockdb/user-favorites.ts
export type FavoriteKind = "Article" | "Praticien" | "Artisan" | "Commerçant" | "Produit";
export type UserFavorite = {
  id: string;
  kind: FavoriteKind;
  title: string;
  href: string;
  meta?: string;      // ex: "Dijon • Naturopathe"
  updatedAt?: string; // ISO
};

export const MOCK_USER_FAVORITES: UserFavorite[] = [
  {
    id: "fav-art-1",
    kind: "Article",
    title: "Comprendre l’errance médicale",
    href: "/blog/comprendre-errance-medicale",
    updatedAt: "2025-09-10",
  },
  {
    id: "fav-pro-1",
    kind: "Praticien",
    title: "Aline Dupont — Naturopathe",
    href: "/praticien/aline-dupont",
    meta: "Dijon • Naturopathie",
    updatedAt: "2025-09-15",
  },
  {
    id: "fav-artisan-1",
    kind: "Artisan",
    title: "Atelier Savon (beauté naturelle)",
    href: "/artisan/atelier-savon",
    meta: "Beaune • Savonnier",
  },
  {
    id: "fav-shop-1",
    kind: "Commerçant",
    title: "Épicerie Locale",
    href: "/commercant/epicerie-locale",
    meta: "Quetigny • Vrac & bio",
  },
];
