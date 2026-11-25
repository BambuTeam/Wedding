"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, Sparkles, ArrowRight, Calendar, MapPin } from "lucide-react";

interface HeroParallaxProps {
  onOpenInvitation: (token: string, eventId: string) => void;
  onOpenCreate: () => void;
}

export function HeroParallax({ onOpenInvitation, onOpenCreate }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms linked to scroll
  const envelopeY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const envelopeScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const card1Y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const card3Y = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const card4Y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col justify-between pt-10 sm:pt-16 pb-12 overflow-hidden"
    >
      {/* Editorial Title (No AI badges or decorative stars) */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="max-w-4xl mx-auto text-center px-6 space-y-6 z-10"
      >
        <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-[5.5rem] text-carbon-900 leading-[1.03] tracking-tight">
          Cada gran historia merece ser anunciada con alma.
        </h1>

        <p className="text-base sm:text-xl text-carbon-600 max-w-2xl mx-auto font-sans leading-relaxed">
          Diseñamos invitaciones digitales a la medida para bodas, XV años, bautizos y eventos especiales. Cada invitado recibe su sobre personal, confirma en un toque y tú organizas todo sin complicaciones.
        </p>

        {/* Clean Pill Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onOpenInvitation("rivas-molina", "camila-andres-2025")}
            className="px-8 py-3.5 rounded-full bg-[#1E1C1A] text-[#FAF7F2] hover:bg-carbon-800 text-xs font-sans font-semibold tracking-wider transition-all shadow-luxury hover:scale-[1.02] flex items-center gap-2 group cursor-pointer"
          >
            <span>Ver una invitación real</span>
            <ArrowRight className="w-4 h-4 text-[#DFC07D] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenCreate}
            className="px-7 py-3.5 rounded-full bg-white hover:bg-[#F5EFE6] border border-[#DFC9A6] text-carbon-800 text-xs font-sans font-semibold tracking-wider transition-all shadow-sm cursor-pointer"
          >
            Crear mi evento
          </button>
        </div>
      </motion.div>

      {/* Central Parallax Scene */}
      <div className="relative w-full max-w-5xl mx-auto mt-12 sm:mt-16 px-4 h-[420px] sm:h-[480px] flex items-center justify-center">
        {/* Floating Event Card 1: Camila & Andrés Boda (Left Top) */}
        <motion.div
          style={{ y: card1Y }}
          onClick={() => onOpenInvitation("rivas-molina", "camila-andres-2025")}
          className="absolute -left-2 sm:left-4 top-4 sm:top-10 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DFC8] shadow-luxury max-w-[210px] cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#7A5C30] font-sans font-semibold block">
            Boda
          </span>
          <p className="font-serif italic text-lg font-bold text-carbon-900 mt-0.5">
            Camila &amp; Andrés
          </p>
          <span className="text-[11px] text-carbon-500 font-serif italic block mt-0.5">
            Convento de las Capuchinas
          </span>
        </motion.div>

        {/* Floating Event Card 2: Sofía Mis XV Años (Right Top) */}
        <motion.div
          style={{ y: card2Y }}
          onClick={() => onOpenInvitation("familia-garcia", "sofia-xv-2026")}
          className="absolute -right-2 sm:right-6 top-8 sm:top-14 z-20 p-4 rounded-2xl bg-[#1E1C1A]/95 text-white backdrop-blur-md border border-[#C5A059]/40 shadow-luxury max-w-[210px] cursor-pointer hover:scale-105 transition-transform text-right"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#DFC07D] font-sans font-semibold block">
            Mis XV Años
          </span>
          <p className="font-serif italic text-lg font-bold text-white mt-0.5">
            Sofía Alejandra
          </p>
          <span className="text-[11px] text-zinc-400 font-serif italic block mt-0.5">
            Hacienda de los Morales
          </span>
        </motion.div>

        {/* Floating Event Card 3: Bautizo de Mateo (Left Bottom) */}
        <motion.div
          style={{ y: card3Y }}
          onClick={() => onOpenInvitation("padrinos-alvarez", "mateo-bautizo-2026")}
          className="absolute left-2 sm:left-12 bottom-6 sm:bottom-12 z-20 p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFC9A6] shadow-luxury max-w-[200px] cursor-pointer hover:scale-105 transition-transform hidden sm:block"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#4A5D4E] font-sans font-semibold block">
            Bautizo
          </span>
          <p className="font-serif italic text-lg font-bold text-carbon-900 mt-0.5">
            Mateo Álvarez
          </p>
          <span className="text-[11px] text-carbon-500 font-serif italic block mt-0.5">
            Jardín Las Bugambilias
          </span>
        </motion.div>

        {/* Floating Event Card 4: Gala Anual (Right Bottom) */}
        <motion.div
          style={{ y: card4Y }}
          onClick={() => onOpenInvitation("delegacion-mexico", "cumbre-ibero-2026")}
          className="absolute right-4 sm:right-16 bottom-4 sm:bottom-10 z-20 p-4 rounded-2xl bg-white/95 border border-[#E8DFC8] shadow-luxury max-w-[210px] cursor-pointer hover:scale-105 transition-transform hidden sm:block text-right"
        >
          <span className="text-[10px] uppercase tracking-widest text-carbon-500 font-sans font-semibold block">
            Gala &amp; Cumbre
          </span>
          <p className="font-serif italic text-lg font-bold text-carbon-900 mt-0.5">
            Gala Anual 2026
          </p>
          <span className="text-[11px] text-carbon-500 font-serif italic block mt-0.5">
            Gran Salón Bellas Artes
          </span>
        </motion.div>

        {/* Center Hero Envelope */}
        <motion.div
          style={{ y: envelopeY, scale: envelopeScale }}
          className="relative w-full max-w-[340px] sm:max-w-[420px] rounded-3xl bg-gradient-to-br from-[#F5EFE6] via-[#EFE7D8] to-[#E5D7C0] p-1.5 shadow-2xl border border-[#C5A059]/40 z-10"
        >
          <div className="relative rounded-2xl bg-[#FCFAF7] p-6 sm:p-8 text-center border border-[#DFC9A6] shadow-inner space-y-4">
            <span className="font-serif italic text-lg text-[#8C6D46] tracking-widest block">
              AUREA · Cartas con Alma
            </span>

            <div className="py-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-carbon-400 font-sans block mb-1">
                Sobre Personalizado
              </span>
              <h3 className="font-serif italic text-3xl font-bold text-carbon-900">
                Familia Rivas Molina
              </h3>
              <span className="text-xs font-serif italic text-[#7A5C30] block mt-1">
                4 lugares reservados con cariño
              </span>
            </div>

            {/* Wax seal */}
            <div className="flex flex-col items-center pt-2">
              <button
                onClick={() => onOpenInvitation("rivas-molina", "camila-andres-2025")}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8E6D38] via-[#C5A059] to-[#E5C686] text-carbon-950 shadow-gold wax-glow flex items-center justify-center border-2 border-white hover:scale-105 transition-transform cursor-pointer"
                title="Toca para abrir la carta"
              >
                <span className="font-serif font-bold italic text-xl">A</span>
              </button>
              <span className="text-[10px] uppercase tracking-widest text-carbon-400 font-sans font-medium mt-2">
                Toca para abrir la carta
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gentle Scroll Prompt */}
      <div className="text-center pt-8 z-10">
        <span className="text-xs uppercase tracking-[0.25em] text-carbon-400 font-sans">
          Desliza para explorar la experiencia
        </span>
      </div>
    </section>
  );
}
