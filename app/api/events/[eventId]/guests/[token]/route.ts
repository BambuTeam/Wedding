import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string; token: string } }
) {
  try {
    const guest = await EventsRepository.getGuest(params.eventId, params.token);

    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ guest });
  } catch (error) {
    console.error("Error fetching guest:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string; token: string } }
) {
  try {
    const body = await request.json();
    const action = body.action;

    // Acción 1: Silent Tracking de apertura de sobre digital
    if (action === "open") {
      const updated = await EventsRepository.trackGuestOpened(params.eventId, params.token);
      return NextResponse.json({ guest: updated });
    }

    // Acción 2: Confirmación RSVP
    if (action === "rsvp") {
      const { status, confirmedSeats, dietaryNotes, guestMessage } = body;
      if (!status || !["CONFIRMED", "DECLINED"].includes(status)) {
        return NextResponse.json({ error: "Estado de RSVP inválido" }, { status: 400 });
      }

      const updated = await EventsRepository.rsvpGuest(params.eventId, params.token, {
        status,
        confirmedSeats: Number(confirmedSeats) || 0,
        dietaryNotes,
        guestMessage,
      });

      return NextResponse.json({ guest: updated });
    }

    // Acción 3: Asignación a mesa (Seating chart)
    if (action === "assign_table") {
      const { tableId } = body;
      const updated = await EventsRepository.assignGuestToTable(
        params.eventId,
        params.token,
        tableId || null
      );
      return NextResponse.json({ guest: updated });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error patching guest:", error);
    return NextResponse.json({ error: "Error al actualizar invitado" }, { status: 500 });
  }
}
