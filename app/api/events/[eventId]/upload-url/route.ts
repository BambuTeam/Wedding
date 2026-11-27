import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";
import { createPresignedUploadUrl } from "@/lib/aws/s3";
import { verifyEventAccess } from "@/lib/auth/tenantGuard";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const body = await request.json();
    const { filename = "photo.jpg", contentType = "image/jpeg", author = "Invitado", message = "" } = body;

    // Validación de aislamiento multi-tenant si la subida proviene del anfitrión o contiene headers de sesión
    const hasTenantAuth =
      request.headers.has("x-tenant-id") ||
      request.headers.has("x-account-code") ||
      request.headers.has("x-tenant-pin") ||
      author === "Anfitrión";

    if (hasTenantAuth) {
      const auth = await verifyEventAccess(request, eventId);
      if (!auth.authorized) {
        return auth.errorResponse!;
      }
    }

    // 1. Verificar en DynamoDB que el evento exista y esté activo
    const event = await AureaRepository.getEventMeta(eventId);
    if (!event) {
      return NextResponse.json(
        { error: `El evento '${eventId}' no existe.` },
        { status: 404 }
      );
    }

    if (event.isLocked || event.status === "ARCHIVED" || event.status === "SUSPENDED") {
      return NextResponse.json(
        {
          error: "El evento está archivado o suspendido. La subida de fotografías está protegida.",
          isLocked: true,
          status: event.status,
        },
        { status: 403 }
      );
    }

    // 2. Generar Presigned URL con AWS S3 SDK v3
    let presignedResult;
    try {
      presignedResult = await createPresignedUploadUrl(eventId, filename, contentType);
    } catch (s3Error: any) {
      console.warn("[S3 Upload URL] Fallback local o error de credenciales S3:", s3Error?.message);
      // Fallback si S3 aún no tiene credenciales en dev
      const timestamp = Date.now();
      const mockKey = `events/${eventId}/photos/${timestamp}-${filename}`;
      presignedResult = {
        uploadUrl: `https://mock-s3.aurea.lat/${mockKey}`,
        fileKey: mockKey,
        publicUrl: `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80`,
      };
    }

    // 3. Registrar la foto en DynamoDB (PK: EVENT#<eventId>, SK: PHOTO#<timestamp>)
    const registeredPhoto = await AureaRepository.savePhoto(eventId, {
      url: presignedResult.publicUrl,
      author,
      message,
    });

    return NextResponse.json({
      success: true,
      uploadUrl: presignedResult.uploadUrl,
      fileKey: presignedResult.fileKey,
      publicUrl: presignedResult.publicUrl,
      photo: registeredPhoto,
    });
  } catch (error: any) {
    console.error("[POST /api/events/[eventId]/upload-url] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Error al procesar subida a S3." },
      { status: 500 }
    );
  }
}
