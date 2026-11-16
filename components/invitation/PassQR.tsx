"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  ShieldCheck,
  Send,
  Download,
  Share2,
  Sparkles,
  MapPin,
  Users,
  Check,
} from "lucide-react";
import { Guest, EventMeta } from "@/lib/types";

interface PassQRProps {
  guest: Guest;
  event: EventMeta;
  tableName?: string;
}

export function PassQR({ guest, event, tableName }: PassQRProps) {
  const [copied, setCopied] = useState(false);

  const qrPayload = JSON.stringify({
    aureaId: "AUREA-PASS",
    evt: event.eventId,
    tkn: guest.guestToken,
    fam: guest.familyName,
    seats: guest.confirmedSeats || guest.maxSeats,
    tbl: tableName || "Sin asignar",
  });

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎫 *PASE DIGITAL DE ACCESO — ${event.title.toUpperCase()}*\n\n` +
      `Titular: *${guest.familyName}*\n` +
      `Lugares confirmados: *${guest.confirmedSeats || guest.maxSeats}*\n` +
      `Mesa: *${tableName || "Por asignar en recepción"}*\n` +
      `Venue: *${event.venueName}, ${event.venueCity}*\n\n` +
      `Presenta este pase QR al llegar a recepción:\n` +
      `${typeof window !== "undefined" ? window.location.href : ""}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Luxury Pass Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#1E2022] to-[#121314] text-white p-6 sm:p-8 shadow-2xl border border-champagne-500/40">
        {/* Holographic Golden Accent Edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-champagne-600 via-champagne-300 to-champagne-600" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-champagne-400 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pase VIP Oficial</span>
            </div>
            <h3 className="font-serif italic text-2xl text-white mt-0.5">
              {event.title}
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-champagne-500/20 border border-champagne-400/30 text-champagne-300 text-xs font-medium">
            Acceso Rápido
          </div>
        </div>

        {/* Guest Details */}
        <div className="my-5 space-y-3">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">
              Titular del Pase
            </span>
            <p className="font-serif italic text-2xl text-white font-medium">
              {guest.familyName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-champagne-400" />
                <span>Pases Válidos</span>
              </div>
              <span className="text-xl font-bold text-white">
                {guest.confirmedSeats || guest.maxSeats} {guest.confirmedSeats === 1 ? "persona" : "personas"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <MapPin className="w-3.5 h-3.5 text-champagne-400" />
                <span>Mesa</span>
              </div>
              <span className="text-sm font-semibold text-champagne-300 truncate block">
                {tableName || "Asignada en puerta"}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="my-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-carbon-950 shadow-inner border-2 border-champagne-400/40">
          <QRCodeSVG
            value={qrPayload}
            size={190}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "https://api.iconify.design/lucide:heart.svg?color=%23b89758",
              x: undefined,
              y: undefined,
              height: 28,
              width: 28,
              excavate: true,
            }}
          />
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>TOKEN: {guest.guestToken}</span>
          </div>
        </div>

        {/* Access Status pill */}
        <div className="text-center mb-6">
          {guest.checkedInAt ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Ingresado a las {new Date(guest.checkedInAt).toLocaleTimeString()}</span>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 leading-relaxed">
              Muestra este código al equipo de recepción en la entrada del {event.venueName}.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Guardar en WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "¡Enlace Copiado!" : "Compartir Pase"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
