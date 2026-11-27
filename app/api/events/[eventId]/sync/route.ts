import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const [guests, photos] = await Promise.all([
      AureaRepository.getGuests(eventId),
      AureaRepository.getPhotos(eventId),
    ]);

    // Recientes check-ins ordenados por fecha de ingreso
    const recentCheckIns = guests
      .filter((g) => Boolean(g.checkedInAt))
      .sort((a, b) => (b.checkedInAt || "").localeCompare(a.checkedInAt || ""))
      .slice(0, 10);

    const confirmedCount = guests.reduce((acc, g) => (g.status === "CONFIRMED" ? acc + (g.confirmedSeats || g.maxSeats || 1) : acc), 0);
    const checkedInCount = guests.filter((g) => Boolean(g.checkedInAt)).reduce((acc, g) => acc + (g.confirmedSeats || g.maxSeats || 1), 0);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        stats: {
          totalGuestsConfirmed: confirmedCount,
          totalCheckedInSeats: checkedInCount,
        },
        recentCheckIns,
        latestPhotos: photos.slice(0, 15),
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
