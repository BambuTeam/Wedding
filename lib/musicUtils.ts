import { MusicProvider, EventMusicConfig, AureaAmbientPreset } from "./types";

export interface ParsedMusicResult {
  valid: boolean;
  provider: MusicProvider;
  trackId?: string;
  error?: string;
  previewEmbedUrl?: string;
}

export interface MusicTrackMetadata {
  provider: MusicProvider;
  trackId: string;
  url: string;
  title: string;
  author: string;
  thumbnailUrl?: string;
}

/**
 * Valida y extrae el identificador oficial de YouTube o Spotify desde una URL
 * Cumpliendo con los Términos de Servicio oficiales.
 */
export function parseMusicUrl(rawUrl: string): ParsedMusicResult {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return {
      valid: true,
      provider: "none",
    };
  }

  // 1. YouTube Regex: acepta youtube.com/watch?v=..., youtu.be/..., embed, shorts, etc.
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(ytRegex);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      valid: true,
      provider: "youtube",
      trackId: videoId,
      previewEmbedUrl: `https://www.youtube.com/embed/${videoId}`,
    };
  }

  // 2. Spotify Regex: acepta open.spotify.com/[intl-*/]track|playlist|album/... y spotify:track:...
  const spotifyRegex = /open\.spotify\.com\/(?:[a-zA-Z-]+\/)?(track|playlist|album)\/([a-zA-Z0-9]+)/i;
  const spotifyUriRegex = /spotify:(track|playlist|album):([a-zA-Z0-9]+)/i;

  const spMatch = trimmed.match(spotifyRegex) || trimmed.match(spotifyUriRegex);
  if (spMatch && spMatch[1] && spMatch[2]) {
    const type = spMatch[1].toLowerCase();
    const id = spMatch[2];
    const path = `${type}/${id}`;
    return {
      valid: true,
      provider: "spotify",
      trackId: path,
      previewEmbedUrl: `https://open.spotify.com/embed/${path}?utm_source=generator&theme=0`,
    };
  }

  return {
    valid: false,
    provider: "none",
    error: "Ingresa un enlace válido de YouTube (ej. https://youtu.be/...) o Spotify (ej. https://open.spotify.com/track/...)",
  };
}

/**
 * Presets de audio instrumental ambiental de Áurea sintetizados por Web Audio API
 */
export const AUREA_AMBIENT_PRESETS: {
  id: AureaAmbientPreset;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "piano",
    name: "Piano Clásico",
    subtitle: "Acordes Mayores & Arpegios Cálidos",
    description: "Progresión lírica en Cmaj9 con resonancia de salón, ideal para entradas solemnes y elegantes.",
    icon: "🎹",
  },
  {
    id: "strings",
    name: "Cuerdas Románticas",
    subtitle: "Sinfónico & Envolvente",
    description: "Armonías sedosas en Dmaj9 con filtro cálido y sustain prolongado que evoca orquesta de cámara.",
    icon: "🎻",
  },
  {
    id: "acoustic",
    name: "Acústico Sereno",
    subtitle: "Cálido & Pastoral",
    description: "Apegiado suave en Emaj7 con ataque rápido y decaimiento natural, perfecto para celebraciones campestres.",
    icon: "🎸",
  },
];
