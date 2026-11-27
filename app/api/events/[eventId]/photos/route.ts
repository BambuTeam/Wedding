import { NextRequest, NextResponse } from "next/server";
import { AureaRepository } from "@/lib/db/aureaRepository";
import { uploadBufferToS3 } from "@/lib/aws/s3";
import { moderateImageBuffer } from "@/lib/aws/rekognition";

export const dynamic = "force-dynamic";

// GET /api/events/[eventId]/photos - Lista todas las fotos del álbum colaborativo
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const photos = await AureaRepository.getPhotos(eventId);
    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error("[GET /api/events/[eventId]/photos] Error:", error);
    return NextResponse.json({ error: "Error al obtener fotos del evento" }, { status: 500 });
  }
}

// POST /api/events/[eventId]/photos - Subida directa multipart/form-data o JSON con URL
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    // Verificar estado del evento
    const event = await AureaRepository.getEventMeta(eventId);
    if (!event) {
      return NextResponse.json({ error: `El evento '${eventId}' no existe.` }, { status: 404 });
    }

    if (event.isLocked || event.status === "ARCHIVED" || event.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "El evento está archivado o suspendido. La subida de fotografías está protegida." },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // 1. Manejo de multipart/form-data (Subida garantizada y directa a S3 desde el cliente)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const author = (formData.get("author") as string)?.trim() || "Invitado";
      const message = (formData.get("message") as string)?.trim() || "";

      if (!file) {
        return NextResponse.json({ error: "No se proporcionó ningún archivo de imagen." }, { status: 400 });
      }

      // Buffer de la imagen
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // -------------------------------------------------------------
      // MODERACIÓN AUTOMÁTICA ANTI-CONTENIDO OBSCENO (AWS REKOGNITION)
      // -------------------------------------------------------------
      const moderation = await moderateImageBuffer(buffer);
      if (!moderation.isSafe) {
        return NextResponse.json(
          {
            error: "Esta fotografía no cumple con las normas de convivencia del evento y fue bloqueada automáticamente.",
            blockedReason: moderation.blockedReason,
          },
          { status: 422 }
        );
      }

      // Sanitizar nombre de archivo
      const cleanName = (file.name || "foto.jpg")
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, "_")
        .replace(/_+/g, "_");

      const fileKey = `events/${eventId}/live/${Date.now()}-${cleanName}`;
      const imageMime = file.type || "image/jpeg";

      // Subir directamente a S3
      const { s3Key, readUrl } = await uploadBufferToS3(buffer, fileKey, imageMime);

      // Registrar en DynamoDB
      const photo = await AureaRepository.savePhoto(eventId, {
        url: readUrl,
        s3Key,
        author,
        message,
      });

      return NextResponse.json({ success: true, photo }, { status: 201 });
    }

    // 2. Manejo de JSON con URL previa
    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ error: "La URL o archivo de la foto es requerido." }, { status: 400 });
    }

    const photo = await AureaRepository.savePhoto(eventId, {
      url: body.url,
      s3Key: body.s3Key,
      author: body.author || "Invitado",
      message: body.message || "",
    });

    return NextResponse.json({ success: true, photo }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/events/[eventId]/photos] Error:", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo subir la fotografía. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
