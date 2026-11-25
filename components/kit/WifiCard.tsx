"use client";

import React, { useState } from "react";
import { Wifi, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EventMeta } from "@/lib/types";

interface WifiCardProps {
  event: EventMeta;
}

export function WifiCard({ event }: WifiCardProps) {
  const [copied, setCopied] = useState(false);

  const wifiQrPayload = `WIFI:S:${event.wifiSsid};T:WPA;P:${event.wifiPassword};;`;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(event.wifiPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#24211D] to-[#141312] text-white border border-[#C5A059]/40 shadow-2xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Info */}
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#DFC07D] text-[12px] font-sans font-semibold border border-[#C5A059]/30">
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi del Convento</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Conéctate y Comparte Cada Momento
          </h3>

          <div className="space-y-2 pt-2">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-sans font-semibold block">
                Red:
              </span>
              <span className="font-sans text-base sm:text-lg text-[#DFC07D] font-semibold">
                {event.wifiSsid}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-sans font-semibold block">
                Contraseña:
              </span>
              <div className="flex items-center gap-2 mt-0.5 justify-center md:justify-start">
                <span className="font-mono text-base text-white font-bold bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                  {event.wifiPassword}
                </span>

                <button
                  onClick={handleCopyPassword}
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#B88E3E] text-carbon-950 font-bold text-[13px] uppercase tracking-wider shadow-gold transition-all flex items-center gap-1.5 font-sans"
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
        <div className="shrink-0 flex flex-col items-center p-4 rounded-2xl bg-[#FCFAF7] text-carbon-900 border-2 border-[#C5A059]/40 shadow-inner">
          <QRCodeSVG value={wifiQrPayload} size={130} level="M" />
          <span className="text-[12px] font-sans text-zinc-600 mt-2">
            Apunta tu cámara para conectar
          </span>
        </div>
      </div>
    </div>
  );
}
