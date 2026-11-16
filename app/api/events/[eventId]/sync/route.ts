import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const [stats, photos, guests] = await Promise.all([
      EventsRepository.getDashboardStats(eventId),
      EventsRepository.getPhotos(eventId),
      EventsRepository.getAllGuests(eventId),
    ]);

    // Últimos 8 check-ins
    const recentCheckIns = guests
      .filter((g) => Boolean(g.checkedInAt))
      .sort((a, b) => (b.checkedInAt || "").localeCompare(a.checkedInAt || ""))
      .slice(0, 8);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        stats,
        recentCheckIns,
        latestPhotos: photos.slice(0, 10),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error in sync route:", error);
    return NextResponse.json({ error: "Error en sincronización" }, { status: 500 });
  }
}
