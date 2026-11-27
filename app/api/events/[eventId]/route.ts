import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";
import { AureaRepository } from "@/lib/db/aureaRepository";
import { parseMusicUrl } from "@/lib/musicUtils";
import { EventMusicConfig } from "@/lib/types";
import { verifyEventAccess } from "@/lib/auth/tenantGuard";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;

    // Validación de aislamiento multi-tenant
    const auth = await verifyEventAccess(request, eventId);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const event = auth.event || await AureaRepository.getEventMeta(eventId) || await EventsRepository.getEvent(eventId);

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;

    // Validación de aislamiento multi-tenant
    const auth = await verifyEventAccess(request, eventId);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { error: "Payload requerido para actualizar el evento." },
        { status: 400 }
      );
    }

    let finalEvent = null;

    // 1. Si incluye personalización completa del evento (Estudio del Anfitrión)
    const updates = body.eventUpdates || (body.musicConfig ? null : body);
    if (updates && typeof updates === "object") {
      const allowedKeys = [
        "title",
        "category",
        "brideName",
        "groomName",
        "hostNames",
        "tagline",
        "eventDate",
        "eventDateFormatted",
        "venueName",
        "venueCity",
        "venueAddress",
        "googleMapsUrl",
        "wazeUrl",
        "receptionVenueName",
        "receptionVenueAddress",
        "receptionGoogleMapsUrl",
        "receptionWazeUrl",
        "coverImageUrl",
        "ourStory",
        "dressCodeTitle",
        "dressCodeDescription",
        "paletteColors",
        "paletteColorNames",
        "itinerary",
        "menu",
        "giftRegistries",
        "hotels",
        "editorialPhotos",
        "custom3dSlots",
        "wifiSsid",
        "wifiPassword",
      ];

      const cleanUpdates: Record<string, any> = {};
      for (const k of allowedKeys) {
        if (updates[k] !== undefined) {
          cleanUpdates[k] = updates[k];
        }
      }

      if (Object.keys(cleanUpdates).length > 0) {
        const updatedAurea = await AureaRepository.updateEventMeta(eventId, cleanUpdates);
        const updatedEvents = await EventsRepository.updateEventMeta(eventId, cleanUpdates);
        finalEvent = updatedAurea || updatedEvents;
      }
    }

    // 2. Si incluye configuración de banda sonora
    if (body.musicConfig) {
      const incoming: EventMusicConfig = body.musicConfig;
      let cleanConfig: EventMusicConfig = {
        provider: incoming.provider || "none",
      };

      if (incoming.provider === "youtube" || incoming.provider === "spotify") {
        const parsed = parseMusicUrl(incoming.url || incoming.trackId || "");
        if (!parsed.valid || !parsed.trackId) {
          return NextResponse.json(
            { error: parsed.error || "Enlace de YouTube o Spotify inválido." },
            { status: 400 }
          );
        }
        cleanConfig = {
          provider: parsed.provider,
          trackId: parsed.trackId,
          url: incoming.url || "",
          songTitle: incoming.songTitle?.trim() || (parsed.provider === "youtube" ? "Nuestra Canción en YouTube" : "Banda Sonora en Spotify"),
          artist: incoming.artist?.trim() || "",
        };
      } else if (incoming.provider === "aurea_ambient") {
        const validPresets = ["piano", "strings", "acoustic"];
        const preset = validPresets.includes(incoming.preset || "") ? incoming.preset : "strings";
        const presetNames: Record<string, string> = {
          piano: "Piano Clásico",
          strings: "Cuerdas Románticas",
          acoustic: "Acústico Sereno",
        };
        cleanConfig = {
          provider: "aurea_ambient",
          preset: preset as any,
          songTitle: presetNames[preset as string] || "Melodía Instrumental",
          artist: "Áurea Sound Ensemble",
        };
      } else {
        cleanConfig = {
          provider: "none",
          songTitle: "Sin música",
        };
      }

      const updatedAurea = await AureaRepository.updateEventMusicConfig(eventId, cleanConfig);
      const updatedEvents = await EventsRepository.updateEventMusicConfig(eventId, cleanConfig);
      finalEvent = updatedAurea || updatedEvents;
    }

    if (!finalEvent) {
      finalEvent = (await AureaRepository.getEventMeta(eventId)) || (await EventsRepository.getEvent(eventId));
    }

    if (!finalEvent) {
      return NextResponse.json(
        { error: "No se encontró el evento para actualizar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Celebración actualizada con éxito en DynamoDB.",
      event: finalEvent,
    });
  } catch (error: any) {
    console.error("Error updating event in PATCH /api/events/[eventId]:", error);
    return NextResponse.json(
      { error: error?.message || "Error al actualizar la celebración." },
      { status: 500 }
    );
  }
}

