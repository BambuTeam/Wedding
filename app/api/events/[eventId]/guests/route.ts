import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";
import { verifyEventAccess } from "@/lib/auth/tenantGuard";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const auth = await verifyEventAccess(request, params.eventId);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const guests = await EventsRepository.getAllGuests(params.eventId);
    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json({ error: "Error al listar invitados" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const auth = await verifyEventAccess(request, params.eventId);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    if (!body.familyName || !body.maxSeats) {
      return NextResponse.json(
        { error: "Nombre de familia y número de lugares son requeridos" },
        { status: 400 }
      );
    }

    const saved = await EventsRepository.saveGuest(params.eventId, body);
    return NextResponse.json({ guest: saved }, { status: 201 });
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json({ error: "Error al crear invitado" }, { status: 500 });
  }
}
