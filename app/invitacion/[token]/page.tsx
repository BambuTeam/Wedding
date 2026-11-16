"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  QrCode,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { Guest, EventMeta, Table } from "@/lib/types";
import { Envelope } from "@/components/invitation/Envelope";
import { PassQR } from "@/components/invitation/PassQR";
import { Countdown } from "@/components/invitation/Countdown";
import { Itinerary } from "@/components/invitation/Itinerary";
import { DressCode } from "@/components/invitation/DressCode";
import { GiftRegistry } from "@/components/invitation/GiftRegistry";
import { RsvpModal } from "@/components/invitation/RsvpModal";

export default function GuestInvitationPage() {
  const params = useParams();
  const token = params.token as string;
  const eventId = "camila-andres-2025";

  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [envelopeFinished, setEnvelopeFinished] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eventRes, guestRes, tablesRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/guests/${token}`),
          fetch(`/api/events/${eventId}/tables`),
        ]);

        const eventData = await eventRes.json();
        const guestData = await guestRes.json();
        const tablesData = await tablesRes.json();

        if (eventData.event) setEvent(eventData.event);
        if (guestData.guest) setGuest(guestData.guest);
        if (tablesData.tables) setTables(tablesData.tables);
      } catch (err) {
        console.error("Error loading invitation data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadData();
    }
  }, [token, eventId]);

  if (loading || !event || !guest) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-600" />
        <p className="font-serif italic text-lg text-carbon-600">
          Abriendo sobre digital exclusivo...
        </p>
      </div>
    );
  }

  const assignedTable = tables.find((t) => t.tableId === guest.tableId);

  return (
    <div className="relative pb-24 overflow-hidden">
      {/* Interactive Envelope Overlay for Unopened guests */}
      <Envelope
        guest={guest}
        event={event}
        onOpenComplete={() => {
          setEnvelopeFinished(true);
          // Refresh guest state
          setGuest((prev) => (prev ? { ...prev, status: "OPENED" } : null));
        }}
      />

      {/* RSVP Modal */}
      {isRsvpOpen && (
        <RsvpModal
          guest={guest}
          event={event}
          onClose={() => setIsRsvpOpen(false)}
          onSuccess={(updatedGuest) => {
            setGuest(updatedGuest);
            setIsRsvpOpen(false);
          }}
        />
      )}

      {/* Hero Section */}
      <section className="relative px-4 pt-4 sm:pt-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-champagne-100/80 border border-champagne-300 text-champagne-800 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
          <span>Nuestra Boda</span>
        </div>

        <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-carbon-900 tracking-tight leading-none mb-3">
          {event.brideName} <span className="text-champagne-500 font-light">&amp;</span> {event.groomName}
        </h1>

        <p className="font-serif italic text-lg sm:text-2xl text-carbon-600 max-w-2xl mx-auto mb-6">
          &ldquo;{event.tagline}&rdquo;
        </p>

        {/* Date and Venue summary pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-carbon-700 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-champagne-300/40 shadow-sm">
            <Calendar className="w-4 h-4 text-champagne-600" />
            <span>{event.eventDateFormatted}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-champagne-300/40 shadow-sm">
            <MapPin className="w-4 h-4 text-champagne-600" />
            <span>{event.venueName}, {event.venueCity}</span>
          </div>
        </div>

        {/* Countdown */}
        <Countdown targetDate={event.eventDate} />
      </section>

      {/* Guest Status Banner & Fast RSVP Trigger */}
      <section className="px-4 my-12 max-w-3xl mx-auto">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-alabaster-50 via-champagne-100/60 to-alabaster-50 border border-champagne-400/40 shadow-luxury text-center">
          <p className="text-xs uppercase tracking-widest text-carbon-500 font-semibold mb-1">
            Pase Personalizado
          </p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-carbon-900">
            {guest.familyName}
          </h2>

          <div className="my-4 flex items-center justify-center gap-2">
            <span className="text-xs text-carbon-600">Estado de respuesta:</span>
            {guest.status === "CONFIRMED" && (
              <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Confirmado ({guest.confirmedSeats} {guest.confirmedSeats === 1 ? "pase" : "pases"})
              </span>
            )}
            {guest.status === "DECLINED" && (
              <span className="px-3 py-0.5 rounded-full bg-carbon-200 text-carbon-700 text-xs font-semibold">
                No asistirá
              </span>
            )}
            {(guest.status === "OPENED" || guest.status === "UNOPENED") && (
              <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pendiente de Confirmar ({guest.maxSeats} {guest.maxSeats === 1 ? "lugar reservado" : "lugares reservados"})
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setIsRsvpOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 text-carbon-950 font-bold text-sm shadow-gold hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {guest.status === "CONFIRMED"
                  ? "Modificar mi Asistencia"
                  : "Confirmar Asistencia (RSVP)"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* QR Pass Section (If confirmed or for easy access) */}
      {guest.status === "CONFIRMED" && (
        <section className="px-4 my-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-xs font-semibold uppercase tracking-widest mb-2">
              <QrCode className="w-3.5 h-3.5 text-champagne-600" />
              <span>Acceso de Puerta</span>
            </div>
            <h3 className="font-serif italic text-3xl sm:text-4xl text-carbon-900">
              Tu Pase Digital de Recepción
            </h3>
            <p className="text-xs sm:text-sm text-carbon-500 mt-1 max-w-md mx-auto">
              Guarda este pase o tómale una captura de pantalla para un acceso rápido y sin filas.
            </p>
          </div>
          <PassQR
            guest={guest}
            event={event}
            tableName={assignedTable?.name}
          />
        </section>
      )}

      {/* Couple's Story Section */}
      <section className="px-4 my-16 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-xs font-semibold uppercase tracking-widest mb-3">
          <Heart className="w-3.5 h-3.5 text-champagne-600" />
          <span>Nuestra Historia</span>
        </div>
        <h3 className="font-serif italic text-3xl sm:text-4xl text-carbon-900 mb-4">
          El Camino Hacia el Sí
        </h3>
        <p className="font-serif italic text-lg sm:text-xl text-carbon-700 leading-relaxed">
          &ldquo;{event.ourStory}&rdquo;
        </p>
      </section>

      {/* Itinerary Section */}
      <section className="px-4 my-16">
        <Itinerary event={event} />
      </section>

      {/* Dress Code Section */}
      <section className="px-4 my-16">
        <DressCode event={event} />
      </section>

      {/* Gift Registry Section */}
      <section className="px-4 my-16">
        <GiftRegistry event={event} />
      </section>

      {/* Footer */}
      <footer className="mt-24 text-center text-xs text-carbon-400 border-t border-champagne-300/30 pt-8">
        <p className="font-serif italic text-lg text-champagne-700 mb-1">
          Camila &amp; Andrés
        </p>
        <p className="font-sans text-[11px] text-carbon-500">
          Experiencia diseñada con AUREA Boutique Digital Invitations &copy; 2026
        </p>
      </footer>
    </div>
  );
}
