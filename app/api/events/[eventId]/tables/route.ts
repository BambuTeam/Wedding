import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const tables = await EventsRepository.getTables(params.eventId);
    const guests = await EventsRepository.getAllGuests(params.eventId);

    // Calcular ocupación de cada mesa
    const tablesWithOccupancy = tables.map((t) => {
      const assignedGuests = guests.filter((g) => g.tableId === t.tableId);
      const occupiedSeats = assignedGuests.reduce((acc, g) => acc + (g.confirmedSeats || g.maxSeats), 0);
      return {
        ...t,
        occupiedSeats,
        assignedGuests,
      };
    });

    return NextResponse.json({ tables: tablesWithOccupancy });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json({ error: "Error al listar mesas" }, { status: 500 });
  }
}
