import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";
import { EventStatus, PlanType } from "@/lib/types";

export async function GET() {
  try {
    const events = await AureaRepository.listAllEventsWithMetrics();
    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error("[GET /api/root/events] Error:", err);
    return NextResponse.json(
      { error: "Error al listar directorio global de eventos." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, status, isLocked, maxGuestsLimit, plan } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId es requerido." },
        { status: 400 }
      );
    }

    let updatedEvent = null;

    if (status) {
      updatedEvent = await AureaRepository.updateEventStatus(
        eventId,
        status as EventStatus,
        isLocked
      );
    }

    if (maxGuestsLimit) {
      updatedEvent = await AureaRepository.updateEventLimits(
        eventId,
        Number(maxGuestsLimit),
        plan as PlanType
      );
    }

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evento actualizado correctamente en DynamoDB.",
      event: updatedEvent,
    });
  } catch (err: any) {
    console.error("[PATCH /api/root/events] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Error al actualizar evento." },
      { status: 500 }
    );
  }
}
