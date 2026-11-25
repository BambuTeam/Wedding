import { NextRequest, NextResponse } from "next/server";
import { AureaRepository, generateAccessPin, slugify } from "@/lib/db/aureaRepository";
import { TenantRole, PlanType, PaymentStatus, TenantStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const tenants = await AureaRepository.listTenants();
    return NextResponse.json({ success: true, tenants });
  } catch (err: any) {
    console.error("[GET /api/root/tenants] Error:", err);
    return NextResponse.json(
      { error: "Error al listar clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Caso 1: Liberar cliente existente (1-Click Release)
    if (body.tenantId && body.action === "release") {
      const releaseResult = await AureaRepository.releaseTenant(body.tenantId, {
        plan: body.plan,
        maxGuestsPerEvent: body.maxGuestsPerEvent ? Number(body.maxGuestsPerEvent) : undefined,
        amountPaid: body.amountPaid ? Number(body.amountPaid) : undefined,
        paidAmountGTQ: body.paidAmountGTQ ? Number(body.paidAmountGTQ) : undefined,
        currency: body.currency,
        paymentStatus: body.paymentStatus,
      });

      const cleanPhone = releaseResult.tenant.phone.replace(/[^0-9]/g, "");
      const origin =
        request.headers.get("origin") ||
        (request.headers.get("x-forwarded-host") ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("x-forwarded-host")}` : null) ||
        (request.headers.get("host") ? `http://${request.headers.get("host")}` : null) ||
        process.env.NEXT_PUBLIC_APP_URL ||
        request.nextUrl.origin ||
        "http://localhost:3000";
      const fullMagicUrl = `${origin}${releaseResult.magicUrl}`;

      const waText = encodeURIComponent(
        `\u2728 *¡BIENVENIDO A ÁUREA! TU ESPACIO ESTÁ ACTIVO* \u2728\n\n` +
          `Hola *${releaseResult.tenant.name}*, tu acceso al panel de anfitrión para tu *${releaseResult.tenant.celebrationType || "Celebración"}* ha sido liberado:\n\n` +
          `\uD83D\uDD17 *Enlace directo:* \n${fullMagicUrl}\n\n` +
          `\uD83D\uDD10 *PIN de Acceso (6 dígitos):* *${releaseResult.tenant.accessPin}*\n\n` +
          `\u2022 Desde aquí podrás registrar a tus invitados, acomodar tus mesas en el jardín y monitorear confirmaciones en tiempo real.`
      );

      return NextResponse.json({
        success: true,
        tenant: releaseResult.tenant,
        eventId: releaseResult.eventId,
        accessPin: releaseResult.tenant.accessPin,
        magicUrl: releaseResult.magicUrl,
        fullMagicUrl,
        waLink: `https://wa.me/${cleanPhone}?text=${waText}`,
      });
    }

    // Caso 2: Crear y Liberar Cliente Nuevo
    const {
      name,
      hostName,
      email,
      phone,
      role = "COUPLE",
      plan = "FIRMA",
      celebrationType = "Boda",
      estimatedDate,
      maxGuestsPerEvent = 200,
      amountPaid = 2600,
      currency = "GTQ",
      paymentStatus = "PAID",
      notes,
    } = body;

    const clientName = name || hostName;

    if (!clientName || !email || !phone) {
      return NextResponse.json(
        { error: "Nombre, correo y WhatsApp son campos requeridos." },
        { status: 400 }
      );
    }

    // Crear solicitud
    const tenant = await AureaRepository.createTenantRequest({
      hostName: clientName,
      email,
      phone,
      celebrationType,
      estimatedDate,
      guestCount: maxGuestsPerEvent,
      plan: plan as PlanType,
      role: role as TenantRole,
      notes,
    });

    // Liberar inmediatamente
    const releaseResult = await AureaRepository.releaseTenant(tenant.tenantId, {
      plan: plan as PlanType,
      maxGuestsPerEvent: Number(maxGuestsPerEvent) || 200,
      amountPaid: Number(amountPaid) || 2600,
      paidAmountGTQ: Number(amountPaid) || 2600,
      currency: currency as "GTQ" | "USD",
      paymentStatus: paymentStatus as PaymentStatus,
    });

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const origin =
      request.headers.get("origin") ||
      (request.headers.get("x-forwarded-host") ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("x-forwarded-host")}` : null) ||
      (request.headers.get("host") ? `http://${request.headers.get("host")}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";
    const fullMagicUrl = `${origin}${releaseResult.magicUrl}`;

    const waText = encodeURIComponent(
      `\u2728 *¡BIENVENIDO A ÁUREA! TU ESPACIO ESTÁ ACTIVO* \u2728\n\n` +
        `Hola *${clientName}*, tu acceso al panel de anfitrión para tu *${celebrationType}* ha sido liberado:\n\n` +
        `\uD83D\uDD17 *Enlace directo:* \n${fullMagicUrl}\n\n` +
        `\uD83D\uDD10 *PIN de Acceso (6 dígitos):* *${releaseResult.tenant.accessPin}*\n\n` +
        `\u2022 ¡Felicidades por tu evento!`
    );

    return NextResponse.json({
      success: true,
      tenant: releaseResult.tenant,
      eventId: releaseResult.eventId,
      accessPin: releaseResult.tenant.accessPin,
      magicUrl: releaseResult.magicUrl,
      fullMagicUrl,
      waLink: `https://wa.me/${cleanPhone}?text=${waText}`,
    });
  } catch (err: any) {
    console.error("[POST /api/root/tenants] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Error al procesar cliente." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, status, plan, maxGuestsPerEvent, amountPaid } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId es requerido para actualizar." },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (plan) updates.plan = plan;
    if (maxGuestsPerEvent) updates.maxGuestsPerEvent = Number(maxGuestsPerEvent);
    if (amountPaid) {
      updates.amountPaid = Number(amountPaid);
      updates.paidAmountGTQ = Number(amountPaid);
    }

    const updated = await AureaRepository.updateTenant(tenantId, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    console.error("[PATCH /api/root/tenants] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Error al actualizar cliente." },
      { status: 500 }
    );
  }
}
