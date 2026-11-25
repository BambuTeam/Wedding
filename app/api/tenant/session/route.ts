import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";
import { ROOT_COOKIE_NAME, verifyRootJwt } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantIdParam = searchParams.get("tenant") || searchParams.get("tenantId");
    const pinParam = searchParams.get("pin") || request.headers.get("x-access-pin");
    const requestedEventId = searchParams.get("eventId");

    // Verificar si quien consulta tiene sesión activa de Root SuperAdmin
    const rootCookie = request.cookies.get(ROOT_COOKIE_NAME)?.value;
    const isRootAdmin = Boolean(rootCookie ? await verifyRootJwt(rootCookie) : null);

    // Caso 1: Si no se especifica tenant
    if (!tenantIdParam) {
      if (isRootAdmin) {
        // El SuperAdmin puede ver todos los eventos en modo supervisor
        const allEvents = await AureaRepository.listAllEventsWithMetrics();
        const primaryMeta = (await AureaRepository.getEventMeta(requestedEventId || "camila-andres-2026")) || (await AureaRepository.getEventMeta("camila-andres-2025"));
        return NextResponse.json({
          valid: true,
          isRootAdmin: true,
          tenant: {
            tenantId: "root_superadmin",
            name: "SuperAdmin Áurea",
            role: "PLANNER",
            status: "ACTIVE",
          },
          events: allEvents,
          currentEvent: primaryMeta,
        });
      }

      return NextResponse.json(
        {
          valid: false,
          reason: "NO_TENANT",
          message: "No se proporcionó un identificador de anfitrión o celebración.",
        },
        { status: 401 }
      );
    }

    // Caso 2: Buscar el Tenant en DynamoDB (PK: TENANT#<id>, SK: PROFILE)
    const tenant = await AureaRepository.getTenant(tenantIdParam.trim());

    if (!tenant) {
      return NextResponse.json(
        {
          valid: false,
          reason: "NOT_FOUND",
          message: "No encontramos ninguna cuenta o celebración registrada con este identificador.",
        },
        { status: 404 }
      );
    }

    // Caso 3: Validar estado del Tenant
    if (tenant.status === "PENDING_RELEASE") {
      return NextResponse.json(
        {
          valid: false,
          reason: "PENDING_RELEASE",
          tenantId: tenant.tenantId,
          tenantName: tenant.name,
          phone: tenant.phone,
          celebrationType: tenant.celebrationType || "Celebración",
          message: `Hola ${tenant.name}, tu espacio está en proceso de liberación por nuestro equipo. Escríbenos para activar tu acceso inmediato.`,
        },
        { status: 403 }
      );
    }

    if (tenant.status === "SUSPENDED") {
      return NextResponse.json(
        {
          valid: false,
          reason: "SUSPENDED",
          tenantId: tenant.tenantId,
          tenantName: tenant.name,
          message: "El acceso a este espacio se encuentra pausado temporalmente.",
        },
        { status: 403 }
      );
    }

    if (tenant.status === "ARCHIVED") {
      return NextResponse.json(
        {
          valid: false,
          reason: "ARCHIVED",
          tenantId: tenant.tenantId,
          tenantName: tenant.name,
          message: "Esta celebración ha finalizado y se encuentra archivada en modo recuerdo.",
        },
        { status: 403 }
      );
    }

    // Caso 4: Validar PIN de acceso (Si no es Root Admin)
    const storedPin = tenant.accessPin?.trim();
    const providedPin = pinParam?.trim();

    if (!isRootAdmin) {
      if (!providedPin || providedPin !== storedPin) {
        return NextResponse.json(
          {
            valid: false,
            reason: "INVALID_PIN",
            tenantId: tenant.tenantId,
            tenantName: tenant.name,
            message: "El PIN de 6 dígitos ingresado es incorrecto o no fue proporcionado.",
          },
          { status: 401 }
        );
      }
    }

    // Caso 5: Autenticación exitosa -> Cargar EXCLUSIVAMENTE los eventos de ESTE tenant
    const tenantEvents = await AureaRepository.getTenantEvents(tenant.tenantId);

    // Seleccionar evento activo
    let currentEvent = null;
    if (requestedEventId) {
      currentEvent = tenantEvents.find((e) => e.eventId === requestedEventId) || null;
    }
    if (!currentEvent && tenantEvents.length > 0) {
      currentEvent = tenantEvents[0];
    }
    if (!currentEvent && tenant.primaryEventId) {
      currentEvent = await AureaRepository.getEventMeta(tenant.primaryEventId);
    }

    return NextResponse.json({
      valid: true,
      isRootAdmin,
      tenant: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        role: tenant.role,
        plan: tenant.plan,
        celebrationType: tenant.celebrationType,
        status: tenant.status,
      },
      events: tenantEvents,
      currentEvent,
    });
  } catch (error: any) {
    console.error("[GET /api/tenant/session] Error:", error);
    return NextResponse.json(
      {
        valid: false,
        reason: "SERVER_ERROR",
        message: "Ocurrió un error al validar la sesión de anfitrión.",
      },
      { status: 500 }
    );
  }
}
