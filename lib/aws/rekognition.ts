import { RekognitionClient, DetectModerationLabelsCommand } from "@aws-sdk/client-rekognition";
import { getAwsConfig } from "./clients";

export function getFreshRekognitionClient(): RekognitionClient | null {
  try {
    const { region, credentials } = getAwsConfig();
    return new RekognitionClient({
      region,
      ...(credentials ? { credentials } : {}),
    });
  } catch (err) {
    console.warn("[Rekognition] Client creation failed:", err);
    return null;
  }
}

// Categorías bloqueadas automáticamente por normas del evento (Umbral estricto 55%)
const BLOCKED_CATEGORIES = new Set([
  "Explicit",
  "Explicit Nudity",
  "Non-Consensual Explicit Content",
  "Suggestive",
  "Revealing Clothes",
  "Female Swimwear or Underwear",
  "Male Swimwear or Underwear",
  "Partial Nudity",
  "Violence",
  "Visually Disturbing",
  "Rude Gestures",
  "Drugs & Tobacco",
  "Drugs",
  "Tobacco",
  "Alcohol",
  "Hate Symbols",
  "Nudity",
]);

export interface ModerationResult {
  isSafe: boolean;
  blockedReason?: string;
  labels?: string[];
  serviceUnavailable?: boolean;
}

/**
 * Analiza un buffer de imagen con AWS Rekognition DetectModerationLabelsCommand.
 * Regla Fail-Closed: Si el servicio no está disponible o falla, rechaza la imagen (HTTP 503).
 * Umbral estricto: MinConfidence: 55.
 */
export async function moderateImageBuffer(imageBuffer: Buffer): Promise<ModerationResult> {
  const rekognition = getFreshRekognitionClient();
  if (!rekognition) {
    console.error("[moderateImageBuffer] Rekognition client unavailable - Fail-Closed enforced.");
    return {
      isSafe: false,
      serviceUnavailable: true,
      blockedReason: "El filtro de seguridad de imágenes no está disponible en este momento. Intenta de nuevo en unos segundos.",
    };
  }

  try {
    const command = new DetectModerationLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MinConfidence: 55,
    });

    const response = await rekognition.send(command);
    const moderationLabels = response.ModerationLabels || [];

    if (moderationLabels.length === 0) {
      return { isSafe: true };
    }

    const detectedCategories: string[] = [];
    let isViolating = false;

    for (const label of moderationLabels) {
      const name = label.Name || "";
      const parentName = label.ParentName || "";

      detectedCategories.push(name);

      if (BLOCKED_CATEGORIES.has(name) || BLOCKED_CATEGORIES.has(parentName)) {
        isViolating = true;
      }
    }

    if (isViolating) {
      return {
        isSafe: false,
        blockedReason: `Contenido no permitido detectado: ${detectedCategories.join(", ")}`,
        labels: detectedCategories,
      };
    }

    return {
      isSafe: true,
      labels: detectedCategories,
    };
  } catch (error: any) {
    // FAIL-CLOSED: No permitir subida sin comprobación de seguridad garantizada
    console.error("[moderateImageBuffer] Rekognition check failed (Fail-Closed enforced):", error?.message);
    return {
      isSafe: false,
      serviceUnavailable: true,
      blockedReason: "El filtro de seguridad de imágenes no está disponible en este momento. Intenta de nuevo en unos segundos.",
    };
  }
}
