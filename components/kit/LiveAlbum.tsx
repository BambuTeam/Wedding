"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  Heart,
  Tv,
  Loader2,
  Sparkles,
} from "lucide-react";
import { LivePhoto, EventMeta } from "@/lib/types";

interface LiveAlbumProps {
  event: EventMeta;
}

export function LiveAlbum({ event }: LiveAlbumProps) {
  const [photos, setPhotos] = useState<LivePhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/events/${event.eventId}/photos`);
      const data = await res.json();
      if (data.photos) setPhotos(data.photos);
    } catch (e) {
      console.error("Error fetching album photos:", e);
    }
  };

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 5000);
    return () => clearInterval(interval);
  }, [event.eventId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) return;

    setIsUploading(true);
    try {
      const uploadUrlRes = await fetch(`/api/events/${event.eventId}/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile?.name || "photo.jpg",
          contentType: selectedFile?.type || "image/jpeg",
        }),
      });

      const uploadUrlData = await uploadUrlRes.json();
      let finalPhotoUrl = uploadUrlData.publicUrl;

      if (!uploadUrlData.isDemoFallback && uploadUrlData.uploadUrl && selectedFile) {
        await fetch(uploadUrlData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
      } else if (previewUrl) {
        finalPhotoUrl = previewUrl;
      }

      await fetch(`/api/events/${event.eventId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalPhotoUrl,
          author: authorName || "Invitado en la fiesta",
          message: message || "¡Celebrando con todo el amor a Camila & Andrés!",
        }),
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage("");
      fetchPhotos();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-luxury p-6 sm:p-8 text-carbon-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DFC8]/60 gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-xs font-serif italic border border-[#DECDB3] mb-1">
            <Camera className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Recuerdos Compartidos</span>
          </div>
          <h3 className="font-serif italic text-3xl sm:text-4xl font-bold">
            Los Recuerdos a Través de Tus Ojos
          </h3>
          <p className="text-xs text-carbon-500 mt-0.5 font-serif italic">
            Tus fotos con los novios aparecen en la pantalla de la fiesta y se guardan en su álbum para siempre.
          </p>
        </div>

        <a
          href="/modo-tv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1C1A] hover:bg-carbon-800 text-[#DFC07D] text-xs font-serif italic shrink-0 shadow-sm"
        >
          <Tv className="w-4 h-4" />
          <span>Ver Pantalla de la Fiesta</span>
        </a>
      </div>

      {/* Upload Box */}
      <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] border border-[#DFC9A6]">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Image Selector / Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-48 h-36 rounded-2xl border-2 border-dashed border-[#DFC9A6] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#FDFBF9] transition-colors overflow-hidden relative shrink-0"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3">
                  <Camera className="w-7 h-7 text-[#C5A059] mx-auto mb-1" />
                  <span className="text-xs font-serif italic font-bold text-carbon-800 block">
                    Tomar o Elegir Foto
                  </span>
                  <span className="text-[10px] text-carbon-400 font-sans">
                    Cámara o galería
                  </span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Inputs */}
            <div className="flex-1 w-full space-y-2">
              <input
                type="text"
                placeholder="Tu nombre (ej. Lucía Álvarez)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-xs text-carbon-900 bg-white focus:outline-none focus:border-[#C5A059]"
              />

              <input
                type="text"
                placeholder="Un mensaje o dedicatoria para la foto..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-xs text-carbon-900 bg-white focus:outline-none focus:border-[#C5A059]"
              />

              <button
                type="submit"
                disabled={isUploading || (!selectedFile && !previewUrl)}
                className="w-full py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#B88E3E] text-carbon-950 font-bold text-xs uppercase tracking-wider font-sans shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-carbon-950" />
                    <span>Compartiendo recuerdo...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-carbon-950 text-carbon-950" />
                    <span>Subir Recuerdo a la Pantalla</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Photos Masonry Feed */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {photos.map((p) => (
          <div
            key={p.photoId}
            className="break-inside-avoid rounded-2xl overflow-hidden bg-white border border-[#E8DFC8] shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="relative aspect-4/3 w-full bg-carbon-100 overflow-hidden">
              <img
                src={p.url}
                alt={p.author}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif italic font-bold text-carbon-900 truncate">
                  {p.author}
                </span>
                <span className="text-[10px] text-carbon-400 font-sans">
                  {new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {p.message && (
                <p className="text-xs text-carbon-600 font-serif italic leading-snug">
                  &ldquo;{p.message}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
