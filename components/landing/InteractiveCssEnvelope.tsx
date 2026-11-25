"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Sparkles, CheckCircle2, QrCode, ArrowRight } from "lucide-react";

interface InteractiveCssEnvelopeProps {
  onOpenModal: () => void;
}

export function InteractiveCssEnvelope({ onOpenModal }: InteractiveCssEnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // GSAP Refs
  const envelopeContainerRef = useRef<HTMLDivElement>(null);
  const envelopeBodyRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const levitationTween = useRef<gsap.core.Tween | null>(null);

  // QuickTo setters para atracción magnética fluida del sello
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const quickRotate = useRef<gsap.QuickToFunc | null>(null);

  // Acorde de arpa acústica suave con Web Audio API
  const playHarpAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const frequencies = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + idx * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 1.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 1.4);
      });
    } catch {
      // Ignorar restricciones de autoplay
    }
  };

  // Inicializar física táctil, levitación y timeline GSAP
  useEffect(() => {
    // 1. Respiración / Micro-levitación casi imperceptible en reposo
    if (envelopeContainerRef.current) {
      levitationTween.current = gsap.to(envelopeContainerRef.current, {
        y: -4,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }

    // 2. Destello especular diagonal lento sobre el lacre
    if (sheenRef.current) {
      gsap.to(sheenRef.current, {
        x: 45,
        opacity: 0.8,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // 3. QuickTo para el efecto magnético suave
    if (sealRef.current) {
      quickX.current = gsap.quickTo(sealRef.current, "x", { duration: 0.35, ease: "power2.out" });
      quickY.current = gsap.quickTo(sealRef.current, "y", { duration: 0.35, ease: "power2.out" });
      quickRotate.current = gsap.quickTo(sealRef.current, "rotation", { duration: 0.4, ease: "power2.out" });
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const cardTargetY = isMobile ? -52 : -68;

    // Timeline reversible de apertura/cierre ponderada
    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setIsOpen(true);
        levitationTween.current?.pause();
      },
      onReverseComplete: () => {
        setIsOpen(false);
        levitationTween.current?.resume();
      },
    });

    // Acto 1: Sello se hunde y se disuelve
    if (sealRef.current) {
      tl.to(sealRef.current, { scale: 0.9, duration: 0.18, ease: "power2.in" }, 0);
      tl.to(
        sealRef.current,
        {
          scale: 1.18,
          opacity: 0,
          filter: "drop-shadow(0 0 20px #E5C378)",
          duration: 0.35,
          ease: "power2.out",
        },
        0.18
      );
    }

    // Acto 2: Solapa Euro-Flap gira 180° con peso
    if (flapRef.current) {
      tl.to(
        flapRef.current,
        {
          rotateX: 180,
          duration: 1.05,
          ease: "power2.inOut",
          transformOrigin: "50% 0%",
          onUpdate: function () {
            if (flapRef.current) {
              flapRef.current.style.zIndex = this.progress() > 0.48 ? "15" : "40";
            }
          },
        },
        0.35
      );
    }

    // Acto 3: Carta interior emerge con gracia
    if (letterRef.current && envelopeBodyRef.current) {
      tl.to(
        letterRef.current,
        {
          y: cardTargetY,
          opacity: 1,
          scale: 1.01,
          duration: 1.1,
          ease: "power3.out",
        },
        1.1
      );

      tl.to(
        envelopeBodyRef.current,
        {
          y: 28,
          duration: 1.1,
          ease: "power3.out",
        },
        1.1
      );
    }

    tlRef.current = tl;

    return () => {
      tl.kill();
      levitationTween.current?.kill();
    };
  }, []);

  // Atracción magnética del cursor hacia el sello
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpen || !sealRef.current || !quickX.current || !quickY.current || !quickRotate.current) return;

    const rect = sealRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < 200) {
      quickX.current(distanceX * 0.16);
      quickY.current(distanceY * 0.16);
      quickRotate.current(distanceX * 0.06);
    } else {
      quickX.current(0);
      quickY.current(0);
      quickRotate.current(0);
    }
  };

  const handleMouseLeave = () => {
    if (isOpen || !quickX.current || !quickY.current || !quickRotate.current) return;
    quickX.current(0);
    quickY.current(0);
    quickRotate.current(0);
  };

  // Alternar apertura/cierre
  const handleToggle = () => {
    if (!isOpen) {
      playHarpAudio();
      tlRef.current?.play();
      setIsOpen(true);
    } else {
      tlRef.current?.reverse();
      setIsOpen(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-10 w-full max-w-[480px] mx-auto py-2 select-none"
    >
      {/* =====================================================================
          NOTIFICACIONES FLOTANTES (REPOSICIONADAS: CERO SOLAPAMIENTO)
          ===================================================================== */}

      {/* Notificación 1: Lectura (En la esquina inferior izquierda: -left-8 bottom-14) */}
      <motion.div
        initial={{ opacity: 0, y: 15, x: -10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute -left-3 sm:-left-6 lg:-left-8 bottom-12 sm:bottom-14 z-30 flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DFC9A6]/70 shadow-[0_12px_28px_rgba(20,20,19,0.08)] pointer-events-none"
      >
        <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
        </span>
        <div className="text-left">
          <p className="text-[11px] sm:text-[13px] font-semibold text-zinc-900 font-sans leading-tight">
            Familia Rivas Molina abrió su sobre
          </p>
          <p className="text-[10px] sm:text-[11px] text-zinc-600 font-sans mt-0.5">Hace 2 min · Vía WhatsApp</p>
        </div>
      </motion.div>

      {/* Notificación 2: Confirmación (En la esquina inferior derecha: -right-4 -bottom-10) */}
      <motion.div
        initial={{ opacity: 0, y: 15, x: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute -right-2 lg:-right-4 -bottom-10 z-30 flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DFC9A6]/70 shadow-[0_12px_28px_rgba(20,20,19,0.08)] pointer-events-none"
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] sm:text-[13px] font-semibold text-zinc-900 font-sans leading-tight">
            Tía Marta confirmó asistencia
          </p>
          <p className="text-[10px] sm:text-[11px] text-zinc-600 font-sans mt-0.5">2 lugares · Mesa 4 (Claustro)</p>
        </div>
      </motion.div>

      {/* =====================================================================
          CONTENEDOR 3D DEL SOBRE (PERSPECTIVA 1400px & ASPECTO FLUIDO 1.42/1)
          ===================================================================== */}
      <div
        ref={envelopeContainerRef}
        onClick={handleToggle}
        className="relative w-[min(92vw,460px)] aspect-[1.42/1] mx-auto cursor-pointer group"
        style={{ perspective: "1400px" }}
      >
        {/* Sombra de apoyo realista */}
        <div className="absolute inset-x-8 -bottom-5 h-8 bg-stone-900/12 rounded-full blur-xl transition-all duration-500 group-hover:scale-105 group-hover:bg-stone-900/18" />

        {/* Estructura del Sobre en 3D */}
        <div
          ref={envelopeBodyRef}
          className="relative w-full h-full rounded-2xl overflow-visible transition-transform duration-700 ease-out group-hover:-translate-y-1"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* =================================================================
              CAPA 1 (z-10): Espalda & Forro Verde Bosque (#1B2B23)
              Llega hasta el borde superior (filete de solo 2px de papel marfil)
              ================================================================= */}
          <div
            className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden z-10"
            style={{
              backgroundColor: "#EAE2D3",
              boxShadow: "0 20px 45px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.25) inset",
            }}
          >
            {/* Forro interior verde bosque con patrón de rombos dorados */}
            <div
              className="absolute inset-x-[2px] top-[2px] bottom-[2px] rounded-[14px] overflow-hidden"
              style={{
                backgroundColor: "#1B2B23",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.4) inset",
              }}
            >
              <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="gold-lining-hero" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M14 0 L28 14 L14 28 L0 14 Z" fill="none" stroke="#C5A059" strokeWidth="0.75" />
                    <circle cx="14" cy="14" r="1.3" fill="#C5A059" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gold-lining-hero)" />
              </svg>
            </div>
          </div>

          {/* =================================================================
              CAPA 2 (z-20): Carta Interior (Emerge limpia)
              Posicionada a y: 24 y opacity: 0 en reposo para CERO texto asomando cerrado
              ================================================================= */}
          <div
            ref={letterRef}
            className="absolute inset-x-4 sm:inset-x-7 top-3 bottom-5 z-20 rounded-2xl bg-[#FFFDF9] border border-[#E8DFC8] shadow-[0_12px_28px_rgba(20,20,19,0.12)] p-3 sm:p-5 flex flex-col justify-between text-center select-none"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              willChange: "transform, opacity",
            }}
          >
            {/* Doble filete editorial dorado */}
            <div className="absolute inset-1.5 sm:inset-2.5 rounded-xl border border-[#C5A059]/35 pointer-events-none" />

            {/* Cabecera */}
            <div className="space-y-0.5 relative z-10">
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-[#8F7138] font-sans font-bold block">
                Nuestra Boda
              </span>
              <h3 className="font-serif text-[clamp(1.2rem,4vw,1.9rem)] text-zinc-900 leading-tight font-normal">
                Camila <span className="text-[#C5A059] font-light">&amp;</span> Andrés
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-600 font-sans">
                Sábado, 28 de Noviembre · Antigua Guatemala
              </p>
            </div>

            {/* Destinatario Personalizado */}
            <div className="py-1.5 sm:py-2 border-y border-[#E8DFC8]/75 my-auto relative z-10">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-sans block mb-0.5 font-semibold">
                Pase Personal Reservado
              </span>
              <p className="font-sans text-sm sm:text-lg font-bold text-zinc-900">
                Familia Rivas Molina
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-[#7A5C30] font-sans font-medium mt-0.5">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C5A059]" />
                4 lugares reservados con cariño
              </span>
            </div>

            {/* Pie con mini QR */}
            <div className="flex items-center justify-between text-left relative z-10 pt-0.5 sm:pt-1">
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-sans font-medium">
                  Recepción
                </p>
                <p className="text-[11px] sm:text-[12px] font-sans text-zinc-900 font-semibold">
                  Mesa 1 · Capuchinas
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-zinc-700">
                  <QrCode className="w-3.5 h-3.5 text-[#8F7138]" />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              CAPA 3 (z-30): Bolsillo Delantero en V Limpia con 3 Pliegues
              1. Solapa lateral izquierda
              2. Solapa lateral derecha
              3. Solapa inferior central con punta redondeada en y: 170
              ================================================================= */}
          <div
            className="absolute inset-0 rounded-b-2xl pointer-events-none z-30"
            style={{ transformStyle: "preserve-3d" }}
          >
            <svg
              viewBox="0 0 500 338"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Pieza 1: Solapa lateral izquierda */}
              <g style={{ filter: "drop-shadow(2px 0 4px rgba(0,0,0,0.06))" }}>
                <path
                  d="M 0 16 L 250 205 L 16 338 A 16 16 0 0 1 0 322 Z"
                  fill="#E1D8C5"
                />
                <path
                  d="M 0 16 L 250 205"
                  stroke="#D4C8B4"
                  strokeWidth="0.75"
                  opacity="0.8"
                />
              </g>

              {/* Pieza 2: Solapa lateral derecha */}
              <g style={{ filter: "drop-shadow(-2px 0 4px rgba(0,0,0,0.06))" }}>
                <path
                  d="M 500 16 L 250 205 L 484 338 A 16 16 0 0 1 500 322 Z"
                  fill="#E1D8C5"
                />
                <path
                  d="M 500 16 L 250 205"
                  stroke="#D4C8B4"
                  strokeWidth="0.75"
                  opacity="0.8"
                />
              </g>

              {/* Pieza 3: Solapa inferior central con punta redondeada en y: 170 */}
              <g style={{ filter: "drop-shadow(0 -4px 10px rgba(0, 0, 0, 0.12))" }}>
                <path
                  d="M 0 230 C 80 220, 190 178, 242 172 Q 250 170, 258 172 C 310 178, 420 220, 500 230 L 500 322 A 16 16 0 0 1 484 338 L 16 338 A 16 16 0 0 1 0 322 Z"
                  fill="#E5DCC9"
                  stroke="#D4C8B4"
                  strokeWidth="1"
                />
                {/* Líneas sutiles de pliegue */}
                <path
                  d="M 0 230 L 242 172"
                  stroke="#D4C8B4"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
                <path
                  d="M 500 230 L 258 172"
                  stroke="#D4C8B4"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
              </g>
            </svg>

            {/* Rótulo dorado sutil en la base del sobre */}
            <div className="absolute bottom-2 inset-x-0 text-center z-35 pointer-events-none">
              <span className="font-serif italic text-[9px] sm:text-[11px] text-[#7A643B] tracking-wider opacity-85">
                AUREA ATELIER · INVITACIÓN DE HONOR
              </span>
            </div>
          </div>

          {/* =================================================================
              CAPA 4 (z-40 cerrando -> z-15 al pasar 90deg): Solapa Superior Euro-Flap 3D
              Bisagra exacta en top: 0 (y = 0).
              Al girar 180° sobre X, la base se mantiene en y = 0 y la punta redondeada
              apunta limpiamente HACIA ARRIBA con forro verde bordeado de 11px marfil.
              ================================================================= */}
          <div
            ref={flapRef}
            className="absolute top-0 inset-x-0 h-[55%] z-40 origin-top cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "50% 0%",
              willChange: "transform, z-index",
            }}
          >
            {/* Cara Exterior de la Solapa (Marfil cálido cuando está cerrado) */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <svg
                viewBox="0 0 500 186"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
                }}
              >
                <path
                  d="M 0 16 A 16 16 0 0 1 16 0 L 484 0 A 16 16 0 0 1 500 16 C 472 60, 320 170, 258 184 Q 250 186, 242 184 C 180 170, 28 60, 0 16 Z"
                  fill="#E6DEC8"
                  stroke="#D4C8B4"
                  strokeWidth="0.75"
                />
              </svg>
            </div>

            {/* Cara Interior de la Solapa (rotateY(180deg): al girar el padre 180° en X, la punta queda HACIA ARRIBA)
                Forro verde bosque con borde exterior marfil de 11px perimetral */}
            <div
              className="absolute inset-0"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <svg
                viewBox="0 0 500 186"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: "drop-shadow(0 -4px 10px rgba(0,0,0,0.25))",
                }}
              >
                <defs>
                  <clipPath id="flap-inner-lining-clip-hero">
                    <path d="M 24 4 L 476 4 C 454 48, 308 158, 256 171 Q 250 173, 244 171 C 192 158, 46 48, 24 4 Z" />
                  </clipPath>
                </defs>

                {/* 1. Base completa de papel marfil cálido (#E6DEC8) */}
                <path
                  d="M 0 16 A 16 16 0 0 1 16 0 L 484 0 A 16 16 0 0 1 500 16 C 472 60, 320 170, 258 184 Q 250 186, 242 184 C 180 170, 28 60, 0 16 Z"
                  fill="#E6DEC8"
                  stroke="#D4C8B4"
                  strokeWidth="0.75"
                />

                {/* 2. Forro interior verde bosque (#1B2B23) con borde exterior marfil de 11px */}
                <path
                  d="M 24 4 L 476 4 C 454 48, 308 158, 256 171 Q 250 173, 244 171 C 192 158, 46 48, 24 4 Z"
                  fill="#1B2B23"
                  stroke="#C5A059"
                  strokeWidth="0.75"
                />

                {/* 3. Trama dorada de rombos sobre el forro verde */}
                <g clipPath="url(#flap-inner-lining-clip-hero)">
                  <rect width="100%" height="100%" fill="url(#gold-lining-hero)" opacity="0.3" />
                </g>

                {/* Sombra sutil en la bisagra de doblez */}
                <line x1="16" y1="0" x2="484" y2="0" stroke="#0E1712" strokeWidth="2" opacity="0.35" />
              </svg>
            </div>
          </div>

          {/* =================================================================
              CAPA 5 (z-50): Sello de Lacre Dorado con Física Magnética GSAP
              ================================================================= */}
          <button
            ref={sealRef}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="absolute z-50 w-13 h-13 sm:w-16 sm:h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 group focus:outline-none"
            style={{
              top: "calc(55% - 1.625rem)",
              left: "calc(50% - 1.625rem)",
              background: "radial-gradient(circle at 35% 35%, #F8E6B8 0%, #C5A059 50%, #8A6A2E 100%)",
              boxShadow: "0 12px 26px -4px rgba(138, 106, 46, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.6)",
            }}
            title="Toca para abrir o cerrar"
          >
            {/* Borde irregular de lacre fundido */}
            <div className="absolute -inset-1 rounded-full border border-[#8A6A2E]/40 opacity-70 pointer-events-none" />

            {/* Brillo especular dinámico */}
            <div
              ref={sheenRef}
              className="absolute top-1 left-2 w-4 h-2.5 rounded-full bg-white/45 blur-[1px] pointer-events-none"
            />

            {/* Anillo de relieve grabado con monograma */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#DFB86C] flex items-center justify-center shadow-inner">
              <span className="font-serif text-xs sm:text-base font-bold text-[#4B3712] tracking-widest drop-shadow-sm">
                C&amp;A
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          INDICADOR DE ACCIÓN INFERIOR (ESPACIADO LIMPIO RESPECTO A LOS BADGES)
          ===================================================================== */}
      <div className="text-center mt-14 sm:mt-18 relative z-20">
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-sans font-medium text-zinc-700 hover:text-zinc-900 transition-colors group cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] group-hover:rotate-12 transition-transform" />
          <span>✨ Toca el sello para abrir o explorar</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
