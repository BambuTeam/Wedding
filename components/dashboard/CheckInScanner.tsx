"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Tv,
  Users,
  Search,
  Sparkles,
  Loader2,
  Clock,
  DoorOpen,
} from "lucide-react";
import { Guest, EventMeta, CheckInResult } from "@/lib/types";

interface CheckInScannerProps {
  guests: Guest[];
  event: EventMeta;
  onCheckInSuccess: () => void;
}

export function CheckInScanner({ guests, event, onCheckInSuccess }: CheckInScannerProps) {
  const [inputToken, setInputToken] = useState("");
  const [operator, setOperator] = useState("Recepcionista Claudia (Puerta Principal)");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);

  const handleExecuteCheckIn = async (tokenToUse?: string) => {
    const token = (tokenToUse || inputToken).trim();
    if (!token) return;

    setIsProcessing(true);
    setScanResult(null);

    try {
      const response = await fetch(`/api/events/${event.eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestToken: token,
          operator,
        }),
      });

      const data = await response.json();
      setScanResult(data);

      if (response.ok && data.success) {
        onCheckInSuccess();
        setInputToken("");
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: "Error de red al conectar con el servidor de control de acceso.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl bg-carbon-900 text-white border border-champagne-500/30 shadow-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-champagne-400 text-xs font-semibold uppercase tracking-widest mb-1">
            <QrCode className="w-4 h-4" />
            <span>Control de Acceso Anti-Fraude Atómico</span>
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-white font-semibold">
            Recepción en Vivo &amp; Validación de Pases
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Garantizado contra duplicación de QR entre tablets en milisegundos mediante Amazon DynamoDB ConditionExpression.
          </p>
        </div>

        {/* Launch TV Mode Button */}
        <Link
          href="/modo-tv"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-champagne-500 to-champagne-600 text-carbon-950 font-bold text-xs shadow-gold hover:opacity-95 transition-all shrink-0"
        >
          <Tv className="w-4 h-4 text-carbon-950" />
          <span>Lanzar Modo TV (Proyector)</span>
        </Link>
      </div>

      {/* Main scanner & manual input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Left Column: Input and Execution */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1 tracking-wider">
              Escanear QR o Ingresar Token Manual
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-champagne-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej. rivas-molina o escanear QR..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExecuteCheckIn()}
                  className="w-full pl-9 pr-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-champagne-400 font-mono"
                />
              </div>

              <button
                onClick={() => handleExecuteCheckIn()}
                disabled={isProcessing || !inputToken.trim()}
                className="px-5 py-3 rounded-2xl bg-champagne-500 hover:bg-champagne-400 text-carbon-950 font-bold text-xs shadow-gold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DoorOpen className="w-4 h-4" />
                )}
                <span>Validar Ingreso</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-semibold text-zinc-500 mb-1">
              Personal Responsable del Check-In
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-champagne-400"
            />
          </div>

          {/* Quick Demo Simulator Buttons */}
          <div className="pt-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
              Pases Rápidos de Demostración (Toca para probar):
            </span>
            <div className="flex flex-wrap gap-2">
              {guests.slice(0, 4).map((g) => {
                const isAlreadyIn = Boolean(g.checkedInAt);
                return (
                  <button
                    key={g.guestToken}
                    onClick={() => handleExecuteCheckIn(g.guestToken)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isAlreadyIn
                        ? "bg-purple-950/60 border-purple-500/40 text-purple-200 hover:bg-purple-900/80"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-champagne-500/50"
                    }`}
                  >
                    <span>{g.familyName.split("&")[0]}</span>
                    {isAlreadyIn && <span className="text-[10px] text-purple-400 font-mono">(Ya dentro)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result Feedback */}
        <div className="flex flex-col justify-center">
          {scanResult ? (
            scanResult.success ? (
              // Green Success Card
              <div className="p-6 rounded-3xl bg-emerald-950/70 border-2 border-emerald-500 text-white shadow-2xl animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-carbon-950">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
                      Acceso Autorizado
                    </span>
                    <h4 className="font-serif italic text-2xl font-bold text-white">
                      {scanResult.guest?.familyName}
                    </h4>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 text-xs space-y-1.5 mb-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Pases Válidos:</span>
                    <span className="font-bold text-emerald-300">
                      {scanResult.guest?.confirmedSeats || scanResult.guest?.maxSeats} personas
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Hora de Ingreso:</span>
                    <span className="text-zinc-200">
                      {new Date(scanResult.checkedInAt!).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Operador:</span>
                    <span className="text-zinc-200">{scanResult.checkedInBy}</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-200">{scanResult.message}</p>
              </div>
            ) : scanResult.alreadyCheckedIn ? (
              // Red Duplicate Fraud Alert Card
              <div className="p-6 rounded-3xl bg-red-950/80 border-2 border-red-500 text-white shadow-2xl animate-bounce duration-500">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-red-400 font-bold block">
                      ¡ALERTA DE SEGURIDAD: PASE DUPLICADO!
                    </span>
                    <h4 className="font-serif italic text-2xl font-bold text-white">
                      {scanResult.guest?.familyName || "Titular no identificado"}
                    </h4>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-red-500/40 text-xs space-y-1.5 mb-3 font-mono">
                  <div className="flex justify-between text-red-300 font-bold">
                    <span>Estado:</span>
                    <span>PASE YA REGISTRADO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Primer Ingreso:</span>
                    <span className="text-white font-bold">
                      {scanResult.checkedInAt
                        ? new Date(scanResult.checkedInAt).toLocaleTimeString()
                        : "Hora no disponible"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Registrado por:</span>
                    <span className="text-zinc-200">{scanResult.checkedInBy || "Personal de Puerta"}</span>
                  </div>
                </div>

                <p className="text-xs text-red-200 font-medium leading-relaxed">
                  {scanResult.message}
                </p>
              </div>
            ) : (
              // Generic Error
              <div className="p-6 rounded-3xl bg-carbon-800 border border-carbon-700 text-zinc-300 text-center">
                <XCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">{scanResult.message}</p>
              </div>
            )
          ) : (
            // Idle State
            <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center text-zinc-400 flex flex-col items-center justify-center">
              <QrCode className="w-12 h-12 text-champagne-400/50 mb-3" />
              <p className="text-sm font-medium text-white">
                Escáner Listo para Puerta
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Escanea el código QR de la invitación o selecciona uno de los pases de prueba arriba.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
