import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const isS3Configured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_NAME
);

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const { filename, contentType } = body;

    const eventId = params.eventId;
    const cleanFileName = (filename || "photo.jpg").replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `events/${eventId}/photos/${Date.now()}-${cleanFileName}`;

    if (!isS3Configured) {
      // Modo Demo / Fallback local
      return NextResponse.json({
        isDemoFallback: true,
        uploadUrl: null,
        fileKey: key,
        publicUrl: `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80`,
        message: "Operando en modo demo. La subida se procesa localmente con URL simulada.",
      });
    }

    const s3 = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const bucketName = process.env.S3_BUCKET_NAME!;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || "image/jpeg",
    });

    // Genera URL firmada con validez de 5 minutos (300s)
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const publicUrl = process.env.S3_PUBLIC_DOMAIN
      ? `${process.env.S3_PUBLIC_DOMAIN}/${key}`
      : `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    return NextResponse.json({
      isDemoFallback: false,
      uploadUrl: presignedUrl,
      fileKey: key,
      publicUrl,
    });
  } catch (error) {
    console.error("Error generating presigned S3 URL:", error);
    return NextResponse.json(
      { error: "Error al generar URL presignada de S3" },
      { status: 500 }
    );
  }
}
