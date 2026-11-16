"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Check,
  X,
  Users,
  AlertCircle,
  MessageSquareHeart,
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
        throw new Error(data.error || "Error al registrar confirmación");
      }

      if (status === "CONFIRMED") {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#B89758", "#4A5D4E", "#DFC07D", "#ffffff"],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-alabaster-50 border border-champagne-400/40 shadow-2xl p-6 sm:p-8 text-carbon-900 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-carbon-200/50 text-carbon-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-champagne-200">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-champagne-700">
            Confirmación de Asistencia
          </span>
          <h3 className="font-serif italic text-3xl text-carbon-900 mt-0.5">
            {guest.familyName}
          </h3>
          <p className="text-xs text-carbon-500 mt-1">
            Por favor confirma tus lugares antes del 15 de Noviembre
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-carbon-600 mb-2">
              ¿Nos acompañarás en nuestro gran día?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("CONFIRMED")}
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  status === "CONFIRMED"
                    ? "bg-champagne-500 text-carbon-950 border-champagne-600 shadow-gold"
                    : "bg-white text-carbon-700 border-carbon-200 hover:bg-carbon-50"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>¡Sí, ahí estaré!</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("DECLINED")}
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  status === "DECLINED"
                    ? "bg-carbon-800 text-white border-carbon-900 shadow-md"
                    : "bg-white text-carbon-700 border-carbon-200 hover:bg-carbon-50"
                }`}
              >
                <X className="w-4 h-4" />
                <span>No podré asistir</span>
              </button>
            </div>
          </div>

          {/* Seats Selector (Only if Confirmed) */}
          {status === "CONFIRMED" && (
            <div className="p-4 rounded-2xl bg-white border border-champagne-300/60 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-carbon-700 block">
                    Lugares a Confirmar
                  </span>
                  <span className="text-[11px] text-carbon-500">
                    Máximo asignado a tu pase: {guest.maxSeats} {guest.maxSeats === 1 ? "persona" : "personas"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmedSeats(Math.max(1, confirmedSeats - 1))}
                    className="w-8 h-8 rounded-full bg-alabaster-200 hover:bg-alabaster-300 text-carbon-800 flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="font-serif italic text-2xl font-bold w-6 text-center text-carbon-900">
                    {confirmedSeats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmedSeats(Math.min(guest.maxSeats, confirmedSeats + 1))}
                    className="w-8 h-8 rounded-full bg-champagne-500 hover:bg-champagne-600 text-carbon-950 flex items-center justify-center font-bold text-sm shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dietary Restrictions (Optional) */}
          {status === "CONFIRMED" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-carbon-600 mb-1">
                Restricciones Alimenticias / Alergias
              </label>
              <input
                type="text"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="Ej. 1 vegetariano, celíaco o alergia a mariscos"
                className="w-full px-4 py-2.5 rounded-xl border border-carbon-300 bg-white text-xs text-carbon-900 focus:outline-none focus:border-champagne-500"
              />
            </div>
          )}

          {/* Guest message / dedication */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-carbon-600 mb-1">
              Dedicatoria para Camila &amp; Andrés (Opcional)
            </label>
            <textarea
              rows={3}
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              placeholder="Unas palabras o buenos deseos para los novios..."
              className="w-full px-4 py-2.5 rounded-xl border border-carbon-300 bg-white text-xs text-carbon-900 focus:outline-none focus:border-champagne-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 text-carbon-950 font-bold text-sm tracking-wide shadow-gold hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-carbon-950" />
                <span>Guardando confirmación...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{status === "CONFIRMED" ? "Confirmar y Generar Pase QR" : "Enviar Notificación"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
