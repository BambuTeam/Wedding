"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Heart,
  Send,
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
    aureaId: "AUREA-INVITATION",
    evt: event.eventId,
    tkn: guest.guestToken,
    fam: guest.familyName,
    seats: guest.confirmedSeats || guest.maxSeats,
    tbl: tableName || "Sin asignar",
  });

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `💌 *NUESTRO PASE DE BIENVENIDA — BODA DE ${event.title.toUpperCase()}*\n\n` +
      `Familia: *${guest.familyName}*\n` +
      `Lugares confirmados: *${guest.confirmedSeats || guest.maxSeats} personas*\n` +
      `Mesa: *${tableName || "Asignada con cariño al llegar"}*\n` +
      `Lugar: *${event.venueName}, ${event.venueCity}*\n\n` +
      `Nos vemos en la celebración. Aquí puedes ver tu carta y detalles:\n` +
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
      {/* Luxury Warm Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#24211D] to-[#141312] text-white p-6 sm:p-8 shadow-2xl border border-[#C5A059]/40">
        {/* Golden Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#947239] via-[#E5C686] to-[#947239]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-[#DFC07D] text-[13px] font-sans font-semibold tracking-wide">
              <Heart className="w-3.5 h-3.5 fill-[#DFC07D]" />
              <span>Pase de Bienvenida</span>
            </div>
            <h3 className="font-serif text-2xl text-white mt-0.5 font-normal">
              {event.title}
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#DFC07D] text-[12px] font-sans font-semibold">
            Confirmado con amor
          </div>
        </div>

        {/* Guest Details */}
        <div className="my-5 space-y-3">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-sans font-semibold block">
              Reservado especialmente para
            </span>
            <p className="font-serif text-2xl text-white font-normal">
              {guest.familyName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-[#DFC07D]" />
                <span className="font-sans text-[12px]">Lugares</span>
              </div>
              <span className="text-xl font-sans font-bold text-white">
                {guest.confirmedSeats || guest.maxSeats} {guest.confirmedSeats === 1 ? "persona" : "personas"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#DFC07D]" />
                <span className="font-sans text-[12px]">Tu Mesa</span>
              </div>
              <span className="text-[13px] font-sans font-semibold text-[#DFC07D] truncate block">
                {tableName || "Asignada al llegar"}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="my-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FCFAF7] text-carbon-900 shadow-inner border-2 border-[#C5A059]/40">
          <QRCodeSVG
            value={qrPayload}
            size={180}
            level="H"
            includeMargin={false}
          />
          <div className="mt-3 text-center">
            <p className="font-sans font-semibold text-[13px] text-[#7A5C30]">
              Tu pase de bienvenida
            </p>
            <p className="text-[12px] text-zinc-600 font-sans mt-0.5">
              Muéstralo al llegar, nos hará muy felices verte
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-5">
          {guest.checkedInAt ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[13px] font-sans font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>¡Ya estás con nosotros en la fiesta!</span>
            </div>
          ) : (
            <p className="text-[13px] text-zinc-300 font-sans leading-relaxed">
              Al llegar a {event.venueName}, el equipo de recepción te recibirá con una sonrisa.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-[13px] font-sans font-medium transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Guardar en WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13px] font-sans font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "¡Enlace copiado!" : "Compartir pase"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
