// Cdw-Spm
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { resourceId, email } = await req.json();
    if (!resourceId || !email) {
      return NextResponse.json({ error: "resourceId and email required" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      shareId: `share_${Date.now()}`,
      message: "Resource shared successfully"
    });
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}