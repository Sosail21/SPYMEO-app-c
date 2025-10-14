// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "r1",
      title: "Respiration carrée (fiche pratique)",
      category: "Respiration",
      format: "pdf",
      level: "débutant",
      tags: ["respiration", "stress"],
      sizeKb: 240,
      updatedAt: new Date().toISOString(),
      shareable: true,
      coverUrl: "",
      downloadUrl: "/files/respiration-carree.pdf"
    },
    {
      id: "r2",
      title: "Fiche suivi des mensurations",
      category: "Suivi",
      format: "sheet",
      tags: ["mensurations", "suivi"],
      shareable: true,
      coverUrl: "",
      downloadUrl: "/files/suivi-mensurations.xlsx"
    },
    {
      id: "r3",
      title: "Conseils de base en aromathérapie",
      category: "Aromathérapie",
      format: "doc",
      level: "intermédiaire",
      tags: ["huiles essentielles"],
      shareable: false,
      coverUrl: ""
    }
  ];
  return NextResponse.json(data);
}