import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      guestToken,
      status,
      confirmedSeats = 0,
      dietaryNotes = "",
      guestMessage = "",
      songSuggestion = "",
    } = body;

    if (!eventId || !guestToken) {
      return NextResponse.json(
        { error: "eventId y guestToken son obligatorios." },
        { status: 400 }
      );
    }

    if (status !== "CONFIRMED" && status !== "DECLINED") {
      return NextResponse.json(
        { error: "El estado de confirmación debe ser 'CONFIRMED' o 'DECLINED'." },
        { status: 400 }
      );
    }

    // Si es una vista previa de prueba, no persistir en DynamoDB
    if (guestToken === "preview") {
      return NextResponse.json({
        success: true,
        message: "Confirmación simulada en modo vista previa.",
        guest: {
          guestToken: "preview",
          eventId,
          familyName: "Familia Invitada (Vista Previa)",
          primaryContactName: "Invitado de Honor",
          status,
          confirmedSeats: status === "CONFIRMED" ? Number(confirmedSeats) || 2 : 0,
          dietaryNotes,
          guestMessage,
          songSuggestion,
          confirmedAt: new Date().toISOString(),
        },
      });
    }

    const updatedGuest = await AureaRepository.updateGuestRSVP(
      eventId,
      guestToken,
      status,
      Number(confirmedSeats) || 0,
      dietaryNotes,
      guestMessage,
      songSuggestion
    );

    if (!updatedGuest) {
      return NextResponse.json(
        { error: "No se encontró el registro del invitado para actualizar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Confirmación registrada correctamente en DynamoDB.",
      guest: updatedGuest,
    });
  } catch (error: any) {
    console.error("[POST /api/public/rsvp] Error:", error);
    return NextResponse.json(
      { error: "Error interno al registrar confirmación." },
      { status: 500 }
    );
  }
}
