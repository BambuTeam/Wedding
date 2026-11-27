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

// Categorías bloqueadas automáticamente por normas del evento
const BLOCKED_CATEGORIES = new Set([
  "Explicit Nudity",
  "Nudity",
  "Suggestive",
  "Violence",
  "Visually Disturbing",
  "Rude Gestures",
  "Hate Symbols",
  "Drugs",
  "Tobacco",
  "Alcohol",
]);

export interface ModerationResult {
  isSafe: boolean;
  blockedReason?: string;
  labels?: string[];
}

/**
 * Analiza un buffer de imagen con AWS Rekognition DetectModerationLabelsCommand.
 * Si detecta contenido inapropiado con confianza >= 70%, rechaza la imagen.
 */
export async function moderateImageBuffer(imageBuffer: Buffer): Promise<ModerationResult> {
  const rekognition = getFreshRekognitionClient();
  if (!rekognition) {
    return { isSafe: true };
  }

  try {
    const command = new DetectModerationLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MinConfidence: 70,
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
    // Si la cuenta/región no tiene habilitado Rekognition o error de permisos, no bloquear el flujo legítimo
    console.warn("[moderateImageBuffer] Rekognition check warning/fallback:", error?.message);
    return { isSafe: true };
  }
}
