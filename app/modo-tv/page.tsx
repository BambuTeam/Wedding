"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Camera,
  Heart,
  Maximize2,
  Minimize2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { LivePhoto, Guest, EventDashboardStats, EventMeta, EditorialPhoto } from "@/lib/types";

interface CombinedMediaItem {
  id: string;
  url: string;
  author: string;
  caption?: string;
  type: "live" | "editorial";
  timestamp?: string;
}

function ModoTvContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "camila-andres-2025";

  const [eventMeta, setEventMeta] = useState<EventMeta | null>(null);
  const [mediaItems, setMediaItems] = useState<CombinedMediaItem[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<Guest[]>([]);
  const [stats, setStats] = useState<EventDashboardStats | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const syncData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [photosRes, syncRes, metaRes] = await Promise.all([
        fetch(`/api/public/events/${eventId}/photos`, { cache: "no-store" }),
        fetch(`/api/events/${eventId}/sync`, { cache: "no-store" }),
        fetch(`/api/events/${eventId}`, { cache: "no-store" }),
      ]);

      let livePhotos: LivePhoto[] = [];
      let editorialPhotos: EditorialPhoto[] = [];

      if (photosRes.ok) {
        const photoData = await photosRes.json();
        if (photoData.photos && Array.isArray(photoData.photos)) {
          livePhotos = photoData.photos;
        }
      }

      if (syncRes.ok) {
        const data = await syncRes.json();
        if (data.recentCheckIns) setRecentCheckIns(data.recentCheckIns);
        if (data.stats) setStats(data.stats);
      }

      if (metaRes.ok) {
        const metaData = await metaRes.json();
        if (metaData.event) {
          setEventMeta(metaData.event);
          if (Array.isArray(metaData.event.editorialPhotos)) {
            editorialPhotos = metaData.event.editorialPhotos;
          }
        }
      }

      // Fusión de fotos: Fotos en vivo de invitados + Galería de sesión editorial del anfitrión
      const combined: CombinedMediaItem[] = [];

      // 1. Fotos en vivo de invitados (prioridad reciente)
      livePhotos.forEach((lp) => {
        combined.push({
          id: lp.photoId,
          url: lp.url,
          author: lp.author || "Invitado",
          caption: lp.message || "",
          type: "live",
          timestamp: lp.timestamp,
        });
      });

      // 2. Fotos de sesión editorial del anfitrión
      editorialPhotos.forEach((ep) => {
        combined.push({
          id: ep.id,
          url: ep.url,
          author: "Sesión de los Anfitriones",
          caption: ep.caption || "",
          type: "editorial",
        });
      });

      if (combined.length > 0) {
        setMediaItems(combined);
      }

      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (e) {
      console.error("Modo TV sync error:", e);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, [eventId]);

  // Polling automático cada 6 segundos para actualización inmediata
  useEffect(() => {
    syncData();
    const interval = setInterval(() => syncData(false), 6000);
    return () => clearInterval(interval);
  }, [syncData]);

  // Rotación suave con efecto cinematográfico cada 6 segundos
  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % mediaItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [mediaItems]);

  // Reloj local continuo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const activeMedia = mediaItems[currentIdx] || null;

  // URL exacta apuntando al portal express móvil de cámara directa
  const albumQrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/subir/${(eventMeta as any)?.slug || eventId}`
    : "";

  return (
    <div className="fixed inset-0 z-50 bg-[#12110F] text-white flex flex-col justify-between overflow-hidden p-6 sm:p-10 select-none font-sans">
      {/* Top Ambient Bar con padding derecho seguro */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 z-20 pr-2 sm:pr-4">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 fill-[#C5A059] text-[#C5A059] animate-pulse shrink-0" />
          <div>
            <span className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#DFC07D] uppercase">
              {eventMeta?.venueName ? `${eventMeta.venueName} • ${eventMeta.venueCity || "Guatemala"}` : "Convento de las Capuchinas • Antigua Guatemala"}
            </span>
            <h1 className="font-serif italic text-3xl sm:text-5xl text-white font-normal leading-none mt-0.5">
              {eventMeta?.title || (
                <>Camila <span className="text-[#DFC07D] font-light">&amp;</span> Andrés</>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 pr-2 sm:pr-4 shrink-0">
          {/* Botón manual de actualización inmediata */}
          <button
            onClick={() => syncData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
            title="Actualizar galería ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#DFC07D] ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar Galería</span>
          </button>

          <div className="text-right">
            <span className="text-2xl sm:text-4xl font-sans font-bold text-[#DFC07D]">
              {currentTime}
            </span>
            <span className="text-[10px] text-zinc-400 font-sans block tracking-wider uppercase">
              Hora local
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center Stage: Carrusel Cinematográfico con Ken Burns + Panel QR Seguro */}
      <div className="flex-1 my-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center z-10 overflow-hidden pr-2 sm:pr-4">
        {/* Left: Slideshow Hero Cinematográfico (2 Columnas) */}
        <div className="lg:col-span-2 relative h-[55vh] lg:h-[65vh] rounded-3xl overflow-hidden bg-[#1E1C1A] border border-[#C5A059]/40 shadow-2xl flex items-center justify-center">
          {activeMedia ? (
            <div key={activeMedia.id || currentIdx} className="relative w-full h-full overflow-hidden">
              <img
                src={activeMedia.url}
                alt={activeMedia.author}
                className="w-full h-full object-cover transform scale-100 animate-[kenburns_16s_ease-out_infinite_alternate]"
                style={{
                  animation: "kenBurnsZoom 8s ease-out forwards",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059] text-zinc-950 font-bold text-xs shadow-md mb-2 font-sans">
                  {activeMedia.type === "live" ? (
                    <Camera className="w-3.5 h-3.5" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {activeMedia.type === "live" ? "Recuerdo en Vivo" : "Sesión Editorial"} #{currentIdx + 1} de {mediaItems.length}
                  </span>
                </span>
                <p className="font-serif italic text-2xl sm:text-4xl text-white font-normal leading-tight">
                  {activeMedia.author}
                </p>
                {activeMedia.caption && (
                  <p className="text-[13px] sm:text-base text-zinc-200 mt-1 max-w-xl font-sans leading-relaxed">
                    &ldquo;{activeMedia.caption}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#DFC07D]">
                <Camera className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="font-serif italic text-3xl sm:text-4xl text-white font-normal">
                Esperando los primeros recuerdos...
              </h3>
              <p className="text-zinc-400 max-w-md mx-auto text-sm">
                Apunta tu teléfono al código QR de la derecha y comparte una fotografía desde tu mesa para verla proyectada aquí al instante.
              </p>
            </div>
          )}
        </div>

        {/* Right: Panel QR Seguro con padding holgado para evitar corte en el borde */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-white/5 border border-[#C5A059]/30 backdrop-blur-md shadow-2xl text-center space-y-3 mr-1 sm:mr-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFC07D]/15 text-[#DFC07D] text-xs font-semibold uppercase tracking-widest border border-[#DFC07D]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Participa en Vivo</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
            Sube tus fotos a esta pantalla
          </h3>

          <div className="p-4 rounded-2xl bg-white text-zinc-900 shadow-2xl border-4 border-[#C5A059] my-2">
            <QRCodeSVG value={albumQrUrl} size={180} level="M" />
          </div>

          <p className="text-[13px] text-zinc-300 max-w-xs font-sans leading-relaxed">
            Escanea con la cámara de tu teléfono para subir tus momentos sin descargar nada.
          </p>
        </div>
      </div>

      {/* Bottom Live Ticker con invitados que acaban de ingresar */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs z-20 pr-2 sm:pr-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-semibold shrink-0">
            <Heart className="w-3.5 h-3.5 fill-emerald-400" />
            <span>LLEGANDO AHORA:</span>
          </div>

          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar text-zinc-300 font-sans text-[13px]">
            {recentCheckIns.length === 0 ? (
              <span className="text-zinc-400">
                Dando la bienvenida a las familias en la entrada...
              </span>
            ) : (
              recentCheckIns.map((g) => (
                <span
                  key={g.guestToken}
                  className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-[13px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-white">{g.familyName}</strong> ({g.confirmedSeats || g.maxSeats} personas)
                  {g.tableId && <span className="text-[#DFC07D] text-xs">· Mesa Asignada</span>}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Contador de estado & auto-refresh */}
        <div className="hidden sm:flex items-center gap-3 text-zinc-400 shrink-0 font-sans text-[13px]">
          {stats && (
            <>
              <span>{stats.totalCheckedInSeats} personas en la fiesta</span>
              <span>•</span>
            </>
          )}
          <span className="text-[#DFC07D] font-medium">{mediaItems.length} recuerdos en rotación</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title={`Sincronizado: ${lastUpdated}`} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes kenBurnsZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}

export default function ModoTvPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 bg-[#12110F] text-white flex items-center justify-center">
        <span className="text-sm font-semibold tracking-widest text-[#DFC07D] uppercase animate-pulse">
          Cargando Modo Proyección...
        </span>
      </div>
    }>
      <ModoTvContent />
    </Suspense>
  );
}
