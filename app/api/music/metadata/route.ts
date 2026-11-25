import { NextRequest, NextResponse } from "next/server";
import { parseMusicUrl } from "@/lib/musicUtils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'url'." },
        { status: 400 }
      );
    }

    const parsed = parseMusicUrl(rawUrl);
    if (!parsed.valid || parsed.provider === "none" || !parsed.trackId) {
      return NextResponse.json(
        { error: parsed.error || "URL no válida para YouTube o Spotify." },
        { status: 400 }
      );
    }

    // 1. YouTube oEmbed oficial (sin API keys)
    if (parsed.provider === "youtube") {
      const canonicalYtUrl = `https://www.youtube.com/watch?v=${parsed.trackId}`;
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalYtUrl)}&format=json`;

      try {
        const res = await fetch(oembedUrl, {
          headers: { "User-Agent": "AureaEventos/1.0" },
          next: { revalidate: 3600 },
        });

        if (!res.ok) {
          // Fallback limpio si oEmbed no responde
          return NextResponse.json({
            provider: "youtube",
            trackId: parsed.trackId,
            url: canonicalYtUrl,
            title: "Video de YouTube",
            author: "YouTube",
            thumbnailUrl: `https://img.youtube.com/vi/${parsed.trackId}/hqdefault.jpg`,
          });
        }

        const data = await res.json();
        return NextResponse.json({
          provider: "youtube",
          trackId: parsed.trackId,
          url: canonicalYtUrl,
          title: data.title || "Video de YouTube",
          author: data.author_name || "Canal de YouTube",
          thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${parsed.trackId}/hqdefault.jpg`,
        });
      } catch (err) {
        return NextResponse.json({
          provider: "youtube",
          trackId: parsed.trackId,
          url: canonicalYtUrl,
          title: "Video de YouTube",
          author: "YouTube",
          thumbnailUrl: `https://img.youtube.com/vi/${parsed.trackId}/hqdefault.jpg`,
        });
      }
    }

    // 2. Spotify oEmbed oficial (sin API keys)
    if (parsed.provider === "spotify") {
      const canonicalSpotifyUrl = `https://open.spotify.com/${parsed.trackId}`;
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(canonicalSpotifyUrl)}`;

      try {
        const res = await fetch(oembedUrl, {
          headers: { "User-Agent": "AureaEventos/1.0" },
          next: { revalidate: 3600 },
        });

        if (!res.ok) {
          return NextResponse.json({
            provider: "spotify",
            trackId: parsed.trackId,
            url: canonicalSpotifyUrl,
            title: "Pista en Spotify",
            author: "Spotify",
            thumbnailUrl: "",
          });
        }

        const data = await res.json();
        return NextResponse.json({
          provider: "spotify",
          trackId: parsed.trackId,
          url: canonicalSpotifyUrl,
          title: data.title || "Pista en Spotify",
          author: data.author_name || "Artista en Spotify",
          thumbnailUrl: data.thumbnail_url || "",
        });
      } catch (err) {
        return NextResponse.json({
          provider: "spotify",
          trackId: parsed.trackId,
          url: canonicalSpotifyUrl,
          title: "Pista en Spotify",
          author: "Spotify",
          thumbnailUrl: "",
        });
      }
    }

    return NextResponse.json({ error: "Proveedor no soportado" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en /api/music/metadata:", error);
    return NextResponse.json(
      { error: error?.message || "Error al consultar metadatos." },
      { status: 500 }
    );
  }
}
