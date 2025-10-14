// Cdw-Spm
// Health check endpoint pour monitoring et load balancer

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Vérification basique: l'app répond
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    // TODO: Ajouter check DB avec Prisma
    // try {
    //   await prisma.$queryRaw`SELECT 1`;
    //   healthCheck.database = "connected";
    // } catch (error) {
    //   healthCheck.database = "disconnected";
    //   healthCheck.status = "unhealthy";
    // }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === "healthy" ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
