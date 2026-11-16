"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  MapPin,
  QrCode,
  Sparkles,
  Heart,
  Calendar,
  Clock,
  ShieldCheck,
  Send,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function PhoneMockup() {
  const [activeTab, setActiveTab] = useState<"sobre" | "rsvp" | "mesas" | "qr">("sobre");

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[370px]">
      {/* Floating iOS Notifications */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -top-6 -left-6 sm:-left-12 z-30 p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-champagne-300 shadow-luxury text-left max-w-[220px]"
      >
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Tracking en Vivo • hace 2 min</span>
        </div>
        <p className="text-xs font-bold text-carbon-900 mt-0.5">
          Familia Rivas abrió el sobre
        </p>
      </motion.div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute -bottom-6 -right-6 sm:-right-10 z-30 p-3 rounded-2xl bg-carbon-900/90 text-white backdrop-blur-xl border border-champagne-500/40 shadow-luxury text-left max-w-[220px]"
      >
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span>Control Puerta • hace 30s</span>
        </div>
        <p className="text-xs font-semibold text-zinc-100 mt-0.5">
          Pase QR escaneado y validado
        </p>
      </motion.div>

      {/* iPhone Outer Hardware Frame */}
      <div className="relative rounded-[48px] p-3.5 bg-gradient-to-b from-[#3A3D40] via-[#1E2022] to-[#121314] shadow-2xl border-4 border-[#52575D]">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-end pr-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#181A1C] border border-[#2B2E33]" />
        </div>

        {/* Inner Screen */}
        <div className="relative h-[620px] rounded-[38px] overflow-hidden bg-alabaster-100 flex flex-col justify-between pt-8 pb-3 px-3 shadow-inner text-carbon-900 select-none">
          {/* Mock Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-carbon-800 px-4 mb-2">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-4 h-2 rounded-sm border border-carbon-800 flex items-center p-0.5">
                <div className="w-full h-full bg-carbon-800 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Interactive Mock Content Area */}
          <div className="flex-1 overflow-hidden relative rounded-2xl bg-white shadow-sm border border-carbon-200/60 p-4 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeTab === "sobre" && (
                <motion.div
                  key="sobre"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center p-2"
                >
                  <span className="text-[10px] uppercase tracking-widest text-champagne-700 font-semibold mb-2">
                    Sobre Digital de Lujo
                  </span>
                  <div className="p-4 rounded-2xl bg-alabaster-100 border border-champagne-300 w-full mb-4 shadow-sm">
                    <p className="font-serif italic text-2xl font-bold text-carbon-900">
                      Familia Rivas Molina
                    </p>
                    <span className="text-[11px] text-carbon-500 block mt-1">
                      4 Lugares Exclusivos
                    </span>
                  </div>

                  {/* Wax seal */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9A7B3E] to-[#DFC07D] shadow-gold flex items-center justify-center border-2 border-white mb-3 cursor-pointer">
                    <span className="font-serif font-bold italic text-lg text-carbon-950">
                      A
                    </span>
                  </div>
                  <span className="text-[10px] text-carbon-400 uppercase tracking-wider font-semibold">
                    Toca para romper el sello
                  </span>
                </motion.div>
              )}

              {activeTab === "rsvp" && (
                <motion.div
                  key="rsvp"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col justify-between p-1"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-champagne-700 uppercase tracking-widest block mb-1">
                      RSVP Inteligente
                    </span>
                    <h4 className="font-serif italic text-xl font-bold text-carbon-900">
                      Confirmación de Pases
                    </h4>
                    <p className="text-[11px] text-carbon-500 mt-1">
                      Máximo permitido: 4 personas
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-champagne-50 border border-champagne-300 flex items-center justify-between">
                      <span className="text-xs font-semibold text-carbon-800">Lugares a asistir:</span>
                      <span className="font-serif text-xl font-bold text-champagne-800">4 de 4</span>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-alabaster-100 border border-carbon-200 text-[11px] text-carbon-600">
                      🥗 1 Menú celíaco / sin gluten
                    </div>
                  </div>

                  <div className="w-full py-2.5 rounded-xl bg-champagne-500 text-carbon-950 font-bold text-xs text-center shadow-gold">
                    ✓ Confirmado y Pase Generado
                  </div>
                </motion.div>
              )}

              {activeTab === "mesas" && (
                <motion.div
                  key="mesas"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col justify-between p-1"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-champagne-700 uppercase tracking-widest block mb-1">
                      Kit del Día • Seating
                    </span>
                    <h4 className="font-serif italic text-xl font-bold text-carbon-900">
                      Tu Mesa en la Boda
                    </h4>

                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-carbon-900 to-carbon-950 text-white border border-champagne-500/40 text-center">
                      <span className="text-[10px] text-champagne-400 uppercase tracking-wider block">
                        Mesa Asignada
                      </span>
                      <p className="font-serif italic text-2xl font-bold text-white mt-1">
                        Mesa 1 — Claustro
                      </p>
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        Junto a la fuente central del claustro
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] text-center font-medium">
                    📍 Wi-Fi: Capuchinas_Eventos_5G
                  </div>
                </motion.div>
              )}

              {activeTab === "qr" && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-between text-center p-1"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-champagne-700 uppercase tracking-widest block">
                      Acceso Rápido
                    </span>
                    <h4 className="font-serif italic text-xl font-bold text-carbon-900">
                      Pase QR VIP
                    </h4>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border-2 border-champagne-400 shadow-inner">
                    <QRCodeSVG
                      value="https://aurea.lat/invitacion/rivas-molina"
                      size={135}
                    />
                  </div>

                  <div className="w-full">
                    <span className="text-[10px] font-mono text-carbon-400 uppercase block mb-1">
                      TOKEN: rivas-molina
                    </span>
                    <div className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-[11px]">
                      Enviar respaldo por WhatsApp
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Screen Tabs */}
          <div className="mt-3 grid grid-cols-4 gap-1 p-1 rounded-2xl bg-carbon-200/70 text-[10px] font-semibold text-carbon-700">
            <button
              onClick={() => setActiveTab("sobre")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "sobre" ? "bg-white text-carbon-900 shadow-sm font-bold" : ""
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => setActiveTab("rsvp")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "rsvp" ? "bg-white text-carbon-900 shadow-sm font-bold" : ""
              }`}
            >
              RSVP
            </button>
            <button
              onClick={() => setActiveTab("mesas")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "mesas" ? "bg-white text-carbon-900 shadow-sm font-bold" : ""
              }`}
            >
              Mesas
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "qr" ? "bg-white text-carbon-900 shadow-sm font-bold" : ""
              }`}
            >
              Pase QR
            </button>
          </div>

          {/* Bottom Home Indicator */}
          <div className="w-32 h-1 bg-carbon-400 rounded-full mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}
