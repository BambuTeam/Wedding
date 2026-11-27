"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Heart,
  CheckCircle2,
  XCircle,
  Tv,
  Users,
  Search,
  Sparkles,
  Loader2,
  Clock,
  DoorOpen,
  ShieldAlert,
  Camera,
  UtensilsCrossed,
  AlertTriangle,
  X,
  ScanLine,
} from "lucide-react";
import { Guest, EventMeta, Table, CheckInResult } from "@/lib/types";

interface CheckInScannerProps {
  guests: Guest[];
  event: EventMeta;
  tables?: Table[];
  onCheckInSuccess: () => void;
}

export function CheckInScanner({ guests, event, tables = [], onCheckInSuccess }: CheckInScannerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [operator, setOperator] = useState("Equipo de Bienvenida (Puerta Principal)");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);

  // Cámara QR en vivo
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mapa de mesas por ID para búsqueda rápida
  const tablesMap = useMemo(() => {
    const map = new Map<string, string>();
    tables.forEach((t) => map.set(t.tableId, t.name));
    return map;
  }, [tables]);

  // Métricas en tiempo real de puerta
  const metrics = useMemo(() => {
    const totalConfirmed = guests.reduce(
      (acc, g) => (g.status === "CONFIRMED" ? acc + (g.confirmedSeats || g.maxSeats || 1) : acc),
      0
    );
    const checkedInGuests = guests.filter((g) => Boolean(g.checkedInAt));
    const arrivedSeats = checkedInGuests.reduce(
      (acc, g) => acc + (g.confirmedSeats || g.maxSeats || 1),
      0
    );
    const pendingGuests = guests.filter(
      (g) => g.status === "CONFIRMED" && !g.checkedInAt
    );

    return {
      totalConfirmed,
      arrivedSeats,
      checkedInFamiliesCount: checkedInGuests.length,
      pendingGuests,
    };
  }, [guests]);

  // Resultados de búsqueda en vivo
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    return guests.filter((g) => {
      const matchName = g.familyName.toLowerCase().includes(q);
      const matchContact = g.primaryContactName?.toLowerCase().includes(q);
      const matchToken = g.guestToken.toLowerCase().includes(q);
      const tableName = g.tableId ? tablesMap.get(g.tableId) || "" : "";
      const matchTable = tableName.toLowerCase().includes(q);
      return matchName || matchContact || matchToken || matchTable;
    }).slice(0, 6);
  }, [searchTerm, guests, tablesMap]);

  // Ejecución de check-in en DynamoDB
  const handleExecuteCheckIn = async (tokenToUse: string) => {
    const cleanToken = tokenToUse.trim();
    if (!cleanToken) return;

    setIsProcessing(true);
    setScanResult(null);

    try {
      const response = await fetch(`/api/events/${event.eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestToken: cleanToken,
          operator,
        }),
      });

      const data = await response.json();
      setScanResult(data);

      if (response.ok && data.success) {
        onCheckInSuccess();
        setSearchTerm("");
        stopCamera();
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err?.message || "No fue posible conectar con el registro. Intenta de nuevo.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejo de Cámara QR Nativa (BarcodeDetector + Fallback)
  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Iniciar escaneo continuo de frames con BarcodeDetector si está soportado
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["qr_code"],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                if (rawValue) {
                  // AUREA:eventId:token
                  let detectedToken = rawValue;
                  if (detectedToken.startsWith("AUREA:")) {
                    const parts = detectedToken.split(":");
                    detectedToken = parts[parts.length - 1];
                  }
                  stopCamera();
                  handleExecuteCheckIn(detectedToken);
                }
              }
            } catch {}
          }
        }, 400);
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("No se pudo acceder a la cámara. Puedes escribir el nombre o código abajo.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="rounded-3xl bg-[#1E1C1A] text-white border border-[#C5A059]/40 shadow-2xl p-6 sm:p-8 font-sans">
      {/* Header con enlace dinámico al Modo TV del anfitrión activo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#DFC07D] text-[13px] font-sans font-semibold mb-1">
            <Heart className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
            <span>Control de Acceso &amp; Hospitalidad</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
            Bienvenida en Recepción
          </h3>
          <p className="text-[13px] text-zinc-400 mt-0.5 font-sans">
            Herramienta en vivo para puerta o mesa de bienvenida. Valida pases QR, asigna mesas y detecta duplicados al instante.
          </p>
        </div>

        {/* Botón contextual a Modo TV */}
        <Link
          href={`/modo-tv?eventId=${event.eventId}`}
          target="_blank"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8E6D38] via-[#C5A059] to-[#8E6D38] text-zinc-950 font-bold text-[13px] font-sans uppercase tracking-wider shadow-gold hover:opacity-95 transition-all shrink-0 cursor-pointer"
        >
          <Tv className="w-4 h-4 text-zinc-950" />
          <span>Pantalla de la Fiesta (Modo TV)</span>
        </Link>
      </div>

      {/* Ticker / Tarjeta de progreso de aforo */}
      <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#DFC07D]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-semibold">
              Invitados en el Salón
            </span>
            <span className="text-xl font-bold text-white">
              {metrics.arrivedSeats} <span className="text-sm font-normal text-zinc-400">/ {metrics.totalConfirmed} confirmados</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4" />
          <span>{metrics.checkedInFamiliesCount} familias recibidas</span>
        </div>
      </div>

      {/* Main scanner & manual input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Left Column: Search & Camera Scanner */}
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-sans font-semibold text-[#DFC07D] mb-1.5">
              Buscar familia, mesa o escanear QR:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Escribe apellido, nombre o token..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchResults.length > 0) {
                      handleExecuteCheckIn(searchResults[0].guestToken);
                    }
                  }}
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#C5A059]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón de Cámara QR */}
              <button
                onClick={() => (isCameraActive ? stopCamera() : startCamera())}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  isCameraActive
                    ? "bg-rose-900 border-rose-500 text-white shadow-md"
                    : "bg-white/10 border-[#C5A059]/40 hover:bg-white/20 text-[#DFC07D]"
                }`}
                title="Escanear con la cámara del dispositivo"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">{isCameraActive ? "Cerrar" : "Escanear QR"}</span>
              </button>
            </div>

            {cameraError && (
              <p className="text-xs text-rose-400 mt-1.5">{cameraError}</p>
            )}
          </div>

          {/* Visor de Cámara Activo */}
          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#C5A059] bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-[#DFC07D]/60 m-8 rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
                <ScanLine className="w-12 h-12 text-[#DFC07D]/80" />
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Resultados de búsqueda predictiva en tiempo real */}
          {searchTerm && searchResults.length > 0 && (
            <div className="p-2 rounded-2xl bg-[#141311] border border-white/15 space-y-1.5 shadow-xl">
              <span className="text-[11px] font-semibold text-zinc-400 px-3 py-1 block">
                Resultados coincidentes ({searchResults.length}):
              </span>
              {searchResults.map((g) => {
                const isAlreadyIn = Boolean(g.checkedInAt);
                const tableName = g.tableId ? tablesMap.get(g.tableId) || "Mesa asignada" : "Sin mesa asignada";

                return (
                  <div
                    key={g.guestToken}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">
                          {g.familyName}
                        </span>
                        {isAlreadyIn && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-300 text-[10px] font-bold">
                            Ingresó
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="text-[#DFC07D] font-medium">{tableName}</span>
                        <span>•</span>
                        <span>{g.confirmedSeats || g.maxSeats} pases</span>
                        {g.dietaryNotes && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 text-[11px]">⚠️ {g.dietaryNotes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleExecuteCheckIn(g.guestToken)}
                      disabled={isProcessing}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        isAlreadyIn
                          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          : "bg-[#C5A059] text-zinc-950 hover:bg-[#DFC07D] shadow-md"
                      }`}
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isAlreadyIn ? "Reingreso" : "Bienvenida"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Atendido por */}
          <div>
            <label className="block text-[12px] font-sans text-zinc-400 mb-1">
              Operador de Puerta:
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Píldoras Rápidas de Familias Reales Pendientes de Ingresar */}
          <div className="pt-2">
            <span className="text-[12px] font-sans font-semibold text-zinc-400 block mb-2">
              Familias pendientes de ingresar ({metrics.pendingGuests.length}):
            </span>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar">
              {metrics.pendingGuests.length === 0 ? (
                <span className="text-xs text-emerald-400 italic">
                  ¡Todas las familias confirmadas ya están dentro del salón!
                </span>
              ) : (
                metrics.pendingGuests.map((g) => (
                  <button
                    key={g.guestToken}
                    onClick={() => handleExecuteCheckIn(g.guestToken)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl text-xs font-sans font-medium bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/15 hover:border-[#C5A059]/60 transition-all flex items-center gap-1.5"
                  >
                    <span>{g.familyName}</span>
                    <span className="text-[10px] text-[#DFC07D] font-mono">({g.confirmedSeats || g.maxSeats})</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result & Hospitality Card */}
        <div className="flex flex-col justify-center">
          {scanResult ? (
            scanResult.success ? (
              // Green Success Card con detalles de mesa y cocina
              <div className="p-6 rounded-3xl bg-emerald-950/70 border-2 border-emerald-500 text-white shadow-2xl animate-in fade-in duration-300 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-sans font-bold block">
                      ¡Acceso Autorizado!
                    </span>
                    <h4 className="font-serif text-2xl font-normal text-white">
                      {scanResult.guest?.familyName}
                    </h4>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 text-xs space-y-2 font-sans">
                  <div className="flex justify-between items-center pb-1 border-b border-white/10">
                    <span className="text-zinc-300">Mesa Asignada:</span>
                    <span className="font-bold text-[#DFC07D] text-sm">
                      {scanResult.guest?.tableId
                        ? tablesMap.get(scanResult.guest.tableId) || "Mesa Registrada"
                        : "Por asignar en sala"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Pases Confirmados:</span>
                    <span className="font-bold text-emerald-300">
                      {scanResult.guest?.confirmedSeats || scanResult.guest?.maxSeats} personas
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Hora de llegada:</span>
                    <span className="text-zinc-200 font-mono">
                      {new Date(scanResult.checkedInAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {scanResult.guest?.dietaryNotes && (
                    <div className="pt-2 border-t border-white/10 text-amber-300 flex items-start gap-1.5">
                      <UtensilsCrossed className="w-4 h-4 shrink-0 text-amber-400" />
                      <span><strong>Alerta Cocina:</strong> {scanResult.guest.dietaryNotes}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-emerald-200/90 font-sans">
                  Ingreso registrado en DynamoDB y enviado a la pantalla del evento.
                </p>
              </div>
            ) : scanResult.alreadyCheckedIn ? (
              // Red Duplicate Notice Card
              <div className="p-6 rounded-3xl bg-rose-950/80 border-2 border-rose-500 text-white shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-rose-400 font-bold font-sans block">
                      Aviso: Este pase ya fue utilizado
                    </span>
                    <h4 className="font-serif text-2xl font-normal text-white">
                      {scanResult.guest?.familyName || "Titular"}
                    </h4>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/40 text-xs space-y-2 font-sans">
                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>Estado:</span>
                    <span>YA INGRESÓ PREVIAMENTE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Primer ingreso:</span>
                    <span className="text-white font-bold font-mono">
                      {scanResult.checkedInAt
                        ? new Date(scanResult.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Hora no disponible"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Recibido por:</span>
                    <span className="text-zinc-200">{scanResult.checkedInBy || "Personal de Puerta"}</span>
                  </div>
                </div>

                <p className="text-xs text-rose-200 font-sans leading-relaxed">
                  Para proteger los lugares de la familia, el pase solo puede usarse una vez. Por favor consulta con la pareja o wedding planner.
                </p>
              </div>
            ) : (
              // Error genérico
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-center">
                <XCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-sans text-white">{scanResult.message}</p>
              </div>
            )
          ) : (
            // Idle State
            <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center text-zinc-400 flex flex-col items-center justify-center">
              <DoorOpen className="w-12 h-12 text-[#DFC07D]/50 mb-3" />
              <p className="font-serif text-lg text-white font-normal">
                Recepción en Espera
              </p>
              <p className="text-[13px] text-zinc-400 mt-1 max-w-xs font-sans">
                Apunta con la cámara o escribe el nombre de la familia para validar su llegada y mesa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
