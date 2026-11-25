import { NextRequest, NextResponse } from "next/server";
import { RootAdminRepository } from "@/lib/db/repository";
import { EventStatus } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const { status } = (await request.json()) as { status: EventStatus };

    if (!status) {
      return NextResponse.json(
        { error: "Estado requerido ('ACTIVE', 'SUSPENDED', 'ARCHIVED')." },
        { status: 400 }
      );
    }

    const updated = await RootAdminRepository.updateEventStatus(eventId, status);
    if (!updated) {
      return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `El evento ahora está en estado ${status}.`,
      event: updated,
    });
  } catch (err: any) {
    console.error(`[PATCH /api/root/events/${params.id}/status] Error:`, err);
    return NextResponse.json(
      { error: "Error al actualizar estado del evento." },
      { status: 500 }
    );
  }
}
