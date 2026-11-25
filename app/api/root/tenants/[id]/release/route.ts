import { NextRequest, NextResponse } from "next/server";
import { TenantsRepository } from "@/lib/db/repository";
import { ReleaseTenantPayload } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id;
    let payload: ReleaseTenantPayload = {};

    try {
      payload = await request.json();
    } catch {
      // JSON body is optional
    }

    const result = await TenantsRepository.releaseTenant(tenantId, payload);

    return NextResponse.json({
      success: true,
      message: `¡Cliente ${result.tenant.name} liberado y activado exitosamente!`,
      ...result,
    });
  } catch (err: any) {
    console.error(`[POST /api/root/tenants/${params.id}/release] Error:`, err);
    return NextResponse.json(
      { error: err.message || "Error al liberar al cliente." },
      { status: 500 }
    );
  }
}
