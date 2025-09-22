
// src/app/pro/cabinet-partage/page.tsx
import CabinetPartageClient from "./page.client";
import { MOCK_ANNONCES } from "@/components/cabinet/mock";

export const metadata = {
  title: "Cabinet partagé — SPYMEO",
};

export default function CabinetPartagePage() {
  return <CabinetPartageClient initial={MOCK_ANNONCES} />;
}
