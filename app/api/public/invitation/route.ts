import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";
import { Guest, EventMeta } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || searchParams.get("token");
    const eventIdParam = searchParams.get("eventId");

    if (!slug) {
      return NextResponse.json(
        { error: "Token o slug de invitación requerido." },
        { status: 400 }
      );
    }

    // 1. Caso Vista Previa del Anfitrión (slug === 'preview')
    if (slug === "preview" && eventIdParam) {
      const eventMeta = await AureaRepository.getEventMeta(eventIdParam);
      if (!eventMeta) {
        return NextResponse.json(
          { error: `No se encontró la celebración con ID '${eventIdParam}'.` },
          { status: 404 }
        );
      }

      const previewGuest: Guest = {
        guestToken: "preview",
        eventId: eventIdParam,
        familyName: "Familia Invitada (Vista Previa)",
        primaryContactName: "Invitado de Honor",
        phone: "+502 0000 0000",
        maxSeats: 4,
        confirmedSeats: 0,
        status: "OPENED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        openedAt: new Date().toISOString(),
      };

      const tables = await AureaRepository.getTables(eventIdParam);

      return NextResponse.json({
        success: true,
        isPreview: true,
        event: eventMeta,
        guest: previewGuest,
        tables,
      });
    }

    // 2. Caso Invitación Real por Token de Familia
    const eventId = eventIdParam || "camila-andres-2025";
    let guest = await AureaRepository.getGuest(eventId, slug);

    // Si no se encontró por eventId dado, buscar en eventos conocidos
    if (!guest && !eventIdParam) {
      guest = await AureaRepository.getGuest("camila-andres-2026", slug);
    }

    if (!guest) {
      // Si no existe el invitado pero el evento sí existe, crear invitado fallback para ese evento
      const eventMeta = await AureaRepository.getEventMeta(eventId);
      if (eventMeta) {
        guest = {
          guestToken: slug,
          eventId,
          familyName: "Familia Invitada",
          primaryContactName: "Invitado Especial",
          maxSeats: 2,
          confirmedSeats: 0,
          status: "OPENED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          openedAt: new Date().toISOString(),
        };
      }
    }

    if (!guest) {
      return NextResponse.json(
        { error: "Invitación no encontrada." },
        { status: 404 }
      );
    }

    // Marcar como abierta en tiempo real en DynamoDB
    if (guest.guestToken !== "preview") {
      const updatedGuest = await AureaRepository.markGuestOpened(guest.eventId, guest.guestToken);
      if (updatedGuest) guest = updatedGuest;
    }

    const eventMeta = await AureaRepository.getEventMeta(guest.eventId);
    if (!eventMeta) {
      return NextResponse.json(
        { error: "Celebración no encontrada." },
        { status: 404 }
      );
    }

    const tables = await AureaRepository.getTables(guest.eventId);

    return NextResponse.json({
      success: true,
      isPreview: false,
      event: eventMeta,
      guest,
      tables,
    });
  } catch (error: any) {
    console.error("[GET /api/public/invitation] Error:", error);
    return NextResponse.json(
      { error: "Error al cargar la invitación." },
      { status: 500 }
    );
  }
}
