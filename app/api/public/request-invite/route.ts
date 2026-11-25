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
        { error: "Nombre, correo y WhatsApp son campos obligatorios." },
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
      message: "Tu solicitud ha sido recibida con éxito. El equipo de Áurea se comunicará contigo para activar tu espacio.",
      tenantId: tenant.tenantId,
      status: tenant.status,
      tenant,
    });
  } catch (error: any) {
    console.error("[POST /api/public/request-invite] Error:", error);
    return NextResponse.json(
      { error: "No se pudo procesar tu solicitud en este momento. Por favor contáctanos por WhatsApp." },
      { status: 500 }
    );
  }
}
