
// src/components/cabinet/types.ts
export type Annonce = {
  id: string;
  kind: "offer" | "demand";
  title: string;
  description: string;
  images: string[];
  city: string;
  surface: number;
  equiped: boolean;
  author: { id: string; name: string; avatar?: string };
};
