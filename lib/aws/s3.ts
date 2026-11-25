import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "us-east-1";

const s3Config: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region,
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

export const s3Client = new S3Client(s3Config);

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "aurea-eventos-media-gt";

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

/**
 * Genera una URL firmada de S3 (PUT) para la subida directa de fotos desde el navegador o móvil.
 * La ruta es `events/${eventId}/photos/${Date.now()}-${fileName}`, compatible con la Bucket Policy pública de lectura.
 */
export async function createPresignedUploadUrl(
  eventId: string,
  fileName: string,
  contentType: string = "image/jpeg"
): Promise<PresignedUploadResult> {
  // Limpiar nombre de archivo de caracteres especiales
  const sanitizedFileName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_");

  const timestamp = Date.now();
  const fileKey = `events/${eventId}/photos/${timestamp}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  // URL firmada válida por 1 hora (3600 segundos)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  // URL pública para visualización
  const publicDomain = process.env.S3_PUBLIC_DOMAIN;
  const publicUrl = publicDomain
    ? `https://${publicDomain}/${fileKey}`
    : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${fileKey}`;

  return {
    uploadUrl,
    fileKey,
    publicUrl,
  };
}
