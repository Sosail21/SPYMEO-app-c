// Cdw-Spm
// Health check endpoint pour monitoring et load balancer
// Vérifie: process OK, DB connectée, S3 accessible

import { NextResponse } from "next/server";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database: "connected" | "disconnected";
    s3: "accessible" | "unavailable" | "skipped";
  };
}

export async function GET() {
  try {
    const checks: HealthCheckResponse["checks"] = {
      database: "disconnected",
      s3: "skipped",
    };

    // Check 1: Database connection
    const dbOk = await checkDatabaseConnection();
    checks.database = dbOk ? "connected" : "disconnected";

    // Check 2: S3 accessibility (non-bloquant)
    try {
      if (process.env.AWS_REGION) {
        const s3 = new S3Client({
          region: process.env.AWS_REGION || "eu-west-3",
        });
        await s3.send(new ListBucketsCommand({}));
        checks.s3 = "accessible";
      } else {
        checks.s3 = "skipped";
      }
    } catch (s3Error) {
      console.error("[Health] S3 check failed:", s3Error);
      checks.s3 = "unavailable";
      // S3 failure is not blocking for health
    }

    const isHealthy = checks.database === "connected";

    const healthCheck: HealthCheckResponse = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      checks,
    };

    return NextResponse.json(healthCheck, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error: any) {
    console.error("[Health] Fatal error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error?.message || "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

