"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  Navigation,
  Compass,
  Check,
  Copy,
  Gift,
  ExternalLink,
  Volume2,
  VolumeX,
  Church,
  GlassWater,
  UtensilsCrossed,
  Music4,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  RotateCcw,
  Camera,
  Upload,
  Download,
  Hotel,
  Sun,
  Share2,
  Disc3,
  Music,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EventMeta, Guest, Table, EventMusicConfig, AureaAmbientPreset } from "@/lib/types";
import { downloadCalendarIcs } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Countdown } from "./Countdown";
import { EnvelopeOpening } from "./EnvelopeOpening";

const EventEmblem3D = dynamic(
  () => import("./EventEmblem3D").then((mod) => mod.EventEmblem3D),
  { ssr: false }
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface InvitationExperienceProps {
  event: EventMeta;
  guest: Guest;
  tables?: Table[];
  isPreview?: boolean;
}

export function InvitationExperience({
  event,
  guest: initialGuest,
  tables = [],
  isPreview = false,
}: InvitationExperienceProps) {
  // Guest & RSVP State
  const [guest, setGuest] = useState<Guest>(initialGuest);
  const [confirmedSeats, setConfirmedSeats] = useState<number>(
    initialGuest.confirmedSeats > 0 ? initialGuest.confirmedSeats : Math.min(2, initialGuest.maxSeats)
  );
  const [attendanceStatus, setAttendanceStatus] = useState<"CONFIRMED" | "DECLINED">(
    initialGuest.status === "DECLINED" ? "DECLINED" : "CONFIRMED"
  );
  const [dietaryNotes, setDietaryNotes] = useState(initialGuest.dietaryNotes || "");
  const [guestMessage, setGuestMessage] = useState(initialGuest.guestMessage || "");
  const [songSuggestion, setSongSuggestion] = useState(initialGuest.songSuggestion || "");
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSuccessMessage, setRsvpSuccessMessage] = useState<string | null>(null);

  // Envelope & Audio State
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(initialGuest.status !== "UNOPENED" && !isPreview);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [copiedBankIndex, setCopiedBankIndex] = useState<number | null>(null);

  // Collaborative Photo Album State
  const [photos, setPhotos] = useState<Array<{ id?: string; url: string; author?: string; message?: string }>>([
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      author: "Familia Rivas",
      message: "¡Qué emoción celebrar este gran amor!",
    },
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      author: "Tía Marta",
      message: "Los novios más hermosos del mundo",
    },
    {
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
      author: "Carlos & Elena",
      message: "Brindando por una vida llena de bendición",
    },
  ]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoAuthor, setPhotoAuthor] = useState(guest.familyName || "Invitado");
  const [photoMessage, setPhotoMessage] = useState("");
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<string | null>(null);
  const [activeEditorialIndex, setActiveEditorialIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keyboard navigation for editorial lightbox
  useEffect(() => {
    if (activeEditorialIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const photosCount = (event.editorialPhotos && event.editorialPhotos.length > 0)
        ? event.editorialPhotos.length
        : 6;

      if (e.key === "Escape") {
        setActiveEditorialIndex(null);
      } else if (e.key === "ArrowLeft") {
        setActiveEditorialIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photosCount - 1));
      } else if (e.key === "ArrowRight") {
        setActiveEditorialIndex((prev) => (prev !== null && prev < photosCount - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeEditorialIndex, event.editorialPhotos]);

  // GSAP & Web Audio Refs
  const mainContentRef = useRef<HTMLDivElement>(null);
  const storySectionRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const rsvpSectionRef = useRef<HTMLDivElement>(null);
  const rotatingMonogramRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const monogram = `${(event.brideName || event.title)[0] || "A"}&${(event.groomName || "E")[0] || "E"}`;

  // =========================================================================
  // REPRODUCTOR MULTI-FUENTE CUMPLIENDO POLÍTICAS (YouTube, Spotify, Áurea)
  // =========================================================================
  const musicConfig: EventMusicConfig = event.musicConfig || {
    provider: "aurea_ambient",
    preset: "strings",
    songTitle: "Cuerdas Románticas",
    artist: "Áurea Sound Ensemble",
  };

  const ytPlayerRef = useRef<any>(null);
  const [isYtReady, setIsYtReady] = useState(false);
  const [ytHasError, setYtHasError] = useState(false);
  const hasTriggeredOnOpen = useRef(false);

  // Inicializar YouTube IFrame Player API de forma segura si el proveedor es youtube
  useEffect(() => {
    if (musicConfig.provider !== "youtube" || !musicConfig.trackId) return;
    if (typeof window === "undefined") return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let intervalId: NodeJS.Timeout;

    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        clearInterval(intervalId);
        if (!ytPlayerRef.current) {
          try {
            ytPlayerRef.current = new window.YT.Player("aurea-yt-player", {
              videoId: musicConfig.trackId,
              playerVars: {
                autoplay: 0,
                controls: 1, // Controles visibles obligatorios por TOS
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
                origin: window.location.origin,
              },
              events: {
                onReady: (e: any) => {
                  setIsYtReady(true);
                  if (hasTriggeredOnOpen.current && !ytHasError) {
                    try {
                      e.target.playVideo();
                      setIsAmbientPlaying(true);
                    } catch {}
                  }
                },
                onStateChange: (e: any) => {
                  if (e.data === 1) {
                    setIsAmbientPlaying(true);
                  } else if (e.data === 2 || e.data === 0) {
                    setIsAmbientPlaying(false);
                  }
                },
                onError: (e: any) => {
                  console.warn("[YouTube Guest Player] Error detectado (código " + e.data + "). Activando fallback silencioso...");
                  setYtHasError(true);
                  // Iniciar melodía instrumental Áurea transparente de inmediato
                  startAmbientMusic("strings");
                },
              },
            });
          } catch (e) {
            console.error("[YouTube IFrame API] Error de inicialización:", e);
            setYtHasError(true);
            startAmbientMusic("strings");
          }
        }
      }
    };

    intervalId = setInterval(checkAndInit, 250);
    checkAndInit();

    return () => {
      clearInterval(intervalId);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [musicConfig.provider, musicConfig.trackId, ytHasError]);

  // Melodía Instrumental Sintetizada con Web Audio API (3 Ambientes Royalty-Free)
  const startAmbientMusic = (selectedPreset: AureaAmbientPreset = "strings") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      setIsAmbientPlaying(true);

      let chordProgressions: number[][];
      let oscType: OscillatorType = "sine";
      let filterCutoff = 850;
      let attackTime = 0.1;
      let sustainTime = 3.2;

      if (selectedPreset === "piano") {
        chordProgressions = [
          [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
          [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
          [174.61, 220.0, 261.63, 329.63, 392.0],  // Fmaj7
          [196.0, 261.63, 293.66, 392.0, 440.0],   // Gsus4
        ];
        oscType = "sine";
        filterCutoff = 900;
        attackTime = 0.08;
        sustainTime = 2.8;
      } else if (selectedPreset === "strings") {
        chordProgressions = [
          [293.66, 369.99, 440.0, 554.37, 659.25], // Dmaj9
          [246.94, 293.66, 369.99, 440.0, 554.37], // Bm9
          [196.0, 246.94, 293.66, 369.99, 440.0],  // Gmaj7
          [220.0, 293.66, 329.63, 440.0, 493.88],  // A7sus4
        ];
        oscType = "sawtooth";
        filterCutoff = 650;
        attackTime = 0.22;
        sustainTime = 3.8;
      } else {
        // acoustic
        chordProgressions = [
          [329.63, 415.3, 493.88, 587.33, 659.25], // Emaj7
          [277.18, 329.63, 415.3, 493.88, 587.33], // C#m7
          [220.0, 277.18, 329.63, 415.3, 493.88],  // Aadd9
          [246.94, 329.63, 369.99, 493.88, 554.37],// Bsus4
        ];
        oscType = "triangle";
        filterCutoff = 1100;
        attackTime = 0.05;
        sustainTime = 2.5;
      }

      let chordIndex = 0;
      const playNextChord = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
        const currentChord = chordProgressions[chordIndex % chordProgressions.length];
        chordIndex++;

        currentChord.forEach((freq, noteIdx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = oscType;
          osc.frequency.setValueAtTime(freq, ctx.currentTime + noteIdx * 0.14);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);

          gain.gain.setValueAtTime(0.0001, ctx.currentTime + noteIdx * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + noteIdx * 0.14 + attackTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + noteIdx * 0.14 + sustainTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + noteIdx * 0.14);
          osc.stop(ctx.currentTime + noteIdx * 0.14 + sustainTime + 0.2);
        });

        audioTimerRef.current = setTimeout(playNextChord, 4300);
      };

      playNextChord();
    } catch {
      // Ignorar restricciones de autoplay
    }
  };

  const stopAmbientMusic = () => {
    setIsAmbientPlaying(false);
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Disparado síncronamente al tocar el sello de lacre (requisito para Safari/iOS y YouTube Player API)
  const handleEnvelopeStart = () => {
    hasTriggeredOnOpen.current = true;

    if (musicConfig.provider === "youtube" && !ytHasError) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.playVideo();
          setIsAmbientPlaying(true);
        } catch {
          startAmbientMusic("strings");
        }
      }
    } else if (musicConfig.provider === "aurea_ambient" || ytHasError) {
      startAmbientMusic(musicConfig.preset || "strings");
    }
  };

  // Alternar reproducción / pausa desde el botón flotante superior
  const toggleMusic = () => {
    if (musicConfig.provider === "youtube" && !ytHasError) {
      if (ytPlayerRef.current) {
        if (isAmbientPlaying) {
          try {
            ytPlayerRef.current.pauseVideo();
            setIsAmbientPlaying(false);
          } catch {}
        } else {
          try {
            ytPlayerRef.current.playVideo();
            setIsAmbientPlaying(true);
          } catch {}
        }
      }
    } else if (musicConfig.provider === "aurea_ambient" || ytHasError) {
      if (isAmbientPlaying) {
        stopAmbientMusic();
      } else {
        startAmbientMusic(musicConfig.preset || "strings");
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientMusic();
    };
  }, []);

  // Resetear y volver a ver la animación de apertura del sobre
  const handleResetEnvelope = () => {
    setIsEnvelopeOpen(false);
    hasTriggeredOnOpen.current = false;
    if (musicConfig.provider === "youtube" && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
    stopAmbientMusic();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Notificar apertura en DynamoDB al abrir el sobre
  const handleEnvelopeComplete = () => {
    setIsEnvelopeOpen(true);
    if (!isAmbientPlaying) {
      if (musicConfig.provider === "youtube") {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
          try {
            ytPlayerRef.current.playVideo();
            setIsAmbientPlaying(true);
          } catch {}
        }
      } else if (musicConfig.provider === "aurea_ambient") {
        startAmbientMusic(musicConfig.preset || "strings");
      }
    }
    if (!isPreview && guest.guestToken !== "preview") {
      fetch(`/api/public/invitation?slug=${guest.guestToken}&eventId=${event.eventId}`).catch(() => {});
    }
  };

  // =========================================================================
  // ANIMACIONES GSAP AL ENTRAR A LA INVITACIÓN EDITORIAL
  // =========================================================================
  useEffect(() => {
    if (!isEnvelopeOpen) return;

    const ctx = gsap.context(() => {
      // Entrada en cascada del Hero
      gsap.from(".editorial-reveal", {
        opacity: 0,
        y: 45,
        duration: 1.1,
        stagger: 0.12,
        ease: "power3.out",
      });

      // Animación continua de barras del ecualizador
      gsap.to(".eq-bar-1", { height: "16px", duration: 0.45, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to(".eq-bar-2", { height: "20px", duration: 0.35, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.1 });
      gsap.to(".eq-bar-3", { height: "12px", duration: 0.55, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.2 });

      // Monograma rotando sutilmente con el scroll
      if (rotatingMonogramRef.current) {
        gsap.to(rotatingMonogramRef.current, {
          rotation: 360,
          scrollTrigger: {
            trigger: mainContentRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        });
      }

      // Líneas divisorias editoriales que se dibujan en scroll
      gsap.utils.toArray<HTMLElement>(".hairline-rule").forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rule,
              start: "top 88%",
            },
          }
        );
      });

      // Revelación de la Historia
      if (storySectionRef.current) {
        gsap.from(storySectionRef.current, {
          scrollTrigger: {
            trigger: storySectionRef.current,
            start: "top 80%",
          },
          opacity: 0,
          y: 35,
          duration: 1.2,
          ease: "power2.out",
        });
      }

      // Línea de tiempo vertical dorada dibujada con scrub
      if (timelineLineRef.current && timelineContainerRef.current) {
        gsap.fromTo(
          timelineLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top center",
            ease: "none",
            scrollTrigger: {
              trigger: timelineContainerRef.current,
              start: "top 75%",
              end: "bottom 85%",
              scrub: 0.8,
            },
          }
        );
      }

      // Animación de cada hito del itinerario
      gsap.utils.toArray<HTMLElement>(".itinerary-item").forEach((item) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
          opacity: 0,
          y: 20,
          duration: 0.9,
          ease: "power2.out",
        });
      });

      // Parallax sutil en retrato protagonista del Hero
      gsap.to(".hero-protagonist-img", {
        y: 28,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-protagonist-img",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      // Revelación tipo cortina de papel en láminas fotográficas editoriales
      gsap.utils.toArray<HTMLElement>(".editorial-curtain-reveal").forEach((elem) => {
        const img = elem.querySelector(".curtain-img");
        gsap.fromTo(
          elem,
          { clipPath: "inset(12% 6% 12% 6% round 16px)" },
          {
            clipPath: "inset(0% 0% 0% round 16px)",
            ease: "none",
            scrollTrigger: {
              trigger: elem,
              start: "top 92%",
              end: "top 45%",
              scrub: 0.8,
            },
          }
        );
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.14 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: elem,
                start: "top 92%",
                end: "top 45%",
                scrub: 0.8,
              },
            }
          );
        }
      });
    }, mainContentRef);

    return () => ctx.revert();
  }, [isEnvelopeOpen]);

  // Manejo de envío de confirmación RSVP
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRsvp(true);
    setRsvpSuccessMessage(null);

    try {
      const res = await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.eventId,
          guestToken: guest.guestToken,
          status: attendanceStatus,
          confirmedSeats: attendanceStatus === "CONFIRMED" ? confirmedSeats : 0,
          dietaryNotes,
          guestMessage,
          songSuggestion,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo registrar la confirmación.");

      setGuest((prev) => ({
        ...prev,
        status: attendanceStatus,
        confirmedSeats: attendanceStatus === "CONFIRMED" ? confirmedSeats : 0,
        dietaryNotes,
        guestMessage,
        songSuggestion,
        confirmedAt: new Date().toISOString(),
      }));

      setRsvpSuccessMessage(
        attendanceStatus === "CONFIRMED"
          ? "¡Gracias por confirmar tu asistencia! Tu pase oficial de entrada está listo abajo."
          : "Hemos recibido tu respuesta con mucho cariño. ¡Te extrañaremos en la celebración!"
      );
    } catch (err: any) {
      alert(err.message || "Error al registrar confirmación");
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  // Subida de fotografías al álbum colaborativo S3
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // 1. Obtener Presigned URL de S3
      const urlRes = await fetch(`/api/events/${event.eventId}/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "image/jpeg",
          author: photoAuthor || guest.familyName,
          message: photoMessage,
        }),
      });

      const urlData = await urlRes.json();
      const photoPublicUrl = urlData.publicUrl || URL.createObjectURL(file);

      // 2. Registrar en la galería viva
      setPhotos((prev) => [
        {
          url: photoPublicUrl,
          author: photoAuthor || guest.familyName,
          message: photoMessage,
        },
        ...prev,
      ]);

      setPhotoMessage("");
      alert("¡Fotografía compartida con éxito en el álbum del evento!");
    } catch (err) {
      console.warn("Upload fallback local:", err);
      // Fallback preview
      setPhotos((prev) => [
        {
          url: URL.createObjectURL(file),
          author: photoAuthor || guest.familyName,
          message: photoMessage,
        },
        ...prev,
      ]);
      setPhotoMessage("");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCopyBank = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedBankIndex(idx);
    setTimeout(() => setCopiedBankIndex(null), 2500);
  };

  const handleSavePass = () => {
    window.print();
  };

  const getItineraryIcon = (name: string) => {
    switch (name) {
      case "church":
        return Church;
      case "cocktail":
        return GlassWater;
      case "utensils":
        return UtensilsCrossed;
      case "music":
        return Music4;
      default:
        return Sparkles;
    }
  };

  const assignedTable = tables.find((t) => t.tableId === guest.tableId);

  const heroCoverPhoto =
    event.coverImageUrl ||
    (event.editorialPhotos && event.editorialPhotos.find((p) => p.isCover)?.url) ||
    (event.editorialPhotos && event.editorialPhotos[0]?.url) ||
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85";

  const editorialPhotos =
    event.editorialPhotos && event.editorialPhotos.length > 0
      ? event.editorialPhotos
      : [
          {
            id: "mock_1",
            url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85",
            caption: "La promesa eterna en los claustros de Antigua",
            order: 1,
            isCover: true,
            aspect: "portrait" as const,
          },
          {
            id: "mock_2",
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85",
            caption: "Entre luces de velas y susurros de amor",
            order: 2,
            aspect: "landscape" as const,
          },
          {
            id: "mock_3",
            url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
            caption: "El instante exacto en que supimos que era para siempre",
            order: 3,
            aspect: "portrait" as const,
          },
          {
            id: "mock_4",
            url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=85",
            caption: "Caminos de piedra volcánica que nos conducen al altar",
            order: 4,
            aspect: "landscape" as const,
          },
          {
            id: "mock_5",
            url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=85",
            caption: "La serenidad del compromiso más puro",
            order: 5,
            aspect: "portrait" as const,
          },
          {
            id: "mock_6",
            url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=85",
            caption: "Donde el tiempo se detiene y solo existimos tú y yo",
            order: 6,
            aspect: "landscape" as const,
          },
        ];

  return (
    <div
      className="min-h-screen text-[#181715] font-sans selection:bg-[#C5A059]/30 selection:text-zinc-950 relative"
      style={{
        backgroundColor: "#F7F4EE",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.035'/%3E%3C/svg%3E")`,
      }}
    >
      {/* =========================================================================
          1. APERTURA CINEMATOGRÁFICA DEL SOBRE 3D (GSAP OVERLAY)
          ========================================================================= */}
      {!isEnvelopeOpen && (
        <EnvelopeOpening
          event={event}
          guest={guest}
          onOpenStart={handleEnvelopeStart}
          onOpenComplete={handleEnvelopeComplete}
          isAudioMuted={isAudioMuted}
          onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
        />
      )}

      {/* =========================================================================
          BARRA DE CONTROL SUPERIOR EDITORIAL (AUDIO PERSONALIZADO & VOLVER AL SOBRE)
          ========================================================================= */}
      {isEnvelopeOpen && (
        <header className="sticky top-0 z-40 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#181715]/10 px-4 sm:px-8 py-3 transition-colors">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Reproductor con Ecualizador Animado */}
            <div className="flex items-center gap-2">
              {musicConfig.provider !== "none" && (
                <button
                  onClick={toggleMusic}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#A88444]/30 text-[#181715] text-xs font-serif italic shadow-sm transition-all"
                  title={isAmbientPlaying ? "Pausar música" : "Reproducir música"}
                >
                  <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                    <span
                      className={`w-1 bg-[#A88444] rounded-full transition-all ${
                        isAmbientPlaying ? "eq-bar-1 h-3" : "h-1"
                      }`}
                    />
                    <span
                      className={`w-1 bg-[#A88444] rounded-full transition-all ${
                        isAmbientPlaying ? "eq-bar-2 h-4" : "h-2"
                      }`}
                    />
                    <span
                      className={`w-1 bg-[#A88444] rounded-full transition-all ${
                        isAmbientPlaying ? "eq-bar-3 h-2" : "h-1"
                      }`}
                    />
                  </div>
                  <span className="hidden sm:inline max-w-[140px] truncate">
                    {isAmbientPlaying
                      ? (ytHasError ? "Melodía Áurea" : (musicConfig.songTitle || "Música activa"))
                      : "Música pausada"}
                  </span>
                </button>
              )}

              <button
                onClick={handleResetEnvelope}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#181715]/15 text-[#181715] text-xs font-sans font-medium shadow-sm transition-all"
                title="Volver a ver la animación de apertura del sobre"
              >
                <Mail className="w-3.5 h-3.5 text-[#A88444]" />
                <span className="hidden sm:inline">Volver al sobre</span>
                <RotateCcw className="w-3 h-3 text-zinc-400 sm:hidden" />
              </button>
            </div>

            <div className="text-right text-[11px] sm:text-xs font-serif italic text-zinc-600">
              <span className="font-semibold text-[#181715]">{event.title}</span>
              <span className="hidden sm:inline"> · </span>
              <span className="hidden sm:inline">{guest.familyName}</span>
            </div>
          </div>
        </header>
      )}

      {/* =========================================================================
          2. LAYOUT EDITORIAL REVISTA DE ALTA COSTURA
          ========================================================================= */}
      <main
        ref={mainContentRef}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-32"
      >
        {/* Banner de Modo Vista Previa si aplica */}
        {isPreview && (
          <div className="p-3.5 rounded-xl bg-[#FAF0DC] border border-[#DFC9A6] text-[#7A5C30] text-xs font-serif italic shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A88444]" />
              <span>Modo Vista Previa de Anfitrión · Cupo de 4 lugares para Familia Invitada</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-white text-[#7A5C30] border border-[#DFC9A6]">
              Preview
            </span>
          </div>
        )}

        {/* ---------------- HERO MONUMENTAL DE PORTADA ---------------- */}
        <section className="text-center space-y-8 pt-4">
          {/* Monograma rotando suavemente con el scroll */}
          <div
            ref={rotatingMonogramRef}
            className="editorial-reveal inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1B2B23] text-[#FAF8F5] border-2 border-[#C5A059] font-serif text-xl sm:text-2xl font-bold shadow-md mx-auto"
          >
            {monogram}
          </div>

          <div className="editorial-reveal space-y-3">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#8C6D46] font-bold block">
              Invitación de Honor
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl md:text-6xl text-[#181715] font-normal tracking-tight">
              {guest.familyName}
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#181715]/10 text-[#7A5C30] text-xs font-serif italic">
              <Users className="w-3.5 h-3.5 text-[#A88444]" />
              <span>
                {guest.maxSeats} {guest.maxSeats === 1 ? "Pase de Honor Reservado" : "Pases de Honor Reservados"}
              </span>
            </div>
          </div>

          {/* Filete fino divisorio */}
          <div className="w-24 h-px bg-[#181715]/15 mx-auto hairline-rule" />

          {/* Nombres Protagonistas Monumentales */}
          <div className="editorial-reveal pt-2 pb-2">
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl text-[#181715] tracking-tight leading-[0.95] font-normal">
              {event.title}
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 font-serif italic max-w-xl mx-auto mt-5 leading-relaxed">
              &ldquo;{event.tagline || "Un sí para siempre entre nuestros seres más amados"}&rdquo;
            </p>
          </div>

          {/* Retrato Protagonista en Arco Arquitectónico con Parallax */}
          {heroCoverPhoto && (
            <div className="editorial-reveal pt-3 pb-3 max-w-[280px] sm:max-w-[320px] mx-auto">
              <div className="relative p-2 rounded-t-[140px] rounded-b-2xl bg-gradient-to-b from-[#DFC07D]/50 via-[#FAF7F2] to-[#EAE2D3] border border-[#C5A059]/40 shadow-xl backdrop-blur-sm">
                <div className="relative aspect-[3/4] rounded-t-[130px] rounded-b-xl overflow-hidden bg-[#1E1C1A]">
                  <img
                    src={heroCoverPhoto}
                    alt={event.title}
                    className="hero-protagonist-img w-full h-full object-cover object-center will-change-transform scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/90 drop-shadow">
                      {event.brideName} & {event.groomName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fecha y Ciudad en bloque asimétrico */}
          <div className="editorial-reveal flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-serif italic text-zinc-800 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-[#181715]/10 shadow-sm">
              <Calendar className="w-4 h-4 text-[#A88444]" />
              <span>{event.eventDateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-[#181715]/10 shadow-sm">
              <MapPin className="w-4 h-4 text-[#A88444]" />
              <span>{event.venueName}, {event.venueCity}</span>
            </div>
          </div>

          {/* Contador Regresivo Vivo en Cascada */}
          <div className="editorial-reveal pt-4">
            <Countdown targetDate={event.eventDate} />
          </div>
        </section>

        {/* ---------------- ESCULTURA 3D MARGINAL SUPERIOR DERECHA (HERO / HISTORIA) ---------------- */}
        <EventEmblem3D event={event} slot="slot_1" />

        {/* ---------------- NUESTRA HISTORIA / EDITORIAL ---------------- */}
        {event.ourStory && (
          <section
            ref={storySectionRef}
            className="py-12 px-6 sm:px-12 border-y border-[#181715]/12 text-center relative"
          >
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#8C6D46] font-bold block mb-4">
              Nuestra Historia
            </span>
            <p className="font-serif text-xl sm:text-3xl text-[#181715] leading-relaxed max-w-2xl mx-auto italic font-normal">
              &ldquo;{event.ourStory}&rdquo;
            </p>
            <div className="w-12 h-px bg-[#A88444]/40 mx-auto mt-6" />
          </section>
        )}

        {/* ---------------- SESIÓN EDITORIAL · NUESTRA HISTORIA EN IMÁGENES ---------------- */}
        <section className="space-y-10 sm:space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#8C6D46] font-bold block">
              Lookbook &amp; Mesa de Luz
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl text-[#181715] font-normal tracking-tight">
              Nuestra Historia en Imágenes
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 font-serif italic max-w-lg mx-auto leading-relaxed">
              Un recorrido íntimo a través de los instantes, miradas y memorias que han forjado este camino hacia el altar.
            </p>
            <div className="w-16 h-px bg-[#A88444]/40 mx-auto mt-4" />
          </div>

          {/* Grid Editorial Asimétrico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-start">
            {editorialPhotos.map((photo, idx) => {
              const isLandscape = photo.aspect === "landscape";
              const sheetNum = String(idx + 1).padStart(2, "0");
              const totalSheets = String(editorialPhotos.length).padStart(2, "0");

              return (
                <div
                  key={photo.id || idx}
                  className={`space-y-3 group cursor-pointer ${
                    idx === 0 || idx === 3 ? "md:col-span-2 md:max-w-2xl md:mx-auto w-full" : ""
                  }`}
                  onClick={() => setActiveEditorialIndex(idx)}
                >
                  {/* Cabecera de Lámina */}
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#8C6D46] px-1">
                    <span className="font-bold">LÁMINA {sheetNum} / {totalSheets}</span>
                    <span className="uppercase text-[9px] text-zinc-400 font-sans tracking-widest group-hover:text-[#A88444] transition-colors">
                      [ ⌕ Ampliar lámina ]
                    </span>
                  </div>

                  {/* Contenedor Revelación Cortina de Papel */}
                  <div
                    className={`editorial-curtain-reveal relative overflow-hidden rounded-2xl bg-[#EAE2D3] border border-[#181715]/10 shadow-lg ${
                      isLandscape ? "aspect-[16/10]" : "aspect-[3/4]"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Lámina ${sheetNum}`}
                      className="curtain-img w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 will-change-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-sans font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 pointer-events-none">
                      <Camera className="w-3.5 h-3.5 text-[#DFC07D]" />
                      <span>Ver en alta resolución</span>
                    </div>
                  </div>

                  {/* Pie de Foto Editorial */}
                  {photo.caption && (
                    <p className="font-serif italic text-sm sm:text-base text-[#181715]/85 text-center px-4 leading-relaxed">
                      &ldquo;{photo.caption}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------- BANDA SONORA: YOUTUBE IFRAME PLAYER API ---------------- */}
        {musicConfig.provider === "youtube" && musicConfig.trackId && (
          <section className="py-10 px-6 sm:px-12 rounded-3xl bg-white/80 border border-[#A88444]/25 shadow-sm text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-[#8C6D46]">
              <Disc3 className="w-4 h-4 animate-spin text-[#A88444]" />
              <span className="text-[10px] uppercase tracking-[0.28em] font-bold">
                {ytHasError ? "Melodía de Celebración" : "Nuestra Canción"}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl sm:text-3xl text-[#181715] font-normal italic">
                {ytHasError
                  ? "Melodía Instrumental Áurea"
                  : (musicConfig.songTitle || "Banda Sonora de Nuestro Amor")}
              </h4>
              <p className="text-xs text-[#8C6D46] font-medium tracking-wider uppercase">
                {ytHasError ? "Áurea Sound Ensemble" : musicConfig.artist}
              </p>
            </div>

            {/* Si no hay restricción de disquera, renderizar reproductor oficial visible */}
            {!ytHasError ? (
              <>
                <div className="max-w-[420px] mx-auto rounded-2xl overflow-hidden border-2 border-[#A88444]/30 shadow-md bg-black p-1">
                  <div className="relative w-full aspect-video min-h-[200px] min-w-[240px] rounded-xl overflow-hidden">
                    <div id="aurea-yt-player" className="w-full h-full" />
                  </div>
                </div>

                <p className="text-[11px] text-[#181715]/60 italic font-serif">
                  Reproducción oficial autorizada a través de YouTube IFrame Player API
                </p>
              </>
            ) : (
              /* Fallback transparente en caso de error de disquera en el invitado */
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] max-w-md mx-auto text-xs text-[#8C6D46] flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A88444]" />
                <span className="font-serif italic text-sm">
                  Acompañamiento instrumental en vivo activo
                </span>
              </div>
            )}
          </section>
        )}

        {/* ---------------- BANDA SONORA: SPOTIFY EMBED OFICIAL ---------------- */}
        {musicConfig.provider === "spotify" && musicConfig.trackId && (
          <section className="py-10 px-6 sm:px-12 rounded-3xl bg-white/80 border border-[#A88444]/25 shadow-sm text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-800">
              <Music className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] uppercase tracking-[0.28em] font-bold">
                Nuestra Banda Sonora
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl sm:text-3xl text-[#181715] font-normal italic">
                {musicConfig.songTitle || "Selección Musical Oficial"}
              </h4>
              {musicConfig.artist && (
                <p className="text-xs text-[#8C6D46] font-medium tracking-wider uppercase">
                  {musicConfig.artist}
                </p>
              )}
            </div>

            {/* Spotify Embed Oficial */}
            <div className="max-w-[440px] mx-auto rounded-2xl overflow-hidden border border-[#A88444]/30 shadow-sm bg-black/5 p-1">
              <iframe
                src={`https://open.spotify.com/embed/${musicConfig.trackId}?utm_source=generator&theme=0`}
                className="w-full rounded-xl border-0 shadow-sm"
                height={musicConfig.trackId.startsWith("playlist") ? 352 : 152}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>

            <p className="text-[11px] text-[#181715]/60 italic font-serif">
              Transmisión oficial mediante el reproductor embebido de Spotify
            </p>
          </section>
        )}

        {/* ---------------- ITINERARIO MULTI-LOCACIÓN INTELIGENTE ---------------- */}
        <section ref={timelineContainerRef} className="space-y-10 relative">
          {/* Escultura 3D Marginal Izquierda (Itinerario & Locaciones) */}
          <EventEmblem3D event={event} slot="slot_2" />
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#8C6D46] font-bold block">
              El Gran Día
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl text-[#181715] font-normal">
              Itinerario &amp; Locaciones
            </h3>
          </div>

          {/* Tarjeta de Ubicación con Acciones Rápidas (Waze, Maps, .ICS) */}
          <div className="p-6 sm:p-10 rounded-2xl bg-white/80 border border-[#181715]/12 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#8C6D46] text-[10px] uppercase tracking-widest font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Locación Principal</span>
              </div>
              <h4 className="font-serif text-2xl sm:text-3xl text-[#181715]">{event.venueName}</h4>
              <p className="text-xs text-zinc-600 max-w-md">{event.venueAddress}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {event.wazeUrl && (
                <a
                  href={event.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Waze</span>
                </a>
              )}
              {event.googleMapsUrl && (
                <a
                  href={event.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-xs font-semibold shadow-sm transition-all"
                >
                  <Compass className="w-3.5 h-3.5 text-rose-600" />
                  <span>Google Maps</span>
                </a>
              )}
              <button
                onClick={() =>
                  downloadCalendarIcs({
                    title: event.title,
                    description: `Celebración de ${event.title}. Lugar: ${event.venueName}`,
                    location: `${event.venueName}, ${event.venueAddress}`,
                    startDateIso: event.eventDate,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181715] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-[#DFC07D]" />
                <span>Agregar a Calendario (.ics)</span>
              </button>
            </div>
          </div>

          {/* Timeline Vertical Animado */}
          <div className="relative pl-6 sm:pl-10 space-y-8 pt-4">
            <div
              ref={timelineLineRef}
              className="absolute left-2.5 sm:left-4 top-2 bottom-2 w-0.5 bg-[#A88444]/60 origin-top"
            />

            {(event.itinerary || []).map((item, idx) => {
              const Icon = getItineraryIcon(item.iconName);
              return (
                <div key={idx} className="itinerary-item relative flex items-start gap-4 sm:gap-6">
                  <div className="w-6 h-6 rounded-full bg-[#F7F4EE] border-2 border-[#A88444] flex items-center justify-center text-[#8C6D46] shrink-0 z-10 -ml-[13px] sm:-ml-[17px] mt-0.5">
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="bg-white/85 p-5 sm:p-6 rounded-xl border border-[#181715]/10 shadow-sm flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#8C6D46]">
                        {item.time} hrs
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans">{item.location}</span>
                    </div>
                    <h5 className="font-serif text-lg text-[#181715] font-semibold">{item.title}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------- CÓDIGO DE VESTIMENTA & PALETA TÁCTIL ---------------- */}
        <section className="p-8 sm:p-12 rounded-2xl bg-white/70 border border-[#181715]/10 text-center space-y-6 relative">
          {/* Escultura 3D Marginal Derecha (Dress Code & Galería) */}
          <EventEmblem3D event={event} slot="slot_3" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2B23] text-[#FAF8F5] text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Código de Vestimenta</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-3xl sm:text-4xl text-[#181715]">{event.dressCodeTitle}</h3>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
              {event.dressCodeDescription}
            </p>
          </div>

          {/* Paleta interactiva táctil */}
          {event.paletteColors && event.paletteColors.length > 0 && (
            <div className="pt-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block">
                Paleta de Inspiración
              </span>
              <div className="flex items-center justify-center gap-3">
                {event.paletteColors.map((color, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.18, duration: 0.25 })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.25 })}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform"
                    style={{ backgroundColor: color }}
                    title={`Tono: ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ---------------- HOTELES RECOMENDADOS & HOSPEDAJE ---------------- */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#8C6D46] font-bold block">
              Hospedaje &amp; Estadía
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#181715] font-normal">
              Hoteles Sugeridos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white/80 border border-[#181715]/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D46]">
                  Tarifa Preferencial · Código: BODA2026
                </span>
                <Hotel className="w-4 h-4 text-[#A88444]" />
              </div>
              <h4 className="font-serif text-xl text-[#181715]">Hotel Museo Casa Santo Domingo</h4>
              <p className="text-xs text-zinc-600">
                3a Calle Oriente No. 28A, Antigua Guatemala. A 5 minutos del lugar de la celebración.
              </p>
              <a
                href="https://www.casasantodomingo.com.gt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#7A5C30] hover:text-[#181715] font-semibold transition-colors"
              >
                <span>Ver reservaciones</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 border border-[#181715]/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D46]">
                  Tarifa Preferencial · Código: BODA2026
                </span>
                <Hotel className="w-4 h-4 text-[#A88444]" />
              </div>
              <h4 className="font-serif text-xl text-[#181715]">Porta Hotel Antigua</h4>
              <p className="text-xs text-zinc-600">
                8a Calle Poniente No. 1, Antigua Guatemala. Descuento reservando con anticipación.
              </p>
              <a
                href="https://www.portahotels.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#7A5C30] hover:text-[#181715] font-semibold transition-colors"
              >
                <span>Ver reservaciones</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- MESA DE REGALOS ---------------- */}
        {event.giftRegistries && event.giftRegistries.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#8C6D46] font-bold block">
                Mesa de Regalos
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl text-[#181715] font-normal">
                Detalles para los Anfitriones
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {event.giftRegistries.map((item, idx) => {
                const isUrl = item.codeOrUrl.startsWith("http");
                const isCopied = copiedBankIndex === idx;

                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white/80 border border-[#181715]/10 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D46]">
                        {item.type === "bank" ? "Transferencia Bancaria" : "Mesa Online"}
                      </span>
                      <h4 className="font-serif text-xl text-[#181715] mt-1">{item.name}</h4>
                      <p className="text-xs text-zinc-600 mt-1">{item.description}</p>
                    </div>

                    {isUrl ? (
                      <a
                        href={item.codeOrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#181715] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <span>Ver tienda</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCopyBank(item.codeOrUrl, idx)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#F4EDE0] hover:bg-[#ebdcc4] text-[#7A5C30] text-xs font-bold transition-all"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">¡Cuenta copiada!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar número</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------------- CONFIRMACIÓN RSVP EN VIVO A DYNAMODB ---------------- */}
        <div className="relative">
          {/* Escultura 3D Marginal Izquierda Inferior (Mesa de Regalos / RSVP) */}
          <EventEmblem3D event={event} slot="slot_4" />

          <section
            ref={rsvpSectionRef}
            id="rsvp"
            className="p-6 sm:p-12 rounded-3xl bg-white border border-[#A88444]/40 shadow-xl space-y-8"
          >
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#8C6D46] font-bold block">
              Confirmación de Asistencia
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl text-[#181715] font-normal">
              {guest.familyName}
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Agradecemos confirmar con anticipación para asegurar la atención personalizada en el banquete.
            </p>
          </div>

          {rsvpSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{rsvpSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleRsvpSubmit} className="space-y-6 max-w-xl mx-auto">
            {/* Opciones táctiles de asistencia */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttendanceStatus("CONFIRMED")}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[56px] ${
                  attendanceStatus === "CONFIRMED"
                    ? "bg-[#181715] text-white border-black shadow-md font-bold"
                    : "bg-[#F7F4EE] border-[#181715]/10 text-zinc-700 hover:bg-white"
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${attendanceStatus === "CONFIRMED" ? "text-[#DFC07D]" : "text-zinc-400"}`} />
                <span className="text-xs">Asistiremos con alegría</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendanceStatus("DECLINED")}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[56px] ${
                  attendanceStatus === "DECLINED"
                    ? "bg-[#181715] text-white border-black shadow-md font-bold"
                    : "bg-[#F7F4EE] border-[#181715]/10 text-zinc-700 hover:bg-white"
                }`}
              >
                <XCircle className={`w-5 h-5 ${attendanceStatus === "DECLINED" ? "text-rose-400" : "text-zinc-400"}`} />
                <span className="text-xs">No podremos acompañarles</span>
              </button>
            </div>

            {/* Número de lugares a confirmar dentro del cupo */}
            {attendanceStatus === "CONFIRMED" && (
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADBCC] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800">
                    Pases confirmados (Cupo asignado: {guest.maxSeats})
                  </span>
                  <span className="font-mono font-bold text-zinc-900 text-sm">
                    {confirmedSeats} de {guest.maxSeats}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: guest.maxSeats }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setConfirmedSeats(num)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
                        confirmedSeats === num
                          ? "bg-[#C5A059] text-zinc-950 shadow-sm"
                          : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Restricciones alimentarias (sincronizadas a cuidados de cocina en dashboard) */}
            {attendanceStatus === "CONFIRMED" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Restricciones alimentarias o alergias (Opcional)
                </label>
                <input
                  type="text"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  placeholder="Ej. 1 celíaco, alergia a nueces o mariscos..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#181715] focus:bg-white min-h-[44px]"
                />
              </div>
            )}

            {/* Canción sugerida para la fiesta / DJ */}
            {attendanceStatus === "CONFIRMED" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Sugerencia de canción para la fiesta (DJ)
                </label>
                <input
                  type="text"
                  value={songSuggestion}
                  onChange={(e) => setSongSuggestion(e.target.value)}
                  placeholder="Canción y artista que no puede faltar en la pista..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#181715] focus:bg-white min-h-[44px]"
                />
              </div>
            )}

            {/* Mensaje cariñoso a los anfitriones */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Dedicatoria o mensaje para los anfitriones
              </label>
              <textarea
                rows={3}
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                placeholder="Escribe unas palabras para este gran momento..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#181715] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingRsvp}
              className="w-full py-4 px-4 rounded-xl bg-[#181715] hover:bg-black text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              {isSubmittingRsvp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#DFC07D]" />
                  <span>Guardando confirmación...</span>
                </>
              ) : (
                <span>Confirmar Respuesta</span>
              )}
            </button>
          </form>

          {/* ---------------- PASE QR DIGITAL DINÁMICO DE ENTRADA ---------------- */}
          {guest.status === "CONFIRMED" && (
            <div className="mt-8 pt-8 border-t border-[#EADBCC] text-center space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pase Oficial de Entrada</span>
              </div>

              <h4 className="font-serif text-3xl text-[#181715]">
                Pase Digital de Recepción
              </h4>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                Presenta este código QR en el acceso del evento para un registro ágil y asignación de mesa.
              </p>

              {/* QR Code Container */}
              <div className="w-48 h-48 p-4 bg-white rounded-2xl border-2 border-dashed border-[#DFC9A6] shadow-sm mx-auto flex items-center justify-center">
                <QRCodeSVG
                  value={`AUREA:${event.eventId}:${guest.guestToken}`}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#181715] text-sm">{guest.familyName}</div>
                <div className="text-zinc-600">
                  {guest.confirmedSeats} {guest.confirmedSeats === 1 ? "pase confirmado" : "pases confirmados"}
                  {assignedTable && ` · Mesa Asignada: ${assignedTable.name}`}
                </div>
              </div>

              {/* Botón para Guardar en el Teléfono */}
              <button
                onClick={handleSavePass}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-50 border border-[#181715]/20 text-[#181715] text-xs font-semibold shadow-sm transition-all cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4 text-[#A88444]" />
                <span>Guardar Pase en el Teléfono</span>
              </button>
            </div>
          )}
        </section>
        </div>

        {/* ---------------- ÁLBUM COLABORATIVO EN VIVO (S3 + MODO TV) ---------------- */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#8C6D46] font-bold block">
              Recuerdos en Tiempo Real
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl text-[#181715] font-normal">
              Álbum en Vivo del Evento
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto">
              Sube fotos desde tu teléfono durante la celebración para compartirlas en vivo con los novios y en las pantallas del evento.
            </p>
          </div>

          {/* Formulario de subida directa a S3 */}
          <div className="p-6 rounded-2xl bg-white/80 border border-[#181715]/10 shadow-sm max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Tu Nombre o Familia
                </label>
                <input
                  type="text"
                  value={photoAuthor}
                  onChange={(e) => setPhotoAuthor(e.target.value)}
                  placeholder="Ej. Tía Marta..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Dedicatoria (Opcional)
                </label>
                <input
                  type="text"
                  value={photoMessage}
                  onChange={(e) => setPhotoMessage(e.target.value)}
                  placeholder="¡Felicidades a los novios!"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#A88444]/60 bg-[#FAF7F2] hover:bg-[#F4EDE0] text-[#7A5C30] text-xs font-semibold cursor-pointer transition-colors min-h-[48px]">
              <Camera className="w-4 h-4 text-[#A88444]" />
              <span>{isUploadingPhoto ? "Subiendo fotografía..." : "Tomar Foto o Seleccionar de Galería"}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Galería Polaroid Editorial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {photos.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveLightboxPhoto(item.url)}
                className="bg-white p-3 rounded-xl border border-[#181715]/10 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100">
                  <img
                    src={item.url}
                    alt={item.author || "Foto"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="pt-3 text-center">
                  <p className="font-serif italic text-sm text-[#181715] font-semibold">
                    {item.author}
                  </p>
                  {item.message && (
                    <p className="text-[11px] text-zinc-600 mt-0.5 line-clamp-2">
                      &ldquo;{item.message}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lightbox Modal para Fotografías Colaborativas */}
        {isMounted && activeLightboxPhoto && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setActiveLightboxPhoto(null)}
            className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/85 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <div className="max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
              <img
                src={activeLightboxPhoto}
                alt="Ampliación"
                className="w-full h-full object-contain max-h-[80vh] rounded-xl"
              />
            </div>
          </div>,
          document.body
        )}

        {/* Lightbox Cinemático para Mesa de Luz Editorial */}
        {isMounted && activeEditorialIndex !== null && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/85 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveEditorialIndex(null);
            }}
          >
            <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center">
              {/* Botón Cerrar */}
              <button
                onClick={() => setActiveEditorialIndex(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer"
                title="Cerrar lámina (Esc)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navegación Anterior */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEditorialIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : editorialPhotos.length - 1
                  );
                }}
                className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer"
                title="Lámina anterior (Flecha Izquierda)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Navegación Siguiente */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEditorialIndex((prev) =>
                    prev !== null && prev < editorialPhotos.length - 1 ? prev + 1 : 0
                  );
                }}
                className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer"
                title="Lámina siguiente (Flecha Derecha)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Contenedor de la Lámina */}
              <div className="relative rounded-2xl overflow-hidden bg-[#1E1C1A] border border-[#DFC9A6]/30 shadow-2xl max-h-[75vh] w-full flex items-center justify-center p-2">
                <img
                  src={editorialPhotos[activeEditorialIndex]?.url}
                  alt={editorialPhotos[activeEditorialIndex]?.caption || "Lámina Editorial"}
                  className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl"
                />
              </div>

              {/* Pie de Lámina y Contador */}
              <div className="mt-4 text-center space-y-1.5 px-4 max-w-xl text-white">
                <span className="font-mono text-xs uppercase tracking-widest text-[#DFC07D] font-bold block">
                  LÁMINA {String(activeEditorialIndex + 1).padStart(2, "0")} / {String(editorialPhotos.length).padStart(2, "0")}
                </span>
                {editorialPhotos[activeEditorialIndex]?.caption && (
                  <p className="font-serif italic text-base sm:text-lg text-zinc-200">
                    &ldquo;{editorialPhotos[activeEditorialIndex].caption}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
}
