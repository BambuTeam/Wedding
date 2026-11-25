import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hostName,
      email,
      phone,
      celebrationType,
      estimatedDate,
      guestCount,
      plan,
      notes,
    } = body;

    if (!hostName || !email || !phone) {
      return NextResponse.json(
        { error: "Nombre, correo y teléfono son campos obligatorios." },
        { status: 400 }
      );
    }

    const tenant = await AureaRepository.createTenantRequest({
      hostName,
      email,
      phone,
      celebrationType,
      estimatedDate,
      guestCount,
      plan,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Solicitud registrada correctamente.",
      tenantId: tenant.tenantId,
      status: tenant.status,
      tenant,
    });
  } catch (err: any) {
    console.error("[POST /api/requests] Error:", err);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud." },
      { status: 500 }
    );
  }
}
