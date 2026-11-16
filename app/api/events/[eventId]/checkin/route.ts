import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const { guestToken, operator } = body;

    if (!guestToken) {
      return NextResponse.json(
        { success: false, message: "Token de pase QR no proporcionado" },
        { status: 400 }
      );
    }

    const result = await EventsRepository.atomicCheckIn(
      params.eventId,
      guestToken,
      operator || "Personal de Recepción"
    );

    if (!result.success) {
      if (result.alreadyCheckedIn) {
        return NextResponse.json(result, { status: 409 }); // Conflict / Duplicate entry
      }
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in atomic checkin:", error);
    return NextResponse.json(
      { success: false, message: "Error interno en el servidor de control de acceso" },
      { status: 500 }
    );
  }
}
