"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  Heart,
  Sparkles,
  Send,
  Loader2,
  Tv,
  MessageSquare,
  Check,
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
    const interval = setInterval(fetchPhotos, 5000); // 5s intelligent poll for live TV sync
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
      // 1. Get presigned upload URL or demo fallback
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

      // 2. If AWS S3 presigned URL is available, execute PUT direct upload
      if (!uploadUrlData.isDemoFallback && uploadUrlData.uploadUrl && selectedFile) {
        await fetch(uploadUrlData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFile.type,
          },
          body: selectedFile,
        });
      } else if (previewUrl) {
        // Fallback demo image
        finalPhotoUrl = previewUrl;
      }

      // 3. Register photo in repository
      await fetch(`/api/events/${event.eventId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalPhotoUrl,
          author: authorName || "Invitado en la Fiesta",
          message: message || "¡Momento inolvidable con Camila & Andrés!",
        }),
      });

      // Reset form & reload feed
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
    <div className="rounded-3xl bg-white border border-champagne-400/40 shadow-luxury p-6 sm:p-8 text-carbon-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-champagne-200 gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-xs font-semibold uppercase tracking-widest mb-1">
            <Camera className="w-3.5 h-3.5 text-champagne-600" />
            <span>Álbum Colaborativo en Vivo</span>
          </div>
          <h3 className="font-serif italic text-3xl sm:text-4xl font-semibold">
            Los Recuerdos a Través de Tus Ojos
          </h3>
          <p className="text-xs text-carbon-500 mt-0.5">
            Tus fotos se proyectan automáticamente en las pantallas del Modo TV durante la fiesta.
          </p>
        </div>

        <a
          href="/modo-tv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-carbon-900 hover:bg-carbon-800 text-champagne-300 text-xs font-semibold shrink-0 shadow-sm"
        >
          <Tv className="w-4 h-4" />
          <span>Ver Pantalla TV en Vivo</span>
        </a>
      </div>

      {/* Upload Box */}
      <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-alabaster-50 via-champagne-50/50 to-alabaster-50 border border-champagne-300/80">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Image Selector / Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-48 h-36 rounded-2xl border-2 border-dashed border-champagne-400 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-champagne-50 transition-colors overflow-hidden relative shrink-0"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3">
                  <Camera className="w-7 h-7 text-champagne-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-carbon-800 block">
                    Tomar o Elegir Foto
                  </span>
                  <span className="text-[10px] text-carbon-400">
                    JPG, PNG o Cámara
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
                className="w-full px-3 py-2 rounded-xl border border-carbon-300 text-xs text-carbon-900 bg-white focus:outline-none focus:border-champagne-500"
              />

              <input
                type="text"
                placeholder="Un mensaje para los novios o dedicatoria..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-carbon-300 text-xs text-carbon-900 bg-white focus:outline-none focus:border-champagne-500"
              />

              <button
                type="submit"
                disabled={isUploading || (!selectedFile && !previewUrl)}
                className="w-full py-2.5 rounded-xl bg-champagne-500 hover:bg-champagne-600 text-carbon-950 font-bold text-xs shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-carbon-950" />
                    <span>Publicando en vivo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-carbon-950" />
                    <span>Subir Foto al Álbum &amp; Modo TV</span>
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
            className="break-inside-avoid rounded-2xl overflow-hidden bg-white border border-champagne-300/60 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="relative aspect-4/3 w-full bg-carbon-100 overflow-hidden">
              <img
                src={p.url}
                alt={p.author}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-carbon-900 truncate">
                  {p.author}
                </span>
                <span className="text-[10px] text-carbon-400">
                  {new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {p.message && (
                <p className="text-xs text-carbon-600 leading-snug">
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
