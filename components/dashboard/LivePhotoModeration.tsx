"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Tv,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { LivePhoto } from "@/lib/types";

interface LivePhotoModerationProps {
  photos: LivePhoto[];
  loading: boolean;
  isRefreshing: boolean;
  eventId: string;
  onRefresh: () => void;
  onDeletePhoto: (photoId: string) => Promise<boolean>;
  onToggleVisibility: (photoId: string, hiddenFromTv: boolean) => Promise<boolean>;
}

export function LivePhotoModeration({
  photos,
  loading,
  isRefreshing,
  eventId,
  onRefresh,
  onDeletePhoto,
  onToggleVisibility,
}: LivePhotoModerationProps) {
  const [selectedPhotoForLightbox, setSelectedPhotoForLightbox] = useState<LivePhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<LivePhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);
    try {
      const ok = await onDeletePhoto(photoToDelete.photoId);
      if (ok) {
        showFeedback("Fotografía eliminada permanentemente del evento.");
        setPhotoToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async (photo: LivePhoto) => {
    setTogglingId(photo.photoId);
    try {
      const nextHidden = !photo.hiddenFromTv;
      const ok = await onToggleVisibility(photo.photoId, nextHidden);
      if (ok) {
        showFeedback(
          nextHidden
            ? "Fotografía ocultada de la pantalla del Modo TV."
            : "Fotografía visible nuevamente en la pantalla del Modo TV."
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionSuccessMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1E1C1A] text-[#FAF7F2] border border-[#DFC9A6] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E8DFC8] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3EBDD] border border-[#DECDB3] flex items-center justify-center text-[#7A5C30]">
              <Camera className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 font-serif">
                Moderación del Álbum en Vivo
              </h2>
              <p className="text-xs text-zinc-500">
                {photos.length} {photos.length === 1 ? "fotografía recibida" : "fotografías recibidas"} en tiempo real
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C5A059]" : ""}`} />
            <span>Refrescar</span>
          </button>

          <Link
            href={`/modo-tv?eventId=${eventId}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1C1A] text-white hover:bg-black text-xs font-semibold shadow-sm transition-all"
          >
            <Tv className="w-3.5 h-3.5 text-[#DFC07D]" />
            <span>Ver Modo TV ↗</span>
          </Link>

          <Link
            href={`/subir/${eventId}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C5A059] text-zinc-950 font-bold hover:bg-[#b08b45] text-xs shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Portal Subir Foto</span>
          </Link>
        </div>
      </div>

      {/* Grid de Fotos */}
      {loading && photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#E8DFC8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A059] mb-3" />
          <p className="text-sm text-zinc-500">Cargando fotos del álbum...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DFC8] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E8DFC8] mx-auto flex items-center justify-center text-zinc-400">
            <Camera className="w-8 h-8 text-[#C5A059]" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-zinc-800">No hay fotos en vivo todavía</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Las fotografías que tomen los invitados aparecerán aquí al instante para que puedas supervisarlas, ocultarlas del proyector o eliminarlas.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {photos.map((photo) => (
            <div
              key={photo.photoId}
              className={`group bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                photo.hiddenFromTv ? "border-amber-300/80 bg-amber-50/20" : "border-[#E8DFC8]"
              }`}
            >
              <div>
                {/* Imagen Preview con Lightbox */}
                <div
                  onClick={() => setSelectedPhotoForLightbox(photo)}
                  className="relative aspect-[4/3] bg-zinc-100 cursor-pointer overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.author || "Foto del evento"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    {photo.hiddenFromTv ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        <span>Oculta de TV</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Visible en TV</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-semibold text-zinc-900 truncate">
                      <User className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="truncate">{photo.author || "Invitado"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(photo.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {photo.message && (
                    <p className="text-xs text-zinc-600 italic bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFC8]/60 line-clamp-2">
                      “{photo.message}”
                    </p>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="px-4 pb-4 pt-1 flex items-center gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={togglingId === photo.photoId}
                  onClick={() => handleToggle(photo)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    photo.hiddenFromTv
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200"
                  }`}
                  title={photo.hiddenFromTv ? "Mostrar en la pantalla gigante" : "Ocultar de la pantalla gigante"}
                >
                  {togglingId === photo.photoId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : photo.hiddenFromTv ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mostrar en TV</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ocultar de TV</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoToDelete(photo)}
                  className="py-2 px-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1"
                  title="Eliminar permanentemente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only">Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhotoForLightbox && (
        <div
          onClick={() => setSelectedPhotoForLightbox(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#181715] text-white rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
          >
            <button
              onClick={() => setSelectedPhotoForLightbox(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[4/3] max-h-[70vh] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhotoForLightbox.url}
                alt={selectedPhotoForLightbox.author}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-5 flex items-center justify-between bg-[#12110F] border-t border-white/10">
              <div>
                <p className="text-sm font-bold text-white">
                  {selectedPhotoForLightbox.author}
                </p>
                {selectedPhotoForLightbox.message && (
                  <p className="text-xs text-zinc-300 italic mt-0.5">
                    “{selectedPhotoForLightbox.message}”
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggle(selectedPhotoForLightbox);
                    setSelectedPhotoForLightbox((prev) =>
                      prev ? { ...prev, hiddenFromTv: !prev.hiddenFromTv } : null
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20 text-white"
                >
                  {selectedPhotoForLightbox.hiddenFromTv ? "Mostrar en TV" : "Ocultar de TV"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toDel = selectedPhotoForLightbox;
                    setSelectedPhotoForLightbox(null);
                    setPhotoToDelete(toDel);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-900/60 text-rose-200 text-xs font-semibold hover:bg-rose-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal de Eliminación */}
      {photoToDelete && (
        <div
          onClick={() => !isDeleting && setPhotoToDelete(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4 font-sans text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 font-serif">
                ¿Eliminar esta fotografía?
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Esta acción eliminará el archivo de S3 y de la base de datos de inmediato. Dejará de aparecer en las pantallas del Modo TV y en la invitación de los novios.
              </p>
            </div>

            {/* Miniatura de confirmación */}
            <div className="w-32 h-24 mx-auto rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoToDelete.url}
                alt="Foto a borrar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, Eliminar Foto</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
