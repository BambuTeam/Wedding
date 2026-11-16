"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
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
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="font-serif italic text-xl text-carbon-700">
          Abriendo tu carta con cariño...
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
      <section className="relative px-4 pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EBDD] border border-[#DFC9A6] text-[#7A5C30] text-xs font-serif italic tracking-wide">
          <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
          <span>Nuestra Boda</span>
        </div>

        <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-carbon-900 tracking-tight leading-none">
          {event.brideName} <span className="text-[#C5A059] font-light">&amp;</span> {event.groomName}
        </h1>

        <p className="font-serif italic text-lg sm:text-2xl text-carbon-600 max-w-2xl mx-auto leading-relaxed">
          &ldquo;{event.tagline}&rdquo;
        </p>

        {/* Date and Venue */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-carbon-700 pt-2 pb-4">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E8DFC8] shadow-sm font-serif italic">
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>{event.eventDateFormatted}</span>
          </div>

          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E8DFC8] shadow-sm font-serif italic">
            <MapPin className="w-4 h-4 text-[#C5A059]" />
            <span>{event.venueName}, {event.venueCity}</span>
          </div>
        </div>

        {/* Countdown */}
        <Countdown targetDate={event.eventDate} />
      </section>

      {/* Couple's Story Section */}
      <section className="px-4 my-16 max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-xs font-serif italic border border-[#DFC9A6]">
          <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
          <span>Nuestra Historia</span>
        </div>
        <h3 className="font-serif italic text-3xl sm:text-4xl text-carbon-900 font-bold">
          El Camino Hacia el Sí
        </h3>
        <p className="font-serif italic text-xl sm:text-2xl text-carbon-700 leading-relaxed max-w-2xl mx-auto">
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

      {/* RSVP Section */}
      <section className="px-4 my-16 max-w-2xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#DFC9A6] shadow-luxury text-center space-y-4">
          <span className="text-xs font-serif italic text-[#7A5C30] uppercase tracking-widest block">
            Confirmación de Asistencia
          </span>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-carbon-900 font-bold">
            {guest.familyName}
          </h2>

          <p className="text-xs sm:text-sm text-carbon-600 font-serif italic max-w-md mx-auto">
            Hemos reservado {guest.maxSeats} {guest.maxSeats === 1 ? "lugar especial" : "lugares especiales"} con todo nuestro cariño para ustedes.
          </p>

          <div className="py-2 flex items-center justify-center gap-2">
            {guest.status === "CONFIRMED" && (
              <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-serif italic inline-flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Asistencia confirmada ({guest.confirmedSeats} {guest.confirmedSeats === 1 ? "persona" : "personas"})
              </span>
            )}
            {guest.status === "DECLINED" && (
              <span className="px-4 py-1.5 rounded-full bg-carbon-200 text-carbon-700 text-xs font-serif italic">
                Nos acompañarás en pensamiento
              </span>
            )}
            {(guest.status === "OPENED" || guest.status === "UNOPENED") && (
              <span className="px-4 py-1.5 rounded-full bg-[#F3EBDD] text-[#7A5C30] border border-[#DFC9A6] text-xs font-serif italic inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C5A059]" />
                Pendiente de confirmación
              </span>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsRsvpOpen(true)}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8E6D38] via-[#C5A059] to-[#8E6D38] text-carbon-950 font-bold text-xs uppercase tracking-widest shadow-gold hover:opacity-95 transition-all flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-carbon-950" />
              <span>
                {guest.status === "CONFIRMED"
                  ? "Modificar confirmación"
                  : "Confirmar asistencia"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* QR Pass Section (Only shown when confirmed) */}
      {guest.status === "CONFIRMED" && (
        <section className="px-4 my-16">
          <div className="text-center mb-6 space-y-1">
            <span className="text-xs font-serif italic text-[#7A5C30] tracking-widest uppercase">
              Para el día de la celebración
            </span>
            <h3 className="font-serif italic text-3xl sm:text-4xl text-carbon-900 font-bold">
              Tu Pase de Bienvenida
            </h3>
            <p className="text-xs sm:text-sm text-carbon-600 max-w-md mx-auto font-serif italic">
              Guarda este pase o tómale una captura de pantalla para tu llegada al convento.
            </p>
          </div>
          <PassQR
            guest={guest}
            event={event}
            tableName={assignedTable?.name}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="mt-20 text-center text-xs text-carbon-500 border-t border-[#E8DFC8] pt-8 space-y-1">
        <p className="font-serif italic text-2xl text-[#7A5C30]">
          Camila &amp; Andrés
        </p>
        <p className="font-serif italic text-xs text-carbon-500">
          Convento de las Capuchinas • Antigua Guatemala
        </p>
      </footer>
    </div>
  );
}
