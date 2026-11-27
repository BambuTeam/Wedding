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
        eventType: body.eventType,
        themePreset: body.themePreset,
        title: body.title,
        eventDate: body.eventDate,
        startTime: body.startTime,
        venueCity: body.venueCity,
        venueName: body.venueName,
        role: body.role,
        agencyName: body.agencyName,
        celebrationType: body.celebrationType,
      });

      const cleanPhone = releaseResult.tenant.phone.replace(/[^0-9]/g, "");
      const origin =
        request.headers.get("origin") ||
        (request.headers.get("x-forwarded-host") ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("x-forwarded-host")}` : null) ||
        (request.headers.get("host") ? `http://${request.headers.get("host")}` : null) ||
        process.env.NEXT_PUBLIC_APP_URL ||
        request.nextUrl.origin ||
        "http://localhost:3000";
      const fullMagicUrl = `${origin}${releaseResult.magicUrl}`.replace(/&eventId=[^&]+/, "");

      const accountIdentifier = releaseResult.tenant.accountCode || releaseResult.tenant.tenantId;
      const celebration = releaseResult.tenant.celebrationType || "Celebración";

      const waText = encodeURIComponent(
        `✨ *¡BIENVENIDO A ÁUREA!* ✨\n` +
        `Tu espacio de anfitrión está activo\n\n` +
        `Hola *${releaseResult.tenant.name}*, es un placer saludarte. Hemos preparado y liberado tu panel exclusivo para tu *${celebration}*.\n\n` +
        `🗝️ *Tus Credenciales de Acceso:*\n` +
        `• *Código de Cuenta:* *${accountIdentifier}*\n` +
        `• *PIN Confidencial (6 dígitos):* *${releaseResult.tenant.accessPin}*\n` +
        (releaseResult.tenant.email ? `• *Correo registrado:* ${releaseResult.tenant.email}\n` : "") +
        `\n` +
        `📲 *Enlace directo a tu panel:* \n${fullMagicUrl}\n\n` +
        `Desde tu panel podrás:\n` +
        `✓ Registrar a tus invitados y familias\n` +
        `✓ Monitorear confirmaciones (RSVP) en vivo\n` +
        `✓ Organizar el acomodo de tus mesas\n` +
        `✓ Personalizar tu invitación con música y fotos\n\n` +
        `💡 *Tip:* Guarda este mensaje para acceder rápidamente cuando lo necesites.\n` +
        `¡Estamos felices de acompañarte en este gran momento! 🤍`
      );

      return NextResponse.json({
        success: true,
        tenant: releaseResult.tenant,
        accountCode: releaseResult.tenant.accountCode,
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
      agencyName,
      plan = "FIRMA",
      celebrationType = "Boda",
      eventType,
      themePreset,
      title,
      eventDate,
      startTime,
      venueCity,
      venueName,
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

    const effectiveDate = eventDate || estimatedDate;

    // Crear solicitud
    const tenant = await AureaRepository.createTenantRequest({
      hostName: clientName,
      email,
      phone,
      celebrationType,
      estimatedDate: effectiveDate,
      guestCount: maxGuestsPerEvent,
      plan: plan as PlanType,
      role: role as TenantRole,
      agencyName,
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
      eventType,
      themePreset,
      title,
      eventDate: effectiveDate,
      startTime,
      venueCity,
      venueName,
      role: role as TenantRole,
      agencyName,
      celebrationType,
    });

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const origin =
      request.headers.get("origin") ||
      (request.headers.get("x-forwarded-host") ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("x-forwarded-host")}` : null) ||
      (request.headers.get("host") ? `http://${request.headers.get("host")}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";
    const fullMagicUrl = `${origin}${releaseResult.magicUrl}`.replace(/&eventId=[^&]+/, "");
    const accountIdentifier = releaseResult.tenant.accountCode || releaseResult.tenant.tenantId;

    const waText = encodeURIComponent(
      `✨ *¡BIENVENIDO A ÁUREA!* ✨\n` +
      `Tu espacio de anfitrión está activo\n\n` +
      `Hola *${clientName}*, es un placer saludarte. Hemos preparado y liberado tu panel exclusivo para tu *${celebrationType}*.\n\n` +
      `🗝️ *Tus Credenciales de Acceso:*\n` +
      `• *Código de Cuenta:* *${accountIdentifier}*\n` +
      `• *PIN Confidencial (6 dígitos):* *${releaseResult.tenant.accessPin}*\n` +
      (email ? `• *Correo registrado:* ${email}\n` : "") +
      `\n` +
      `📲 *Enlace directo a tu panel:* \n${fullMagicUrl}\n\n` +
      `Desde tu panel podrás:\n` +
      `✓ Registrar a tus invitados y familias\n` +
      `✓ Monitorear confirmaciones (RSVP) en vivo\n` +
      `✓ Organizar el acomodo de tus mesas\n` +
      `✓ Personalizar tu invitación con música y fotos\n\n` +
      `💡 *Tip:* Guarda este mensaje para acceder rápidamente cuando lo necesites.\n` +
      `¡Estamos felices de acompañarte en este gran momento! 🤍`
    );

    return NextResponse.json({
      success: true,
      tenant: releaseResult.tenant,
      accountCode: releaseResult.tenant.accountCode,
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
    const { tenantId, action, status, plan, maxGuestsPerEvent, amountPaid } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId es requerido para actualizar." },
        { status: 400 }
      );
    }

    // Caso especial: Reseteo de PIN desde /root
    if (action === "RESET_PIN") {
      const updatedTenant = await AureaRepository.resetTenantPin(tenantId);
      if (!updatedTenant) {
        return NextResponse.json(
          { error: "Cliente no encontrado para restablecer PIN." },
          { status: 404 }
        );
      }

      const cleanPhone = (updatedTenant.phone || "").replace(/[^0-9]/g, "");
      const origin =
        request.headers.get("origin") ||
        (request.headers.get("x-forwarded-host") ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("x-forwarded-host")}` : null) ||
        (request.headers.get("host") ? `http://${request.headers.get("host")}` : null) ||
        process.env.NEXT_PUBLIC_APP_URL ||
        request.nextUrl.origin ||
        "http://localhost:3000";

      const directUrl = `${origin}/dashboard?account=${updatedTenant.accountCode || updatedTenant.tenantId}&pin=${updatedTenant.accessPin}`;
      const accountIdentifier = updatedTenant.accountCode || updatedTenant.tenantId;
      const celebration = updatedTenant.celebrationType || "Celebración";

      const waText = encodeURIComponent(
        `✨ *ÁUREA · ACTUALIZACIÓN DE SEGURIDAD* ✨\n\n` +
        `Hola *${updatedTenant.name}*, tu PIN confidencial de acceso para tu *${celebration}* ha sido actualizado exitosamente.\n\n` +
        `🗝️ *Tus Nuevas Credenciales:*\n` +
        `• *Código de Cuenta:* *${accountIdentifier}*\n` +
        `• *Nuevo PIN Confidencial (6 dígitos):* *${updatedTenant.accessPin}*\n` +
        (updatedTenant.email ? `• *Correo registrado:* ${updatedTenant.email}\n` : "") +
        `\n` +
        `📲 *Enlace directo al panel:* \n${directUrl}\n\n` +
        `Tu PIN anterior ha quedado invalidado por seguridad. Guarda este mensaje para tus próximos ingresos. 🤍`
      );

      return NextResponse.json({
        success: true,
        tenant: updatedTenant,
        accountCode: updatedTenant.accountCode,
        accessPin: updatedTenant.accessPin,
        magicUrl: `/dashboard?account=${updatedTenant.accountCode || updatedTenant.tenantId}&pin=${updatedTenant.accessPin}`,
        fullMagicUrl: directUrl,
        waLink: `https://wa.me/${cleanPhone}?text=${waText}`,
      });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (plan) updates.plan = plan;
    if (maxGuestsPerEvent) updates.maxGuestsPerEvent = Number(maxGuestsPerEvent);
    if (amountPaid !== undefined) {
      updates.amountPaid = Number(amountPaid);
      updates.paidAmountGTQ = Number(amountPaid);
    }
    if (body.paidAmountGTQ !== undefined) {
      updates.paidAmountGTQ = Number(body.paidAmountGTQ);
      updates.amountPaid = Number(body.paidAmountGTQ);
    }
    if (body.name) updates.name = body.name.trim();
    if (body.email) updates.email = body.email.trim();
    if (body.phone) updates.phone = body.phone.trim();
    if (body.role) updates.role = body.role;
    if (body.paymentStatus) updates.paymentStatus = body.paymentStatus;
    if (body.celebrationType) updates.celebrationType = body.celebrationType;

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId es requerido para eliminar." },
        { status: 400 }
      );
    }

    await AureaRepository.deleteTenant(tenantId);

    return NextResponse.json({
      success: true,
      message: `Cliente ${tenantId} y sus eventos fueron eliminados correctamente.`,
    });
  } catch (err: any) {
    console.error("[DELETE /api/root/tenants] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Error al eliminar cliente." },
      { status: 500 }
    );
  }
}
