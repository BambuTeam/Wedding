"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Sparkles, Heart } from "lucide-react";
import { Guest, EventMeta } from "@/lib/types";

interface EnvelopeProps {
  guest: Guest;
  event: EventMeta;
  startClosed?: boolean;
  onOpenComplete?: () => void;
}

export function Envelope({ guest, event, startClosed = true, onOpenComplete }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(startClosed ? false : guest.status !== "UNOPENED");
  const [isOpening, setIsOpening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Reproducir acorde acústico suave de arpa
  const playEnvelopeAudio = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.12);
        osc.stop(audioCtx.currentTime + i * 0.12 + 1.3);
      });
    } catch {
      // Fallback silencioso para navegadores que bloquean autoplay
    }
  };

  const handleBreakSeal = async () => {
    if (isOpening || isOpen) return;
    setIsOpening(true);
    playEnvelopeAudio();

    try {
      await fetch(`/api/events/${event.eventId}/guests/${guest.guestToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open" }),
      });
    } catch (e) {
      console.warn("Silent open tracking failed", e);
    }

    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      if (onOpenComplete) onOpenComplete();
    }, 1100);
  };

  if (isOpen && !isOpening) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isOpening ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/85 backdrop-blur-xl"
      >
        {/* Selector de música suave */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-6 right-6 p-3 rounded-full bg-[#24201D]/90 text-[#DFC07D] border border-[#C5A059]/30 hover:bg-[#332D28] transition-colors z-50 flex items-center gap-2 text-[13px] font-sans font-medium"
          title={isMuted ? "Activar música suave" : "Silenciar música"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          <span className="hidden sm:inline">{isMuted ? "Sin música" : "Música ambiental"}</span>
        </button>

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: isOpening ? 1.05 : 1, opacity: isOpening ? 0 : 1, y: 0 }}
          transition={{ duration: isOpening ? 0.8 : 0.6, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* Caparazón de Sobre Fino */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5EFE6] via-[#EFE7D8] to-[#E5D7C0] shadow-2xl border border-[#C5A059]/40 p-1 sm:p-2">
            <div className="relative rounded-2xl bg-[#FCFAF7] p-6 sm:p-10 text-center border border-[#DFC9A6] shadow-inner">
              {/* Monograma Superior */}
              <div className="mb-4 flex justify-center">
                <span className="font-serif text-2xl tracking-widest text-[#7A5C30] border-b border-[#DFC9A6] pb-1 px-4">
                  {event.brideName[0]} &amp; {event.groomName[0]}
                </span>
              </div>

              {/* Píldora de Pases Asignados */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[13px] font-sans font-semibold border border-[#DECDB3] mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>
                  {guest.familyName} · {guest.maxSeats} {guest.maxSeats === 1 ? "lugar reservado con cariño" : "lugares reservados"}
                </span>
              </div>

              {/* Nombre de Familia Rotulado */}
              <div className="my-6">
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-1 font-sans font-semibold">
                  Invitación de Honor para
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 leading-tight font-normal">
                  {guest.familyName}
                </h2>
                {guest.primaryContactName && guest.primaryContactName !== guest.familyName && (
                  <p className="text-[12px] text-zinc-600 mt-1 font-sans">
                    Atención: {guest.primaryContactName}
                  </p>
                )}
              </div>

              {/* Ciudad y Celebración */}
              <p className="text-[13px] sm:text-sm text-zinc-700 font-sans mb-6">
                Celebración de nuestra boda en {event.venueCity}
              </p>

              {/* Sello de Lacre Interactivo */}
              <div className="relative flex flex-col items-center justify-center my-4">
                <motion.button
                  onClick={handleBreakSeal}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  animate={isOpening ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0] } : {}}
                  transition={{ duration: 0.7 }}
                  className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#8E6D38] via-[#C5A059] to-[#E5C686] text-stone-950 shadow-gold wax-glow flex items-center justify-center cursor-pointer border-2 border-[#FAF4E6]"
                  aria-label="Abrir sobre de invitación"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-dashed border-[#FAF4E6]/60 flex flex-col items-center justify-center">
                    <span className="font-serif font-bold italic text-xl sm:text-2xl text-stone-950">
                      A
                    </span>
                    <Heart className="w-3 h-3 text-stone-950 fill-stone-950/40" />
                  </div>
                </motion.button>

                {/* Botón explícito "Tocar sello para abrir" */}
                <motion.button
                  onClick={handleBreakSeal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#141413] hover:bg-[#8F7138] text-[#FAF7F2] text-[13px] font-sans font-semibold tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#DFC07D] group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">Tocar sello para abrir</span>
                </motion.button>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E8DFC8] text-[12px] text-zinc-600 font-sans">
                {event.venueName} · {event.eventDateFormatted}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
