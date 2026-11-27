import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAwsConfig } from "./clients";

/**
 * Retorna una instancia fresca de S3Client configurada con las credenciales activas
 * compatibles con AWS Amplify SSR, Vercel y Local Dev.
 */
export function getFreshS3Client(): S3Client {
  const { region, credentials } = getAwsConfig();
  return new S3Client({
    region,
    ...(credentials ? { credentials } : {}),
  });
}

// Proxy transparente para que cualquier exportacion existente de s3Client resuelva credenciales dinámicamente
export const s3Client = new Proxy({} as S3Client, {
  get(_, prop) {
    const target = getFreshS3Client() as any;
    const val = target[prop];
    return typeof val === "function" ? val.bind(target) : val;
  },
});

export const BUCKET_NAME =
  process.env.AUREA_S3_BUCKET ||
  process.env.S3_BUCKET_NAME ||
  process.env.AWS_S3_BUCKET ||
  "aurea-eventos-media-gt";

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

/**
 * Genera una URL firmada de lectura válida (GetObject) para visualizar imágenes desde un bucket privado de S3.
 * Duración por defecto: 7 días (604,800 segundos, máximo permitido por SigV4).
 */
export async function getSignedPhotoUrl(fileKey: string, expiresInSeconds: number = 604800): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  } catch (error) {
    console.error("[getSignedPhotoUrl] Error generating signed URL for key:", fileKey, error);
    const { region } = getAwsConfig();
    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${fileKey}`;
  }
}

/**
 * Sube un buffer de imagen directamente a S3 en el servidor (evita CORS y fallos en móviles).
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  fileKey: string,
  contentType: string = "image/jpeg"
): Promise<{ s3Key: string; readUrl: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    const readUrl = await getSignedPhotoUrl(fileKey);

    return {
      s3Key: fileKey,
      readUrl,
    };
  } catch (err: any) {
    console.warn("[uploadBufferToS3] S3 upload error, generating base64/fallback data URL:", err?.message);
    const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
    return {
      s3Key: fileKey,
      readUrl: dataUrl,
    };
  }
}

/**
 * Genera una URL firmada de S3 (PUT) para la subida directa de fotos desde el navegador o móvil.
 * La ruta es `events/${eventId}/photos/${Date.now()}-${fileName}`.
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

  // URL de lectura firmada
  const publicUrl = await getSignedPhotoUrl(fileKey);

  return {
    uploadUrl,
    fileKey,
    publicUrl,
  };
}
