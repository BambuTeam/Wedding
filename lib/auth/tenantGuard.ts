import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";
import { ROOT_COOKIE_NAME, verifyRootJwt } from "@/lib/auth/jwt";
import { Tenant, EventMeta } from "@/lib/types";

export interface EventAuthResult {
  authorized: boolean;
  isRootAdmin: boolean;
  tenant?: Tenant;
  event?: EventMeta;
  errorResponse?: NextResponse;
}

/**
 * Validador estricto de aislamiento multi-tenant para APIs privadas de eventos.
 *
 * Reglas de autorización:
 * 1. SuperAdmin con cookie `aurea_root_session` válida -> Autorizado con acceso de supervisor.
 * 2. Si no es SuperAdmin, DEBE proveer credenciales de anfitrión:
 *    - Header `x-tenant-id` (o `x-account-code`, o query `account`/`tenant`)
 *    - Header `x-tenant-pin` (o `x-access-pin`, o query `pin`)
 * 3. El Tenant debe existir y estar en estado 'ACTIVE'.
 * 4. El PIN provisto debe coincidir exactamente con el `accessPin` del tenant.
 * 5. El evento (`eventId`) solicitado DEBE pertenecer a este tenant:
 *    - Si role es 'HOST' o 'COUPLE': `tenant.primaryEventId === eventId` o el evento tiene `event.tenantId === tenant.tenantId`.
 *    - Si role es 'PLANNER': el evento debe estar asociado al tenant en DynamoDB.
 * 6. Si no cumple, responde con 401 (sin credenciales) o 403 (acceso prohibido a evento ajeno).
 */
export async function verifyEventAccess(
  request: NextRequest,
  eventId: string
): Promise<EventAuthResult> {
  // 1. Extraer credenciales de Anfitrión desde Headers o QueryParams
  const tenantHeader =
    request.headers.get("x-tenant-id") ||
    request.headers.get("x-account-code") ||
    request.nextUrl.searchParams.get("tenant") ||
    request.nextUrl.searchParams.get("account");

  const pinHeader =
    request.headers.get("x-tenant-pin") ||
    request.headers.get("x-access-pin") ||
    request.nextUrl.searchParams.get("pin");

  // Si se envían credenciales de anfitrión, OBLIGATORIO aislar en modo anfitrión estricto
  // (Incluso si en ese navegador existe una cookie de SuperAdmin de /root)
  if (tenantHeader || pinHeader) {
    if (!tenantHeader || !pinHeader) {
      return {
        authorized: false,
        isRootAdmin: false,
        errorResponse: NextResponse.json(
          {
            error: "Credenciales de anfitrión incompletas. Se requieren 'x-tenant-id' (o account) y 'x-tenant-pin' (o pin).",
            reason: "UNAUTHORIZED",
          },
          { status: 401 }
        ),
      };
    }

    // Resolver el Tenant por Código de Cuenta (AUR-XXXX), Correo o tenantId
    const tenant = await AureaRepository.resolveTenantIdentifier(tenantHeader.trim());

    if (!tenant) {
      return {
        authorized: false,
        isRootAdmin: false,
        errorResponse: NextResponse.json(
          {
            error: "No encontramos ninguna cuenta activa asociada a este identificador.",
            reason: "TENANT_NOT_FOUND",
          },
          { status: 404 }
        ),
      };
    }

    // Validar estado del Tenant
    if (tenant.status !== "ACTIVE") {
      return {
        authorized: false,
        isRootAdmin: false,
        tenant,
        errorResponse: NextResponse.json(
          {
            error: `El acceso a esta cuenta no está activo (Estado actual: ${tenant.status}).`,
            reason: tenant.status,
            tenantName: tenant.name,
          },
          { status: 403 }
        ),
      };
    }

    // Validar PIN de 6 dígitos
    if (tenant.accessPin?.trim() !== pinHeader.trim()) {
      return {
        authorized: false,
        isRootAdmin: false,
        tenant,
        errorResponse: NextResponse.json(
          {
            error: "PIN de seguridad incorrecto.",
            reason: "INVALID_PIN",
          },
          { status: 403 }
        ),
      };
    }

    // Validar pertenencia estricta del evento
    const tenantEvents = await AureaRepository.getTenantEvents(tenant.tenantId);
    const ownsEvent =
      tenantEvents.some((e) => e.eventId === eventId) ||
      tenant.primaryEventId === eventId;

    if (!ownsEvent) {
      return {
        authorized: false,
        isRootAdmin: false,
        tenant,
        errorResponse: NextResponse.json(
          {
            error: "Acceso prohibido. No tienes permiso para ver o modificar este evento.",
            reason: "FORBIDDEN_CROSS_TENANT",
            allowedEventId: tenant.primaryEventId || tenantEvents[0]?.eventId,
          },
          { status: 403 }
        ),
      };
    }

    const event =
      tenantEvents.find((e) => e.eventId === eventId) ||
      (await AureaRepository.getEventMeta(eventId));

    return {
      authorized: true,
      isRootAdmin: false,
      tenant,
      event: event || undefined,
    };
  }

  // 2. Si NO se enviaron credenciales de anfitrión, comprobar sesión de SuperAdmin desde /root
  const rootCookie = request.cookies.get(ROOT_COOKIE_NAME)?.value;
  if (rootCookie) {
    const rootPayload = await verifyRootJwt(rootCookie);
    if (rootPayload) {
      const event = await AureaRepository.getEventMeta(eventId);
      return {
        authorized: true,
        isRootAdmin: true,
        event: event || undefined,
      };
    }
  }

  // 3. Ni anfitrión ni SuperAdmin
  return {
    authorized: false,
    isRootAdmin: false,
    errorResponse: NextResponse.json(
      {
        error: "Acceso no autorizado. Se requieren credenciales de anfitrión (x-tenant-id y x-tenant-pin) o sesión de SuperAdmin.",
        reason: "UNAUTHORIZED",
      },
      { status: 401 }
    ),
  };
}
