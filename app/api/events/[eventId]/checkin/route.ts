import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const { guestToken, operator, arrivedGuestsCount } = body;

    if (!guestToken) {
      return NextResponse.json(
        { success: false, message: "Token de pase QR no proporcionado" },
        { status: 400 }
      );
    }

    // Limpiar token si viene con prefijo AUREA:eventId:token
    let cleanToken = guestToken.trim();
    if (cleanToken.startsWith("AUREA:")) {
      const parts = cleanToken.split(":");
      cleanToken = parts[parts.length - 1];
    }

    const result = await AureaRepository.checkInGuest(
      params.eventId,
      cleanToken,
      operator || "Puerta Principal"
    );

    if (!result.success) {
      if (result.alreadyCheckedIn) {
        return NextResponse.json(result, { status: 409 });
      }
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in checkin route:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error al procesar registro en recepción" },
      { status: 500 }
    );
  }
}
