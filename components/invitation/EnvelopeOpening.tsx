"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { EventMeta, Guest } from "@/lib/types";

interface EnvelopeOpeningProps {
  event: EventMeta;
  guest: Guest;
  onOpenComplete: () => void;
  onOpenStart?: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

export function EnvelopeOpening({
  event,
  guest,
  onOpenComplete,
  onOpenStart,
  isAudioMuted,
  onToggleAudio,
}: EnvelopeOpeningProps) {
  const [isOpening, setIsOpening] = useState(false);

  // Refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const envelopeContainerRef = useRef<HTMLDivElement>(null);
  const envelopeBodyRef = useRef<HTMLDivElement>(null);
  const flapContainerRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const hintTextRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  // Breathing & levitation tween refs
  const levitationTween = useRef<gsap.core.Tween | null>(null);

  // QuickTo setters para atracción magnética fluida del sello
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const quickRotate = useRef<gsap.QuickToFunc | null>(null);

  const monogram = `${(event.brideName || event.title)[0] || "A"}&${(event.groomName || "E")[0] || "E"}`;

  // Acorde de arpa acústica suave con Web Audio API
  const playHarpAudio = () => {
    if (isAudioMuted) return;
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
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 1.5);
      });
    } catch {
      // Ignorar restricciones de autoplay
    }
  };

  // Inicializar física táctil, levitación y atracción magnética
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
        x: 50,
        opacity: 0.85,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // 3. QuickTo para el efecto magnético suave
    if (sealRef.current) {
      quickX.current = gsap.quickTo(sealRef.current, "x", {
        duration: 0.35,
        ease: "power2.out",
      });
      quickY.current = gsap.quickTo(sealRef.current, "y", {
        duration: 0.35,
        ease: "power2.out",
      });
      quickRotate.current = gsap.quickTo(sealRef.current, "rotation", {
        duration: 0.4,
        ease: "power2.out",
      });
    }

    return () => {
      levitationTween.current?.kill();
    };
  }, []);

  // Seguimiento magnético suave del cursor
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpening || !sealRef.current || !quickX.current || !quickY.current || !quickRotate.current) return;

    const rect = sealRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < 240) {
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
    if (isOpening || !quickX.current || !quickY.current || !quickRotate.current) return;
    quickX.current(0);
    quickY.current(0);
    quickRotate.current(0);
  };

  // =========================================================================
  // COREOGRAFÍA CINEMATOGRÁFICA EN 4 ACTOS PONDERADOS (GSAP ~3.4s TOTAL)
  // =========================================================================
  const handleTriggerOpen = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Disparar inicio de audio síncrono al gesto del usuario (crítico para Safari/iOS y YouTube Player API)
    onOpenStart?.();

    // Detener la micro-levitación al iniciar apertura
    levitationTween.current?.kill();

    playHarpAudio();

    const tl = gsap.timeline({
      onComplete: () => {
        onOpenComplete();
      },
    });

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const cardTargetY = isMobile ? -120 : -175;

    // -----------------------------------------------------------------------
    // ACTO 1: (0.0s → 0.55s) Ruptura Táctil del Sello de Lacre
    // -----------------------------------------------------------------------
    if (hintTextRef.current) {
      tl.to(hintTextRef.current, { opacity: 0, duration: 0.2, ease: "power1.out" }, 0);
    }

    if (sealRef.current) {
      // Micro-hundimiento suave por contacto
      tl.to(sealRef.current, { scale: 0.9, duration: 0.18, ease: "power2.in" }, 0);
      // Halo dorado radial y disolución elegante
      tl.to(
        sealRef.current,
        {
          scale: 1.18,
          opacity: 0,
          filter: "drop-shadow(0 0 24px #E5C378)",
          duration: 0.35,
          ease: "power2.out",
        },
        0.18
      );
    }

    // -----------------------------------------------------------------------
    // ACTO 2: (0.40s → 1.45s) Apertura Ponderada de la Solapa (duration: 1.05s)
    // -----------------------------------------------------------------------
    if (flapContainerRef.current) {
      tl.to(
        flapContainerRef.current,
        {
          rotateX: 180,
          duration: 1.05,
          ease: "power2.inOut",
          transformOrigin: "50% 0%",
          onUpdate: function () {
            // Al superar los 90deg, pasa a z-index 15 (detrás de la carta z-20)
            if (this.progress() > 0.48 && flapContainerRef.current) {
              flapContainerRef.current.style.zIndex = "15";
            }
          },
        },
        0.4
      );
    }

    // -----------------------------------------------------------------------
    // ACTO 3: (1.25s → 2.45s) Extracción Pausada del Pliego (duration: 1.2s)
    // -----------------------------------------------------------------------
    if (letterRef.current && envelopeBodyRef.current) {
      // La carta de papel algodón emerge con suavidad hacia arriba
      tl.to(
        letterRef.current,
        {
          y: cardTargetY,
          opacity: 1,
          scale: 1.02,
          duration: 1.2,
          ease: "power3.out",
        },
        1.25
      );

      // El cuerpo del sobre desciende ligeramente para equilibrar el encuadre
      tl.to(
        envelopeBodyRef.current,
        {
          y: 55,
          duration: 1.2,
          ease: "power3.out",
        },
        1.25
      );
    }

    // -----------------------------------------------------------------------
    // ACTO 4: (2.35s → 3.40s) Transición Editorial al Pliego Completo (duration: 1.05s)
    // -----------------------------------------------------------------------
    if (envelopeContainerRef.current && overlayRef.current) {
      // El sobre se desvanece hacia abajo con suavidad
      tl.to(
        envelopeContainerRef.current,
        {
          y: 150,
          opacity: 0,
          duration: 1.05,
          ease: "power2.inOut",
        },
        2.35
      );

      // El overlay oscuro se disuelve para revelar la invitación a pantalla completa
      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.95,
          ease: "power2.inOut",
        },
        2.45
      );
    }
  };

  return (
    <div
      ref={overlayRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none"
      style={{
        background: "radial-gradient(circle at 50% 45%, #23201C 0%, #161513 70%, #0E0D0C 100%)",
        perspective: 1400,
      }}
    >
      {/* Botón de Audio Superior */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 flex items-center gap-3 text-white/70">
        <button
          onClick={onToggleAudio}
          className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          title={isAudioMuted ? "Activar audio" : "Silenciar audio"}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Contenedor Maestro del Sobre en Perspectiva 3D (Fluido y Proporcional: w-[min(92vw,460px)] aspect-[1.42/1]) */}
      <div
        ref={envelopeContainerRef}
        className="relative w-[min(92vw,460px)] aspect-[1.42/1] flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ===================================================================
            CUERPO UNIFICADO DEL SOBRE (#envelope-body)
            Agrupa Espalda/Forro (z-10), Carta (z-20), Bolsillo 3 Pliegues (z-30)
            y Solapa 3D para movimiento en bloque.
            =================================================================== */}
        <div
          ref={envelopeBodyRef}
          id="envelope-body"
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ===================================================================
              CAPA 1 (z-10): Espalda & Forro Verde Bosque (#1B2B23)
              Llega hasta el borde superior (filete fino de 2px de papel marfil)
              =================================================================== */}
          <div
            className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden z-10"
            style={{
              backgroundColor: "#EAE2D3",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15) inset",
            }}
          >
            {/* Forro interior verde bosque con patrón de rombos dorados */}
            <div
              className="absolute inset-x-[2px] top-[2px] bottom-[2px] rounded-[14px] overflow-hidden"
              style={{
                backgroundColor: "#1B2B23",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.45) inset",
              }}
            >
              <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="gold-lining-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M16 0 L32 16 L16 32 L0 16 Z" fill="none" stroke="#C5A059" strokeWidth="0.75" />
                    <circle cx="16" cy="16" r="1.5" fill="#C5A059" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gold-lining-pattern)" />
              </svg>
            </div>
          </div>

          {/* ===================================================================
              CAPA 2 (z-20): El Pliego / Carta de Invitación (Dentro del bolsillo)
              Tipografía responsive con clamp para pantallas de 360px a 2560px
              =================================================================== */}
          <div
            ref={letterRef}
            className="absolute inset-x-4 sm:inset-x-7 top-3 bottom-4 rounded-xl z-20 pointer-events-none p-3.5 sm:p-6 flex flex-col justify-between text-center select-none"
            style={{
              backgroundColor: "#FAF8F5",
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(184, 151, 88, 0.3) inset",
              opacity: 0,
              transform: "translateY(24px)",
              willChange: "transform, opacity",
            }}
          >
            {/* Doble filete dorado */}
            <div className="absolute inset-2 sm:inset-3 rounded-lg border border-[#B89758]/40 pointer-events-none" />

            {/* Encabezado */}
            <div className="space-y-0.5 sm:space-y-1 relative z-10">
              <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F4EDE0] border border-[#DFC9A6] text-[#7A5C30] font-serif text-[11px] sm:text-xs font-bold mx-auto mb-0.5">
                {monogram}
              </div>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[#8C6D46] font-bold block">
                {event.category || "Invitación Exclusiva"}
              </span>
            </div>

            {/* Título de la Celebración (Clamped) */}
            <div className="relative z-10 py-0.5">
              <h3 className="font-serif text-[clamp(1.25rem,4.2vw,2.2rem)] text-zinc-900 tracking-tight leading-tight font-normal">
                {event.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-600 font-serif italic mt-0.5 max-w-xs mx-auto truncate">
                {event.tagline || "Nos complace celebrar este gran momento"}
              </p>
            </div>

            {/* Dedicatoria a la familia invitada */}
            <div className="relative z-10 border-t border-[#B89758]/20 pt-1.5 sm:pt-2 text-[9px] sm:text-xs text-zinc-600">
              <span>Para: </span>
              <strong className="text-zinc-900 font-semibold">{guest.familyName}</strong>
              <span className="text-zinc-500 block text-[8px] sm:text-[9px] mt-0.5">
                {guest.maxSeats} {guest.maxSeats === 1 ? "lugar reservado" : "lugares reservados"} · {event.venueCity}
              </span>
            </div>
          </div>

          {/* ===================================================================
              CAPA 3 (z-30): Bolsillo Delantero en V Limpia con 3 Pliegues
              1. Solapa lateral izquierda
              2. Solapa lateral derecha
              3. Solapa inferior central con punta redondeada que cubre las uniones
              =================================================================== */}
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

            {/* Rótulo dorado sutil en la base del bolsillo */}
            <div className="absolute bottom-2 inset-x-0 text-center z-35 pointer-events-none">
              <span className="font-serif italic text-[9px] sm:text-xs text-[#7A643B] tracking-wider opacity-85">
                Invitación de Honor · {guest.familyName}
              </span>
            </div>
          </div>

          {/* ===================================================================
              CAPA 4 (z-40 cerrando -> z-15 al pasar 90deg): Solapa Superior Euro-Flap
              Bisagra exacta en top: 0 (y = 0).
              Al girar 180° sobre X, la base se mantiene en y = 0 y la punta redondeada
              apunta limpiamente HACIA ARRIBA con forro verde bordeado de 11px marfil.
              =================================================================== */}
          <div
            ref={flapContainerRef}
            className="absolute top-0 inset-x-0 h-[55%] z-40 origin-top cursor-pointer"
            onClick={handleTriggerOpen}
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
                  <clipPath id="flap-inner-lining-clip">
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
                <g clipPath="url(#flap-inner-lining-clip)">
                  <rect width="100%" height="100%" fill="url(#gold-lining-pattern)" opacity="0.3" />
                </g>

                {/* Sombra sutil en la bisagra de doblez */}
                <line x1="16" y1="0" x2="484" y2="0" stroke="#0E1712" strokeWidth="2" opacity="0.35" />
              </svg>
            </div>
          </div>

          {/* ===================================================================
              CAPA 5 (z-50): Sello de Lacre Dorado Interactivo con Física Magnética
              =================================================================== */}
          <button
            ref={sealRef}
            onClick={handleTriggerOpen}
            className="absolute z-50 w-14 h-14 sm:w-18 sm:h-18 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 group focus:outline-none"
            style={{
              top: "calc(55% - 1.75rem)",
              left: "calc(50% - 1.75rem)",
              background: "radial-gradient(circle at 35% 35%, #F8E6B8 0%, #C5A059 50%, #8A6A2E 100%)",
              boxShadow: "0 14px 30px -4px rgba(138, 106, 46, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.6)",
            }}
            title="Toca para romper el sello y abrir"
          >
            {/* Borde irregular de lacre fundido */}
            <div className="absolute -inset-1 rounded-full border-2 border-[#8A6A2E]/40 opacity-70 pointer-events-none" />

            {/* Brillo especular dinámico */}
            <div
              ref={sheenRef}
              className="absolute top-1 left-2 w-4 h-2.5 rounded-full bg-white/45 blur-[1px] pointer-events-none"
            />

            {/* Anillo de relieve grabado con monograma */}
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full border border-[#DFB86C] flex items-center justify-center shadow-inner">
              <span className="font-serif text-xs sm:text-base font-bold text-[#4B3712] tracking-widest drop-shadow-sm">
                {monogram}
              </span>
            </div>
          </button>
        </div>

        {/* Indicador de Ayuda inferior (Fase 1: Se desvanece al clic) */}
        <div
          ref={hintTextRef}
          className="absolute -bottom-9 sm:-bottom-10 inset-x-0 text-center pointer-events-none"
        >
          <span className="font-serif italic text-xs sm:text-sm text-[#DFC07D] tracking-wide inline-flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Toca el sello para abrir</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
