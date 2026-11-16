import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const event = await EventsRepository.getEvent(eventId);

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const stats = await EventsRepository.getDashboardStats(eventId);
    return NextResponse.json({ event, stats });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
