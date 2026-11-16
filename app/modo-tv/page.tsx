"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Sparkles,
  Camera,
  DoorOpen,
  Heart,
  Maximize2,
  Minimize2,
  Tv,
  CheckCircle2,
} from "lucide-react";
import { LivePhoto, Guest, EventDashboardStats } from "@/lib/types";

export default function ModoTvPage() {
  const eventId = "camila-andres-2025";
  const [photos, setPhotos] = useState<LivePhoto[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<Guest[]>([]);
  const [stats, setStats] = useState<EventDashboardStats | null>(null);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const syncData = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/sync`);
      const data = await res.json();
      if (data.latestPhotos) setPhotos(data.latestPhotos);
      if (data.recentCheckIns) setRecentCheckIns(data.recentCheckIns);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error("TV sync error:", e);
    }
  };

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 4000); // Poll every 4 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  // Slideshow rotation
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [photos]);

  // Live clock
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

  const activePhoto = photos[currentPhotoIdx] || null;
  const kitUrl = typeof window !== "undefined" ? `${window.location.origin}/kit-del-dia` : "";

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C] text-white flex flex-col justify-between overflow-hidden p-6 sm:p-10 select-none">
      {/* Top Ambient Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-champagne-400">
              Convento de las Capuchinas • Antigua Guatemala
            </span>
            <h1 className="font-serif italic text-3xl sm:text-5xl text-white font-bold leading-none">
              Camila <span className="text-champagne-400 font-light">&amp;</span> Andrés
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-champagne-300">
              {currentTime}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-sans">
              Hora Colonial
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center Stage: Photo Slideshow + QR Interactive Corner */}
      <div className="flex-1 my-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center z-10 overflow-hidden">
        {/* Left: Slideshow Hero (2 Columns) */}
        <div className="lg:col-span-2 relative h-[55vh] lg:h-[65vh] rounded-3xl overflow-hidden bg-carbon-900 border border-champagne-500/30 shadow-2xl flex items-center justify-center">
          {activePhoto ? (
            <div className="relative w-full h-full">
              <img
                src={activePhoto.url}
                alt={activePhoto.author}
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-500 text-carbon-950 font-bold text-xs shadow-gold mb-2">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto en Vivo #{currentPhotoIdx + 1} de {photos.length}</span>
                </span>
                <p className="font-serif italic text-2xl sm:text-3xl text-white font-bold">
                  {activePhoto.author}
                </p>
                {activePhoto.message && (
                  <p className="text-sm sm:text-base text-zinc-200 mt-1 max-w-xl">
                    &ldquo;{activePhoto.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-zinc-400">
              <Camera className="w-16 h-16 text-champagne-500/40 mx-auto mb-3" />
              <p className="font-serif italic text-2xl text-white">
                Esperando las primeras fotos de los invitados...
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Escanea el código QR para subir una foto desde tu celular.
              </p>
            </div>
          )}
        </div>

        {/* Right: Interactive Hall QR Code */}
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-champagne-500/30 backdrop-blur-md shadow-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-400 mb-2">
            Participa en Vivo
          </span>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-white font-bold mb-4">
            Encuentra tu mesa y sube fotos a esta pantalla
          </h3>

          <div className="p-4 rounded-2xl bg-white text-carbon-950 shadow-2xl border-4 border-champagne-400 mb-4">
            <QRCodeSVG value={kitUrl} size={180} level="M" />
          </div>

          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            Apunta la cámara de tu teléfono para abrir el <strong className="text-white">Kit del Día</strong> sin descargar ninguna aplicación.
          </p>
        </div>
      </div>

      {/* Bottom Live Ticker */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
            <DoorOpen className="w-3.5 h-3.5" />
            <span>ÚLTIMAS LLEGADAS:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar text-zinc-300">
            {recentCheckIns.length === 0 ? (
              <span className="italic text-zinc-500">
                Recepción de invitados en curso...
              </span>
            ) : (
              recentCheckIns.map((g) => (
                <span
                  key={g.guestToken}
                  className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <strong className="text-white">{g.familyName}</strong> ({g.confirmedSeats || g.maxSeats} pases)
                </span>
              ))
            )}
          </div>
        </div>

        {/* Guest counter stats */}
        {stats && (
          <div className="hidden sm:flex items-center gap-2 text-zinc-400 shrink-0 font-mono">
            <span>{stats.totalCheckedInSeats} personas en la fiesta</span>
            <span>•</span>
            <span className="text-champagne-400">{photos.length} fotos proyectadas</span>
          </div>
        )}
      </div>
    </div>
  );
}
