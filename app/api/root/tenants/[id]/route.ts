import { NextRequest, NextResponse } from "next/server";
import { TenantsRepository } from "@/lib/db/repository";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await TenantsRepository.getTenant(params.id);
    if (!tenant) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ success: true, tenant });
  } catch (err: any) {
    return NextResponse.json({ error: "Error al obtener cliente." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id;
    const body = await request.json();

    if (body.action === "toggle_status" && body.status) {
      const updated = await TenantsRepository.toggleTenantStatus(tenantId, body.status);
      return NextResponse.json({
        success: true,
        message: `Estado del cliente cambiado a ${body.status}.`,
        tenant: updated,
      });
    }

    const updated = await TenantsRepository.updateTenant(tenantId, body);
    return NextResponse.json({
      success: true,
      message: "Datos del cliente actualizados correctamente.",
      tenant: updated,
    });
  } catch (err: any) {
    console.error(`[PATCH /api/root/tenants/${params.id}] Error:`, err);
    return NextResponse.json(
      { error: "Error al actualizar cliente." },
      { status: 500 }
    );
  }
}
