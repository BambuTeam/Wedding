"use client";

import React, { useState } from "react";
import { Wifi, Copy, Check, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EventMeta } from "@/lib/types";

interface WifiCardProps {
  event: EventMeta;
}

export function WifiCard({ event }: WifiCardProps) {
  const [copied, setCopied] = useState(false);

  // Standard Wi-Fi connection QR payload format: WIFI:S:<SSID>;T:WPA;P:<PASSWORD>;;
  const wifiQrPayload = `WIFI:S:${event.wifiSsid};T:WPA;P:${event.wifiPassword};;`;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(event.wifiPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-carbon-900 to-carbon-950 text-white border border-champagne-500/40 shadow-2xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Info */}
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-500/20 text-champagne-300 text-xs font-semibold uppercase tracking-widest border border-champagne-500/30">
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi de Alta Velocidad para Invitados</span>
          </div>

          <h3 className="font-serif italic text-3xl sm:text-4xl text-white font-semibold">
            Conéctate y Comparte tus Fotos
          </h3>

          <div className="space-y-2 pt-2">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Red Wi-Fi (SSID):
              </span>
              <span className="font-mono text-base text-champagne-200 font-bold">
                {event.wifiSsid}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Contraseña:
              </span>
              <div className="flex items-center gap-2 mt-0.5 justify-center md:justify-start">
                <span className="font-mono text-lg text-white font-bold bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                  {event.wifiPassword}
                </span>

                <button
                  onClick={handleCopyPassword}
                  className="px-3 py-2 rounded-xl bg-champagne-500 hover:bg-champagne-400 text-carbon-950 font-bold text-xs shadow-gold transition-all flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Clave</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR for instant camera Wi-Fi pairing */}
        <div className="shrink-0 flex flex-col items-center p-4 rounded-2xl bg-white text-carbon-950 border-2 border-champagne-400/40 shadow-inner">
          <QRCodeSVG value={wifiQrPayload} size={130} level="M" />
          <span className="text-[10px] font-semibold text-carbon-600 uppercase tracking-wider mt-2">
            Escanea para Conectar
          </span>
        </div>
      </div>
    </div>
  );
}
