"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  Calendar,
  MapPin,
  Heart,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { Guest, EventMeta, Table } from "@/lib/types";
import { MOCK_EVENTS, MOCK_GUESTS, MOCK_TABLES } from "@/lib/db/mock-data";
import { Envelope } from "@/components/invitation/Envelope";
import { PassQR } from "@/components/invitation/PassQR";
import { Countdown } from "@/components/invitation/Countdown";
import { Itinerary } from "@/components/invitation/Itinerary";
import { DressCode } from "@/components/invitation/DressCode";
import { GiftRegistry } from "@/components/invitation/GiftRegistry";
import { RsvpModal } from "@/components/invitation/RsvpModal";

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  guestToken?: string;
}

export function InvitationModal({
  isOpen,
  onClose,
  eventId = "camila-andres-2025",
  guestToken = "rivas-molina",
}: InvitationModalProps) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    async function loadData() {
      setLoading(true);
      let foundEvent: EventMeta | null = null;
      let foundGuest: Guest | null = null;
      let foundTables: Table[] = [];

      try {
        const [eventRes, guestRes, tablesRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/guests/${guestToken}`),
          fetch(`/api/events/${eventId}/tables`),
        ]);

        if (eventRes.ok) {
          const contentType = eventRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const eventData = await eventRes.json();
            if (eventData?.event) foundEvent = eventData.event;
          }
        }

        if (guestRes.ok) {
          const contentType = guestRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const guestData = await guestRes.json();
            if (guestData?.guest) foundGuest = guestData.guest;
          }
        }

        if (tablesRes.ok) {
          const contentType = tablesRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const tablesData = await tablesRes.json();
            if (tablesData?.tables) foundTables = tablesData.tables;
          }
        }
      } catch (err) {
        console.warn("API fetch fallback triggered:", err);
      }

      // Safe local fallback
      if (!foundEvent) {
        foundEvent = MOCK_EVENTS[eventId] || MOCK_EVENTS["camila-andres-2025"];
      }

      if (!foundGuest) {
        const eventGuests = MOCK_GUESTS[eventId] || MOCK_GUESTS["camila-andres-2025"] || [];
        foundGuest =
          eventGuests.find((g) => g.guestToken === guestToken) ||
          eventGuests[0] || {
            guestToken,
            eventId,
            familyName: "Familia Invitada Especial",
            primaryContactName: "Invitado de Honor",
            maxSeats: 2,
            confirmedSeats: 2,
            status: "OPENED",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
      }

      if (!foundTables || foundTables.length === 0) {
        foundTables = MOCK_TABLES[eventId] || MOCK_TABLES["camila-andres-2025"] || [];
      }

      setEvent(foundEvent);
      setGuest(foundGuest);
      setTables(foundTables);
      setLoading(false);
    }

    loadData();

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, eventId, guestToken]);

  if (!isOpen) return null;

  const assignedTable = tables.find((t) => t.tableId === guest?.tableId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-lenis-prevent
        className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#FAF7F2] min-h-screen pb-24"
      >
        {/* Floating Top Control Bar */}
        <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFC8]/60 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#DFC9A6] text-zinc-700 hover:text-zinc-900 hover:bg-white text-[13px] font-sans font-medium shadow-sm transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a AUREA</span>
          </button>

          <span className="font-serif tracking-[0.2em] text-sm text-zinc-800 font-medium">AUREA</span>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            aria-label="Cerrar invitación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading || !event || !guest ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#B89758]" />
            <p className="font-sans text-lg text-zinc-700 font-medium">
              Abriendo carta de invitación...
            </p>
          </div>
        ) : (
          <div className="relative pb-24 overflow-hidden max-w-4xl mx-auto px-4">
            {/* Interactive Envelope Overlay */}
            <Envelope
              guest={guest}
              event={event}
              startClosed={true}
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
            <section className="relative px-4 pt-10 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EBDD] border border-[#DFC9A6] text-[#7A5C30] text-[13px] font-sans font-semibold tracking-wide">
                <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                <span>{event.category || "Celebración"}</span>
              </div>

              <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-zinc-900 tracking-tight leading-none">
                {event.hostNames || `${event.brideName} & ${event.groomName}`}
              </h1>

              <p className="font-serif italic text-lg sm:text-2xl text-zinc-700 max-w-2xl mx-auto leading-relaxed">
                &ldquo;{event.tagline}&rdquo;
              </p>

              {/* Date and Venue */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[13px] sm:text-sm font-sans font-medium text-zinc-700 pt-2 pb-4">
                <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E8DFC8] shadow-sm">
                  <Calendar className="w-4 h-4 text-[#B89758]" />
                  <span>{event.eventDateFormatted}</span>
                </div>

                <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E8DFC8] shadow-sm">
                  <MapPin className="w-4 h-4 text-[#B89758]" />
                  <span>
                    {event.venueName}, {event.venueCity}
                  </span>
                </div>
              </div>

              {/* Countdown */}
              <Countdown targetDate={event.eventDate} />
            </section>

            {/* Story Section */}
            {event.ourStory && (
              <section className="px-4 my-16 max-w-2xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[13px] font-sans font-semibold border border-[#DFC9A6]">
                  <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                  <span>Nuestra Historia</span>
                </div>
                <p className="font-serif italic text-xl sm:text-2xl text-zinc-800 leading-relaxed">
                  &ldquo;{event.ourStory}&rdquo;
                </p>
              </section>
            )}

            {/* Itinerary */}
            <section className="px-4 my-16">
              <Itinerary event={event} />
            </section>

            {/* Dress Code */}
            <section className="px-4 my-16">
              <DressCode event={event} />
            </section>

            {/* Gift Registry */}
            <section className="px-4 my-16">
              <GiftRegistry event={event} />
            </section>

            {/* RSVP Card */}
            <section className="px-4 my-16 max-w-2xl mx-auto">
              <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#DFC9A6] shadow-xl text-center space-y-4">
                <span className="text-[12px] font-sans font-semibold text-[#7A5C30] uppercase tracking-widest block">
                  Confirmación de Asistencia
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
                  {guest.familyName}
                </h2>

                <p className="text-[13px] sm:text-sm text-zinc-700 font-sans max-w-md mx-auto">
                  Hemos reservado {guest.maxSeats}{" "}
                  {guest.maxSeats === 1 ? "lugar especial" : "lugares especiales"} con todo nuestro
                  cariño para ustedes.
                </p>

                <div className="py-2 flex items-center justify-center gap-2">
                  {guest.status === "CONFIRMED" && (
                    <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[13px] font-sans font-semibold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Asistencia confirmada ({guest.confirmedSeats}{" "}
                      {guest.confirmedSeats === 1 ? "persona" : "personas"})
                    </span>
                  )}
                  {guest.status === "DECLINED" && (
                    <span className="px-4 py-1.5 rounded-full bg-stone-200 text-zinc-700 text-[13px] font-sans font-medium">
                      Nos acompañarás en pensamiento
                    </span>
                  )}
                  {(guest.status === "OPENED" || guest.status === "UNOPENED") && (
                    <span className="px-4 py-1.5 rounded-full bg-[#F3EBDD] text-[#7A5C30] border border-[#DFC9A6] text-[13px] font-sans font-semibold inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#B89758]" />
                      Pendiente de confirmación
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsRsvpOpen(true)}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8E6D38] via-[#C5A059] to-[#8E6D38] text-stone-950 font-bold text-[13px] font-sans uppercase tracking-widest shadow-md hover:opacity-95 transition-all flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4 text-stone-950" />
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
                  <span className="text-[12px] font-sans font-semibold text-[#7A5C30] tracking-widest uppercase">
                    Para el día de la celebración
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
                    Tu Pase de Bienvenida
                  </h3>
                  <p className="text-[13px] sm:text-sm text-zinc-700 max-w-md mx-auto font-sans">
                    Guarda este pase o tómale una captura de pantalla para tu llegada al evento.
                  </p>
                </div>
                <PassQR guest={guest} event={event} tableName={assignedTable?.name} />
              </section>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
