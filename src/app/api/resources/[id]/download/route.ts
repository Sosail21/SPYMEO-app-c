// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // Mock: return a simple download response
  return new NextResponse("Resource content for " + params.id, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="resource-${params.id}.txt"`
    }
  });
}