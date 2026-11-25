"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Camera,
  Heart,
  Maximize2,
  Minimize2,
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
    const interval = setInterval(syncData, 4000);
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [photos]);

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
    <div className="fixed inset-0 z-50 bg-[#12110F] text-white flex flex-col justify-between overflow-hidden p-6 sm:p-10 select-none">
      {/* Top Ambient Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <Heart className="w-4 h-4 fill-[#C5A059] text-[#C5A059] animate-pulse" />
          <div>
            <span className="text-[12px] font-sans font-semibold tracking-[0.2em] text-[#DFC07D] uppercase">
              Convento de las Capuchinas • Antigua Guatemala
            </span>
            <h1 className="font-serif italic text-3xl sm:text-5xl text-white font-normal leading-none">
              Camila <span className="text-[#DFC07D] font-light">&amp;</span> Andrés
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <span className="text-2xl sm:text-4xl font-sans font-bold text-[#DFC07D]">
              {currentTime}
            </span>
            <span className="text-[11px] text-zinc-400 font-sans block">
              Hora en Antigua
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

      {/* Center Stage: Photo Slideshow + Interactive QR */}
      <div className="flex-1 my-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center z-10 overflow-hidden">
        {/* Left: Slideshow Hero (2 Columns) */}
        <div className="lg:col-span-2 relative h-[55vh] lg:h-[65vh] rounded-3xl overflow-hidden bg-[#1E1C1A] border border-[#C5A059]/40 shadow-2xl flex items-center justify-center">
          {activePhoto ? (
            <div className="relative w-full h-full">
              <img
                src={activePhoto.url}
                alt={activePhoto.author}
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059] text-carbon-950 font-bold text-xs shadow-gold mb-2 font-sans">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Recuerdo #{currentPhotoIdx + 1} de {photos.length}</span>
                </span>
                <p className="font-serif italic text-2xl sm:text-3xl text-white font-normal">
                  {activePhoto.author}
                </p>
                {activePhoto.message && (
                  <p className="text-[13px] sm:text-base text-zinc-200 mt-1 max-w-xl font-sans leading-relaxed">
                    &ldquo;{activePhoto.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-zinc-400 space-y-2">
              <Camera className="w-16 h-16 text-[#C5A059]/40 mx-auto mb-2" />
              <p className="font-serif text-2xl text-white font-normal">
                Esperando las primeras fotos de los invitados...
              </p>
              <p className="text-[13px] text-zinc-400 font-sans">
                Apunta con tu celular al código para compartir tus recuerdos en esta pantalla.
              </p>
            </div>
          )}
        </div>

        {/* Right: Interactive Hall QR Code */}
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-[#C5A059]/30 backdrop-blur-md shadow-2xl text-center space-y-3">
          <span className="text-[12px] font-sans font-semibold text-[#DFC07D] tracking-widest uppercase">
            Participa con Nosotros
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
            Sube tus fotos a esta pantalla desde tu mesa
          </h3>

          <div className="p-4 rounded-2xl bg-white text-carbon-900 shadow-2xl border-4 border-[#C5A059] my-2">
            <QRCodeSVG value={kitUrl} size={180} level="M" />
          </div>

          <p className="text-[13px] text-zinc-300 max-w-xs font-sans leading-relaxed">
            Apunta la cámara de tu teléfono para subir fotos instantáneas y encontrar tu mesa sin descargar nada.
          </p>
        </div>
      </div>

      {/* Bottom Live Ticker */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs z-20">
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
                </span>
              ))
            )}
          </div>
        </div>

        {/* Stats counter */}
        {stats && (
          <div className="hidden sm:flex items-center gap-2 text-zinc-400 shrink-0 font-sans text-[13px]">
            <span>{stats.totalCheckedInSeats} personas en la fiesta</span>
            <span>•</span>
            <span className="text-[#DFC07D] font-medium">{photos.length} fotos proyectadas</span>
          </div>
        )}
      </div>
    </div>
  );
}
