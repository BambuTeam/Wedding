"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Calendar,
  MapPin,
  Check,
  ArrowRight,
  Music,
  CheckCircle2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function PhoneMockup() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px]">
      {/* Warm emotional floating notification 1 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute -top-6 -left-4 sm:-left-8 z-30 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E8DFC8] shadow-luxury text-left max-w-[240px]"
      >
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Confirmación recibida</span>
        </div>
        <p className="text-xs font-semibold text-carbon-900 mt-1 leading-snug">
          &ldquo;Tía Marta confirmó: ¡Qué alegría acompañarlos! · 2 lugares&rdquo;
        </p>
      </motion.div>

      {/* Warm emotional floating notification 2 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute -bottom-6 -right-4 sm:-right-8 z-30 p-3 sm:p-3.5 rounded-2xl bg-[#1E1C1A]/95 text-white backdrop-blur-xl border border-[#C5A059]/40 shadow-luxury text-left max-w-[230px]"
      >
        <div className="flex items-center gap-1.5 text-[10px] text-[#DFC07D] font-medium">
          <Heart className="w-3 h-3 fill-[#DFC07D]" />
          <span>Pase listo en puerta</span>
        </div>
        <p className="text-xs font-serif italic text-zinc-100 mt-0.5">
          Mesa 1 — Claustro de las Capuchinas
        </p>
      </motion.div>

      {/* iPhone Outer Hardware Frame */}
      <div className="relative rounded-[50px] p-3.5 bg-gradient-to-b from-[#403B35] via-[#24211D] to-[#171513] shadow-2xl border-4 border-[#5E564D]">
        {/* Notch / Speaker */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0F0E0C] rounded-full z-20 flex items-center justify-end pr-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1F1D1A] border border-[#3A3630]" />
        </div>

        {/* Inner Screen */}
        <div className="relative h-[620px] rounded-[40px] overflow-hidden bg-[#FAF7F2] flex flex-col justify-between pt-8 pb-3 px-3 shadow-inner text-carbon-900 select-none">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-medium text-carbon-700 px-4 mb-2">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">Antigua</span>
              <div className="w-4 h-2 rounded-sm border border-carbon-800 flex items-center p-0.5">
                <div className="w-full h-full bg-carbon-800 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Screen Content: The Artisanal Envelope */}
          <div className="flex-1 overflow-hidden relative rounded-2xl bg-[#F5EFE6] border border-[#E0D4BE] p-4 flex flex-col justify-between shadow-inner">
            <AnimatePresence mode="wait">
              {!isOpened ? (
                /* Closed Envelope with Wax Seal */
                <motion.div
                  key="closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-between text-center py-4"
                >
                  <div className="pt-2">
                    <span className="font-serif italic text-lg text-[#8C6D46] tracking-widest block">
                      C &amp; A
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-carbon-500 font-sans mt-0.5 block">
                      Una invitación especial
                    </span>
                  </div>

                  {/* Envelope Body Card */}
                  <div className="w-full p-5 rounded-2xl bg-[#FCFAF7] border border-[#E5DAC6] shadow-sm my-auto">
                    <span className="text-[10px] uppercase tracking-wider text-carbon-400 font-sans block mb-1">
                      Con todo nuestro cariño para
                    </span>
                    <h3 className="font-serif italic text-2xl font-bold text-carbon-900 leading-tight">
                      Familia Rivas Molina
                    </h3>
                    <div className="mt-3 inline-block px-3 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[11px] font-serif italic border border-[#DECDB3]">
                      4 lugares reservados
                    </div>
                  </div>

                  {/* Golden Wax Seal */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setIsOpened(true)}
                      className="group relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#947239] via-[#C5A059] to-[#E5C686] text-carbon-950 shadow-gold wax-glow flex items-center justify-center cursor-pointer border-2 border-[#FAF4E6] hover:scale-105 active:scale-95 transition-transform"
                      title="Toca para abrir la carta"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-dashed border-[#FAF4E6]/60 flex flex-col items-center justify-center">
                        <span className="font-serif font-bold italic text-xl text-carbon-950">
                          A
                        </span>
                        <Heart className="w-2.5 h-2.5 text-carbon-950 fill-carbon-950/40" />
                      </div>
                    </button>
                    <span className="text-[10px] text-carbon-500 uppercase tracking-widest font-sans font-medium mt-3 animate-pulse">
                      Toca el lacre para abrir
                    </span>
                  </div>

                  <p className="text-[10px] text-carbon-400 font-serif italic pb-1">
                    Convento de las Capuchinas • Antigua Guatemala
                  </p>
                </motion.div>
              ) : (
                /* Opened Letter View */
                <motion.div
                  key="opened"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between py-2 text-center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-carbon-500 uppercase tracking-wider border-b border-[#E0D4BE] pb-2">
                      <span>Nuestra Boda</span>
                      <button
                        onClick={() => setIsOpened(false)}
                        className="text-[#947239] hover:underline"
                      >
                        Cerrar sobre
                      </button>
                    </div>

                    <h4 className="font-serif italic text-3xl font-bold text-carbon-900 leading-tight">
                      Camila &amp; Andrés
                    </h4>

                    <p className="font-serif italic text-xs text-carbon-600 px-2 leading-relaxed">
                      &ldquo;Un sí para siempre entre muros coloniales y aroma a azahar. Nos llena el corazón celebrar contigo.&rdquo;
                    </p>

                    <div className="p-3 rounded-xl bg-white border border-[#E5DAC6] text-left text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5 font-serif font-bold text-carbon-800">
                        <Calendar className="w-3.5 h-3.5 text-champagne-600" />
                        <span>Sábado, 28 de Noviembre</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-carbon-600">
                        <MapPin className="w-3.5 h-3.5 text-champagne-600" />
                        <span>Convento de las Capuchinas, Antigua</span>
                      </div>
                    </div>

                    {/* QR Welcome Pass Card */}
                    <div className="p-2.5 rounded-xl bg-[#1E1C1A] text-white flex items-center justify-between text-left">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#DFC07D] font-sans block">
                          Tu pase de bienvenida
                        </span>
                        <span className="font-serif italic text-sm font-bold text-white block">
                          Familia Rivas Molina
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Mesa 1 • 4 personas
                        </span>
                      </div>
                      <div className="bg-white p-1 rounded-lg">
                        <QRCodeSVG value="https://aurea.lat" size={44} />
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/invitacion/rivas-molina"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#947239] to-[#C5A059] text-carbon-950 font-bold text-xs shadow-gold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <span>Ver invitación completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Home Indicator */}
          <div className="w-28 h-1 bg-carbon-400 rounded-full mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}
