import { NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";

export async function GET() {
  try {
    const kpis = await AureaRepository.getPlatformKpis();
    return NextResponse.json({ success: true, kpis });
  } catch (err: any) {
    console.error("[GET /api/root/kpis] Error:", err);
    return NextResponse.json(
      { error: "Error al calcular métricas de plataforma." },
      { status: 500 }
    );
  }
}
