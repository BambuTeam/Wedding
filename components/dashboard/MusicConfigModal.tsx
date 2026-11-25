"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Music,
  VolumeX,
  Sparkles,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Play,
  Square,
  Loader2,
  Info,
  AlertTriangle,
  Disc3,
} from "lucide-react";
import { EventMusicConfig, MusicProvider, AureaAmbientPreset } from "@/lib/types";
import { parseMusicUrl, AUREA_AMBIENT_PRESETS, MusicTrackMetadata } from "@/lib/musicUtils";

interface MusicConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  currentConfig?: EventMusicConfig;
  onSaved: (newConfig: EventMusicConfig) => void;
}

export function MusicConfigModal({
  isOpen,
  onClose,
  eventId,
  currentConfig,
  onSaved,
}: MusicConfigModalProps) {
  const [provider, setProvider] = useState<MusicProvider>(
    currentConfig?.provider || "aurea_ambient"
  );
  const [preset, setPreset] = useState<AureaAmbientPreset>(
    currentConfig?.preset || "strings"
  );
  const [rawUrl, setRawUrl] = useState<string>(currentConfig?.url || "");
  const [songTitle, setSongTitle] = useState<string>(
    currentConfig?.songTitle || ""
  );
  const [artist, setArtist] = useState<string>(currentConfig?.artist || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // oEmbed Autodetection State
  const [metadata, setMetadata] = useState<MusicTrackMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Copyright Restriction Detection (Error 101, 150, 153)
  const [hasCopyrightBlock, setHasCopyrightBlock] = useState(false);
  const previewYtPlayerRef = useRef<any>(null);

  // Audio preview para presets sintetizados
  const [previewingPreset, setPreviewingPreset] = useState<AureaAmbientPreset | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setProvider(currentConfig?.provider || "aurea_ambient");
      setPreset(currentConfig?.preset || "strings");
      const initialUrl = currentConfig?.url || (currentConfig?.trackId ? `https://youtu.be/${currentConfig.trackId}` : "");
      setRawUrl(initialUrl);
      setSongTitle(currentConfig?.songTitle || "");
      setArtist(currentConfig?.artist || "");
      setErrorMsg(null);
      setSuccessMsg(null);
      setHasCopyrightBlock(false);

      if (currentConfig?.songTitle && currentConfig?.trackId && currentConfig.provider !== "aurea_ambient" && currentConfig.provider !== "none") {
        setMetadata({
          provider: currentConfig.provider,
          trackId: currentConfig.trackId,
          url: initialUrl,
          title: currentConfig.songTitle,
          author: currentConfig.artist || "",
        });
      } else {
        setMetadata(null);
      }
    }
    return () => {
      stopPreview();
      destroyYtPreviewPlayer();
    };
  }, [isOpen, currentConfig]);

  const parsedUrlResult = parseMusicUrl(rawUrl);

  const stopPreview = () => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setPreviewingPreset(null);
  };

  const destroyYtPreviewPlayer = () => {
    if (previewYtPlayerRef.current) {
      try {
        previewYtPlayerRef.current.destroy();
      } catch {}
      previewYtPlayerRef.current = null;
    }
  };

  // 1. Consultar endpoint oficial oEmbed (/api/music/metadata) al cambiar la URL
  useEffect(() => {
    if (!rawUrl.trim()) {
      setMetadata(null);
      setIsLoadingMetadata(false);
      setMetadataError(null);
      setHasCopyrightBlock(false);
      destroyYtPreviewPlayer();
      return;
    }

    const parsed = parseMusicUrl(rawUrl);
    if (!parsed.valid || (parsed.provider !== "youtube" && parsed.provider !== "spotify")) {
      setMetadata(null);
      setIsLoadingMetadata(false);
      setHasCopyrightBlock(false);
      destroyYtPreviewPlayer();
      return;
    }

    let isCurrent = true;
    setIsLoadingMetadata(true);
    setMetadataError(null);
    setHasCopyrightBlock(false);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/music/metadata?url=${encodeURIComponent(rawUrl.trim())}`);
        const data = await res.json();
        if (!isCurrent) return;

        if (!res.ok) {
          setMetadataError(data.error || "No fue posible detectar metadatos automáticamente.");
        } else {
          setMetadata(data);
          setSongTitle(data.title || "");
          setArtist(data.author || "");
        }
      } catch {
        if (!isCurrent) return;
        setMetadataError("Error al conectar con el servicio oEmbed.");
      } finally {
        if (isCurrent) setIsLoadingMetadata(false);
      }
    }, 400);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [rawUrl]);

  // 2. Montar YouTube IFrame API en la vista previa para auditar errores de copyright (101 / 150 / 153)
  useEffect(() => {
    if (provider !== "youtube" || !parsedUrlResult.valid || !parsedUrlResult.trackId) {
      setHasCopyrightBlock(false);
      destroyYtPreviewPlayer();
      return;
    }

    setHasCopyrightBlock(false);

    if (typeof window === "undefined") return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let isCancelled = false;

    const initPreviewPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        if (!isCancelled) setTimeout(initPreviewPlayer, 200);
        return;
      }

      destroyYtPreviewPlayer();

      const container = document.getElementById("modal-yt-preview-player");
      if (!container) return;

      try {
        previewYtPlayerRef.current = new window.YT.Player("modal-yt-preview-player", {
          videoId: parsedUrlResult.trackId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onError: (event: any) => {
              console.warn("[YouTube Preview Error]:", event.data);
              // Códigos de restricción:
              // 101, 150, 153: Restricción por copyright para reproducirse en embebidos
              // 100: Video no encontrado o eliminado
              // 2: Parámetro de video inválido
              if (
                event.data === 101 ||
                event.data === 150 ||
                event.data === 153 ||
                event.data === 100 ||
                event.data === 2
              ) {
                setHasCopyrightBlock(true);
              }
            },
          },
        });
      } catch (err) {
        console.error("Error montando reproductor de preview YouTube:", err);
      }
    };

    const delayTimer = setTimeout(initPreviewPlayer, 300);

    return () => {
      isCancelled = true;
      clearTimeout(delayTimer);
      destroyYtPreviewPlayer();
    };
  }, [provider, parsedUrlResult.trackId]);

  const playPresetPreview = (targetPreset: AureaAmbientPreset) => {
    stopPreview();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      setPreviewingPreset(targetPreset);

      const chordMap: Record<AureaAmbientPreset, number[]> = {
        piano: [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
        strings: [293.66, 369.99, 440.0, 554.37, 659.25], // Dmaj9
        acoustic: [329.63, 415.3, 493.88, 587.33, 659.25], // Emaj7
      };

      const notes = chordMap[targetPreset] || chordMap.piano;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = targetPreset === "strings" ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(targetPreset === "strings" ? 650 : 850, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + idx * 0.12 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 3.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 3.2);
      });

      setTimeout(() => {
        setPreviewingPreset(null);
      }, 3300);
    } catch {
      setPreviewingPreset(null);
    }
  };

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (hasCopyrightBlock) {
      setErrorMsg("No es posible guardar un video bloqueado por la disquera. Elige una versión alternativa.");
      return;
    }

    let configToSave: EventMusicConfig = {
      provider,
    };

    if (provider === "youtube" || provider === "spotify") {
      const parsed = parseMusicUrl(rawUrl);
      if (!parsed.valid || !parsed.trackId) {
        setErrorMsg(parsed.error || "Debes ingresar un enlace válido de YouTube o Spotify.");
        return;
      }

      configToSave = {
        provider: parsed.provider,
        trackId: parsed.trackId,
        url: rawUrl.trim(),
        songTitle: songTitle || metadata?.title || (parsed.provider === "youtube" ? "Video de YouTube" : "Pista de Spotify"),
        artist: artist || metadata?.author || "",
      };
    } else if (provider === "aurea_ambient") {
      const presetData = AUREA_AMBIENT_PRESETS.find((p) => p.id === preset);
      configToSave = {
        provider: "aurea_ambient",
        preset,
        songTitle: presetData?.name || "Melodía Instrumental",
        artist: "Áurea Sound Ensemble",
      };
    } else {
      configToSave = {
        provider: "none",
        songTitle: "Sin música",
      };
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicConfig: configToSave }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la banda sonora");
      }

      setSuccessMsg("¡Banda sonora actualizada correctamente!");
      onSaved(configToSave);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const isFormValid =
    provider === "none" ||
    provider === "aurea_ambient" ||
    (parsedUrlResult.valid && !hasCopyrightBlock && !isLoadingMetadata && Boolean(metadata || songTitle));

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F7F4EE] border border-[#E5DAC6] flex items-center justify-center text-[#99732B]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 leading-tight">
                Banda Sonora de la Invitación
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Música que se reproduce al abrir el sobre con física táctil.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopPreview();
              destroyYtPreviewPlayer();
              onClose();
            }}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Policy Compliance Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Cumplimiento de Términos de Servicio:</strong> La música se reproduce mediante las APIs oficiales y reproductores embebidos de <strong>YouTube</strong> y <strong>Spotify</strong>, o con sintetizadores procedurales libres de derechos. No alojamos archivos MP3 protegidos con copyright en nuestros servidores.
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Sin música */}
            <button
              type="button"
              onClick={() => {
                stopPreview();
                destroyYtPreviewPlayer();
                setProvider("none");
              }}
              className={`p-4 rounded-2xl border text-left transition-all min-h-[44px] cursor-pointer flex flex-col justify-between ${
                provider === "none"
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                  : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70 text-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <VolumeX className="w-5 h-5" />
                {provider === "none" && <CheckCircle2 className="w-4 h-4 text-[#DFC07D]" />}
              </div>
              <div className="mt-3">
                <span className="font-bold text-sm block">Sin música</span>
                <span className={`text-[11px] block mt-0.5 ${provider === "none" ? "text-zinc-300" : "text-zinc-500"}`}>
                  Apertura en silencio sereno
                </span>
              </div>
            </button>

            {/* 2. Melodía Instrumental Áurea */}
            <button
              type="button"
              onClick={() => {
                destroyYtPreviewPlayer();
                setProvider("aurea_ambient");
              }}
              className={`p-4 rounded-2xl border text-left transition-all min-h-[44px] cursor-pointer flex flex-col justify-between ${
                provider === "aurea_ambient"
                  ? "border-[#99732B] bg-[#99732B] text-white shadow-md"
                  : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70 text-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <Sparkles className="w-5 h-5" />
                {provider === "aurea_ambient" && <CheckCircle2 className="w-4 h-4 text-amber-200" />}
              </div>
              <div className="mt-3">
                <span className="font-bold text-sm block">Melodía Áurea</span>
                <span className={`text-[11px] block mt-0.5 ${provider === "aurea_ambient" ? "text-amber-100" : "text-zinc-500"}`}>
                  3 ambientes libres de derechos
                </span>
              </div>
            </button>

            {/* 3. YouTube o Spotify */}
            <button
              type="button"
              onClick={() => {
                stopPreview();
                const parsed = parseMusicUrl(rawUrl);
                setProvider(parsed.valid && parsed.provider !== "none" ? parsed.provider : "youtube");
              }}
              className={`p-4 rounded-2xl border text-left transition-all min-h-[44px] cursor-pointer flex flex-col justify-between ${
                provider === "youtube" || provider === "spotify"
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-md"
                  : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70 text-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <Radio className="w-5 h-5" />
                {(provider === "youtube" || provider === "spotify") && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                )}
              </div>
              <div className="mt-3">
                <span className="font-bold text-sm block">YouTube o Spotify</span>
                <span className={`text-[11px] block mt-0.5 ${provider === "youtube" || provider === "spotify" ? "text-emerald-100" : "text-zinc-500"}`}>
                  Autodetección vía oEmbed
                </span>
              </div>
            </button>
          </div>

          {/* Configuration Detail Depending on Provider */}
          {provider === "aurea_ambient" && (
            <div className="space-y-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A5B1F]">
                  Selecciona la Melodía Instrumental
                </span>
                <span className="text-[11px] text-zinc-500">
                  Web Audio API procedural (Sin carga de red)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AUREA_AMBIENT_PRESETS.map((p) => {
                  const isSelected = preset === p.id;
                  const isPlayingThis = previewingPreset === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setPreset(p.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-white border-[#99732B] shadow-sm ring-1 ring-[#99732B]"
                          : "bg-white/60 border-zinc-200 hover:bg-white text-zinc-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{p.icon}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isPlayingThis) {
                                stopPreview();
                              } else {
                                playPresetPreview(p.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors min-h-[36px] ${
                              isPlayingThis
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            }`}
                            title="Escuchar muestra"
                          >
                            {isPlayingThis ? (
                              <>
                                <Square className="w-3 h-3 fill-current" />
                                <span>Parar</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>Muestra</span>
                              </>
                            )}
                          </button>
                        </div>

                        <span className="font-bold text-sm text-zinc-900 block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-[#8C6D46] block font-medium">
                          {p.subtitle}
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-2 leading-tight">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                        <span className={isSelected ? "font-bold text-[#99732B]" : "text-zinc-400"}>
                          {isSelected ? "Seleccionado" : "Elegir"}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#99732B]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(provider === "youtube" || provider === "spotify") && (
            <div className="space-y-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Enlace de YouTube o Spotify
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={rawUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRawUrl(val);
                      const parsed = parseMusicUrl(val);
                      if (parsed.valid && (parsed.provider === "youtube" || parsed.provider === "spotify")) {
                        setProvider(parsed.provider);
                      }
                    }}
                    placeholder="Pega aquí el enlace: https://youtu.be/... o https://open.spotify.com/track/..."
                    className="w-full px-4 py-2.5 min-h-[44px] text-xs font-mono rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                {/* Parsing Status Pill */}
                {rawUrl.trim() && !parsedUrlResult.valid && (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{parsedUrlResult.error}</span>
                  </div>
                )}
              </div>

              {/* Loader during oEmbed call */}
              {isLoadingMetadata && (
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex items-center gap-3 text-xs text-zinc-600 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-[#99732B]" />
                  <span>Consultando metadatos oficiales vía oEmbed en tiempo real...</span>
                </div>
              )}

              {/* Detected Metadata Card (Read-Only) */}
              {metadata && !isLoadingMetadata && (
                <div className="p-4 rounded-2xl bg-white border border-[#DFC07D]/50 shadow-sm flex items-start gap-4 transition-all">
                  {metadata.thumbnailUrl ? (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-200 shadow-sm">
                      <img
                        src={metadata.thumbnailUrl}
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F7F4EE] border border-[#DFC07D]/40 flex items-center justify-center shrink-0 text-[#99732B]">
                      <Disc3 className="w-8 h-8 animate-spin" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          metadata.provider === "youtube"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {metadata.provider === "youtube" ? "YouTube Oficial" : "Spotify Oficial"}
                      </span>
                      <span className="text-[10px] text-zinc-400">Autodetectado</span>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 truncate" title={metadata.title}>
                      {metadata.title}
                    </h4>

                    <p className="text-xs text-zinc-600 truncate" title={metadata.author}>
                      {metadata.author || (metadata.provider === "youtube" ? "Canal Oficial" : "Artista")}
                    </p>
                  </div>
                </div>
              )}

              {/* Copyright Block Alert (Error 101 / 150 / 153) */}
              {hasCopyrightBlock && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3 text-rose-900 animate-in fade-in duration-200">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="block text-rose-950 font-bold">
                      Video Restringido por Disquera (Error 101/150)
                    </strong>
                    <p className="leading-relaxed text-rose-800">
                      Este video oficial está restringido por la disquera para reproducirse en sitios externos. Prueba pegar la versión &ldquo;Lyrics&rdquo; o &ldquo;Piano/Instrumental&rdquo; de esa misma canción en YouTube, o usa su enlace de Spotify.
                    </p>
                  </div>
                </div>
              )}

              {/* YouTube IFrame Live Preview / Tester */}
              {provider === "youtube" && parsedUrlResult.valid && parsedUrlResult.trackId && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Comprobación de Reproducción en Vivo
                    </span>
                    {hasCopyrightBlock ? (
                      <span className="text-[10px] font-bold text-rose-600 uppercase">
                        Bloqueado para incrustación
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-700">
                        Listo para reproducir
                      </span>
                    )}
                  </div>

                  <div className={`rounded-xl overflow-hidden border p-1 bg-black/90 ${
                    hasCopyrightBlock ? "border-rose-400 ring-2 ring-rose-300" : "border-zinc-300"
                  }`}>
                    <div className="relative w-full aspect-video min-h-[190px] rounded-lg overflow-hidden">
                      <div id="modal-yt-preview-player" className="w-full h-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Spotify Embed Preview */}
              {provider === "spotify" && parsedUrlResult.valid && parsedUrlResult.previewEmbedUrl && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                    Vista previa de marco oficial de Spotify
                  </span>
                  <div className="rounded-xl overflow-hidden border border-zinc-200 bg-black/5 p-1">
                    <iframe
                      src={parsedUrlResult.previewEmbedUrl}
                      className="w-full rounded-lg border-0"
                      height={parsedUrlResult.trackId?.startsWith("playlist") ? 352 : 152}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              stopPreview();
              destroyYtPreviewPlayer();
              onClose();
            }}
            disabled={isSaving}
            className="px-4 py-2 min-h-[44px] rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isFormValid}
            className="px-6 py-2 min-h-[44px] rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#DFC07D]" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4 text-[#DFC07D]" />
                <span>Guardar Banda Sonora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
