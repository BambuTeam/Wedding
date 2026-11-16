"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Check,
  X,
  Users,
  AlertCircle,
  Heart,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Guest, EventMeta } from "@/lib/types";

interface RsvpModalProps {
  guest: Guest;
  event: EventMeta;
  onSuccess: (updatedGuest: Guest) => void;
  onClose: () => void;
}

export function RsvpModal({ guest, event, onSuccess, onClose }: RsvpModalProps) {
  const [status, setStatus] = useState<"CONFIRMED" | "DECLINED">("CONFIRMED");
  const [confirmedSeats, setConfirmedSeats] = useState<number>(
    guest.confirmedSeats > 0 ? guest.confirmedSeats : guest.maxSeats
  );
  const [dietaryNotes, setDietaryNotes] = useState<string>(guest.dietaryNotes || "");
  const [guestMessage, setGuestMessage] = useState<string>(guest.guestMessage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(
        `/api/events/${event.eventId}/guests/${guest.guestToken}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "rsvp",
            status,
            confirmedSeats: status === "CONFIRMED" ? confirmedSeats : 0,
            dietaryNotes,
            guestMessage,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al enviar tu confirmación");
      }

      if (status === "CONFIRMED") {
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#C5A059", "#4A5D4E", "#DFC07D", "#ffffff"],
          });
        } catch {
          // ignore
        }
      }

      onSuccess(data.guest);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al enviar tu respuesta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF7F2] border border-[#DFC9A6] shadow-2xl p-6 sm:p-8 text-carbon-900 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-carbon-200/50 text-carbon-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-[#E8DFC8]">
          <span className="text-xs font-serif italic text-[#7A5C30] tracking-widest uppercase">
            Confirmación con el corazón
          </span>
          <h3 className="font-serif italic text-3xl text-carbon-900 font-bold mt-0.5">
            {guest.familyName}
          </h3>
          <p className="text-xs text-carbon-500 font-serif italic mt-1">
            Por favor confírmanos antes del 15 de Noviembre para preparar cada detalle
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Decision Pill Selector */}
          <div>
            <label className="block text-xs font-serif italic text-carbon-700 mb-2 text-center text-sm">
              ¿Nos acompañarás en nuestro gran día?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("CONFIRMED")}
                className={`p-3.5 rounded-2xl border text-xs font-serif italic transition-all flex items-center justify-center gap-2 ${
                  status === "CONFIRMED"
                    ? "bg-[#C5A059] text-carbon-950 border-[#B88E3E] font-bold shadow-gold"
                    : "bg-white text-carbon-700 border-carbon-200 hover:bg-carbon-50"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>¡Sí, ahí estaremos!</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("DECLINED")}
                className={`p-3.5 rounded-2xl border text-xs font-serif italic transition-all flex items-center justify-center gap-2 ${
                  status === "DECLINED"
                    ? "bg-[#24211D] text-white border-carbon-900 shadow-md font-bold"
                    : "bg-white text-carbon-700 border-carbon-200 hover:bg-carbon-50"
                }`}
              >
                <X className="w-4 h-4" />
                <span>Brindaré desde lejos</span>
              </button>
            </div>
          </div>

          {/* Seats Selector */}
          {status === "CONFIRMED" && (
            <div className="p-4 rounded-2xl bg-white border border-[#E0D4BE] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-serif italic font-bold text-carbon-800 block">
                    Personas que asistirán
                  </span>
                  <span className="text-[11px] text-carbon-500 font-sans">
                    Lugares reservados con cariño para ustedes: {guest.maxSeats}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmedSeats(Math.max(1, confirmedSeats - 1))}
                    className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F3EFEA] border border-[#E0D4BE] text-carbon-800 flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="font-serif italic text-2xl font-bold w-6 text-center text-carbon-900">
                    {confirmedSeats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmedSeats(Math.min(guest.maxSeats, confirmedSeats + 1))}
                    className="w-8 h-8 rounded-full bg-[#C5A059] hover:bg-[#B88E3E] text-carbon-950 flex items-center justify-center font-bold text-sm shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dietary Restrictions */}
          {status === "CONFIRMED" && (
            <div>
              <label className="block text-xs font-serif italic text-carbon-700 mb-1">
                ¿Alguna alergia o menú especial para el banquete?
              </label>
              <input
                type="text"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="Ej. 1 vegetariano, celíaco o alergia a mariscos"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DFC9A6] bg-white text-xs text-carbon-900 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          )}

          {/* Guest message / dedication */}
          <div>
            <label className="block text-xs font-serif italic text-carbon-700 mb-1">
              Unas palabras para Camila &amp; Andrés (Opcional)
            </label>
            <textarea
              rows={3}
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              placeholder="Escribe tus bendiciones y deseos para este nuevo camino..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#DFC9A6] bg-white text-xs text-carbon-900 focus:outline-none focus:border-[#C5A059] resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#947239] via-[#C5A059] to-[#947239] text-carbon-950 font-bold text-xs uppercase tracking-widest shadow-gold hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-carbon-950" />
                <span>Guardando con cariño...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-carbon-950 text-carbon-950" />
                <span>{status === "CONFIRMED" ? "Confirmar y recibir pase de bienvenida" : "Enviar respuesta"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
