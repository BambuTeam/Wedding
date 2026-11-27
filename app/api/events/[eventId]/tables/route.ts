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

    const tables = await EventsRepository.getTables(params.eventId);
    const guests = await EventsRepository.getAllGuests(params.eventId);

    // Calcular ocupación de cada mesa
    const safeTables = Array.isArray(tables) ? tables : [];
    const safeGuests = Array.isArray(guests) ? guests : [];
    const tablesWithOccupancy = safeTables.map((t) => {
      const assignedGuests = safeGuests.filter((g) => g.tableId === t.tableId);
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
