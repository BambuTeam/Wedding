"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tv,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface EventInfo {
  eventId: string;
  slug?: string;
  title: string;
  venueName?: string;
  category?: string;
}

function SubirFotoExpressInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSlug = (params?.slug as string) || "camila-andres-2025";
  const urlToken = searchParams?.get("token") || "";

  // Event State
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Guest Verification State
  const [verifiedGuestName, setVerifiedGuestName] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [guestList, setGuestList] = useState<Array<{ name: string; token: string }>>([]);
  const [searchingGuests, setSearchingGuests] = useState(false);
  const [manualGuestName, setManualGuestName] = useState("");

  // Upload & Camera State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Cargar información del evento
  useEffect(() => {
    let isMounted = true;
    async function fetchEvent() {
      try {
        setLoadingEvent(true);
        const res = await fetch(`/api/events/${rawSlug}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.event) {
            setEvent({
              eventId: data.event.eventId,
              slug: data.event.slug || data.event.eventId,
              title: data.event.title,
              venueName: data.event.venueName,
              category: data.event.category,
            });
            return;
          }
        }
        // Fallback a evento por defecto
        if (isMounted) {
          setEvent({
            eventId: rawSlug,
            title: "Celebración Exclusiva",
            category: "Celebración",
          });
        }
      } catch (err) {
        console.warn("[SubirFotoExpress] Error fetching event:", err);
      } finally {
        if (isMounted) setLoadingEvent(false);
      }
    }
    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [rawSlug]);

  // 2. Verificar Pase de Invitado
  useEffect(() => {
    const eventId = event?.eventId || rawSlug;
    if (typeof window === "undefined") return;

    // Verificar si ya está en sessionStorage
    const saved = sessionStorage.getItem(`aurea_guest_${eventId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.name) {
          setVerifiedGuestName(parsed.name);
          setIsVerified(true);
          return;
        }
      } catch {
        // ignore
      }
    }

    // Si viene token en la URL, validarlo directamente
    if (urlToken) {
      setVerifyingToken(true);
      fetch(`/api/events/${eventId}/guests/${urlToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.guest?.fullName) {
            setVerifiedGuestName(data.guest.fullName);
            setIsVerified(true);
            sessionStorage.setItem(
              `aurea_guest_${eventId}`,
              JSON.stringify({ name: data.guest.fullName, token: urlToken })
            );
          }
        })
        .catch(() => {})
        .finally(() => setVerifyingToken(false));
    }
  }, [event?.eventId, rawSlug, urlToken]);

  // Cargar lista de invitados para buscador de pase
  const handleLoadGuests = async () => {
    const eventId = event?.eventId || rawSlug;
    try {
      setSearchingGuests(true);
      const res = await fetch(`/api/events/${eventId}/guests`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.guests)) {
          setGuestList(
            data.guests.map((g: any) => ({
              name: g.fullName,
              token: g.guestToken,
            }))
          );
        }
      }
    } catch {
      // ignore
    } finally {
      setSearchingGuests(false);
    }
  };

  const handleSelectGuest = (g: { name: string; token: string }) => {
    const eventId = event?.eventId || rawSlug;
    setVerifiedGuestName(g.name);
    setIsVerified(true);
    sessionStorage.setItem(`aurea_guest_${eventId}`, JSON.stringify(g));
    showToast("success", `¡Bienvenido(a), ${g.name}! Pase verificado ✨`);
  };

  const handleManualConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualGuestName.trim();
    if (!clean) return;
    const eventId = event?.eventId || rawSlug;
    setVerifiedGuestName(clean);
    setIsVerified(true);
    sessionStorage.setItem(
      `aurea_guest_${eventId}`,
      JSON.stringify({ name: clean, token: "manual" })
    );
    showToast("success", `¡Pase registrado como ${clean}!`);
  };

  // Compresión en cliente mediante canvas para carga ultra-rápida en 4G/5G
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                resolve(blob || file);
              },
              "image/jpeg",
              0.85
            );
          } else {
            resolve(file);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUploadSuccess(false);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      showToast("error", "Por favor toma o selecciona una fotografía.");
      return;
    }

    const eventId = event?.eventId || rawSlug;
    setIsUploading(true);

    try {
      const compressedBlob = await compressImage(imageFile);
      const formData = new FormData();
      formData.append(
        "file",
        compressedBlob,
        imageFile.name.replace(/\.[^/.]+$/, "") + ".jpg"
      );
      formData.append("author", verifiedGuestName || "Invitado Especial");
      if (message.trim()) {
        formData.append("message", message.trim());
      }

      const res = await fetch(`/api/public/events/${eventId}/photos`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.status === 422) {
        showToast(
          "error",
          data?.error ||
            "Esta fotografía no cumple con las normas de convivencia del evento y fue bloqueada automáticamente."
        );
        return;
      }

      if (!res.ok) {
        showToast("error", data?.error || "No se pudo subir la foto. Intenta de nuevo.");
        return;
      }

      setUploadSuccess(true);
      showToast("success", "¡Fotografía proyectada en la pantalla de la fiesta! ✨");
      setMessage("");
      setImageFile(null);
    } catch (err: any) {
      showToast("error", "Error de conexión al subir la fotografía.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12110F] text-[#F7F4EE] flex flex-col justify-between selection:bg-[#DFC38C] selection:text-black font-sans">
      {/* Toast Notificación */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-[#181715]/95 border-[#DFC38C]/50 text-[#F7F4EE]"
                : "bg-red-950/90 border-red-500/50 text-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <Sparkles className="w-5 h-5 text-[#DFC38C] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <p className="text-sm font-medium leading-snug">{toast.text}</p>
          </div>
        </div>
      )}

      {/* Header Minimalista */}
      <header className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center">
            <Camera className="w-4 h-4 text-[#DFC38C]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs">
              {event?.title || "Álbum en Vivo"}
            </h1>
            <p className="text-[11px] text-zinc-400">Portal Express de Cámara</p>
          </div>
        </div>

        <Link
          href={`/modo-tv?eventId=${event?.eventId || rawSlug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Tv className="w-3.5 h-3.5 text-[#DFC38C]" />
          <span>Ver TV</span>
        </Link>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col justify-center px-5 py-6 max-w-md mx-auto w-full">
        {loadingEvent ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#DFC38C] mb-3" />
            <p className="text-sm">Conectando con la celebración...</p>
          </div>
        ) : !isVerified ? (
          /* PASO 1: VERIFICACIÓN DE PASE ANTI-INTRUSOS */
          <div className="bg-[#181715] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#DFC38C]/15 border border-[#DFC38C]/40 mx-auto flex items-center justify-center text-[#DFC38C]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-medium text-white">Verifica tu Pase de Invitado</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Para cuidar la privacidad de la celebración, confirma tu nombre para firmar tus recuerdos en pantalla.
              </p>
            </div>

            {/* Buscador de Pase de Invitado */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLoadGuests}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                {searchingGuests ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DFC38C]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#DFC38C]" />
                )}
                <span>Buscar mi nombre en la lista oficial</span>
              </button>

              {guestList.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <input
                    type="text"
                    value={guestSearchQuery}
                    onChange={(e) => setGuestSearchQuery(e.target.value)}
                    placeholder="Filtrar por tu nombre o familia..."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#DFC38C]"
                  />
                  <div className="divide-y divide-white/5">
                    {guestList
                      .filter((g) =>
                        g.name.toLowerCase().includes(guestSearchQuery.toLowerCase())
                      )
                      .slice(0, 6)
                      .map((g, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectGuest(g)}
                          className="w-full py-2 px-2 text-left text-xs text-zinc-200 hover:bg-white/5 rounded flex items-center justify-between"
                        >
                          <span className="font-medium">{g.name}</span>
                          <span className="text-[10px] text-[#DFC38C]">Elegir →</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-3 text-[11px] text-zinc-500 uppercase tracking-widest">
                  O escribe tu nombre
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <form onSubmit={handleManualConfirm} className="space-y-3">
                <input
                  type="text"
                  required
                  value={manualGuestName}
                  onChange={(e) => setManualGuestName(e.target.value)}
                  placeholder="Tu Nombre y Apellido"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#DFC38C] transition-all"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#DFC38C] text-black font-semibold text-sm hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Continuar a la Cámara</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* PASO 2: CÁMARA INSTANTÁNEA Y SUBIDA EN VIVO */
          <div className="space-y-5">
            {/* Guest Banner */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#DFC38C]" />
                <span className="text-xs font-medium text-zinc-200">
                  {verifiedGuestName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVerified(false);
                  sessionStorage.removeItem(`aurea_guest_${event?.eventId || rawSlug}`);
                }}
                className="text-[11px] text-zinc-400 hover:text-white underline"
              >
                Cambiar
              </button>
            </div>

            {/* Hidden Camera Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Vista Previa o Botón de Captura */}
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-[#DFC38C]/40 hover:border-[#DFC38C] bg-[#181715] rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 transition-all hover:bg-[#1f1e1b] group shadow-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-[#DFC38C]/15 border border-[#DFC38C]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-10 h-10 text-[#DFC38C]" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-white">
                    Tomar Foto o Elegir de Galería
                  </p>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Tu fotografía aparecerá al instante en las pantallas gigantes del evento.
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full bg-[#DFC38C] text-black text-xs font-semibold shadow">
                  Abrir Cámara
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black aspect-[4/3] max-h-[340px] shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs text-white hover:bg-black flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-[#DFC38C]" />
                    <span>Cambiar Foto</span>
                  </button>
                </div>

                {/* Dedicatoria opcional */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Dedicatoria o Mensaje (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="¡Felicidades por este gran día! Que viva el amor..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181715] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#DFC38C] resize-none"
                  />
                </div>

                {/* Botón de Subida */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleUpload}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#DFC38C] to-[#C5A059] text-black font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Proyectando en pantalla...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Publicar en Pantalla y Álbum ✨</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Mensaje de Éxito y Nueva Foto */}
            {uploadSuccess && (
              <div className="p-4 rounded-2xl bg-[#DFC38C]/10 border border-[#DFC38C]/30 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#DFC38C]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Fotografía subida con éxito!</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Ya está proyectándose en el salón y guardada en el recuerdo del evento.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setUploadSuccess(false);
                    fileInputRef.current?.click();
                  }}
                  className="text-xs font-semibold text-[#DFC38C] underline hover:text-white pt-1 inline-block"
                >
                  Subir otra foto +
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-5 py-4 border-t border-white/10 text-center text-[11px] text-zinc-500">
        <p>Áurea — Experiencias de Alta Gama & Álbum en Vivo</p>
      </footer>
    </div>
  );
}

export default function SubirFotoExpressPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#12110F] text-zinc-400 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#DFC38C]" />
        </div>
      }
    >
      <SubirFotoExpressInner />
    </Suspense>
  );
}
