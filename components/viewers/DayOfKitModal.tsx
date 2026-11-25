"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Loader2, Sparkles, Heart } from "lucide-react";
import { EventMeta, Guest, Table } from "@/lib/types";
import { TableFinder } from "@/components/kit/TableFinder";
import { LiveTimeline } from "@/components/kit/LiveTimeline";
import { BanquetMenu } from "@/components/kit/BanquetMenu";
import { WifiCard } from "@/components/kit/WifiCard";
import { LiveAlbum } from "@/components/kit/LiveAlbum";
import { MOCK_EVENTS, MOCK_GUESTS, MOCK_TABLES } from "@/lib/db/mock-data";

interface DayOfKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
}

export function DayOfKitModal({
  isOpen,
  onClose,
  eventId = "camila-andres-2025",
}: DayOfKitModalProps) {
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function loadKitData() {
      setLoading(true);
      let foundEvent: EventMeta | null = null;
      let foundGuests: Guest[] = [];
      let foundTables: Table[] = [];

      try {
        const [eventRes, guestsRes, tablesRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/guests`),
          fetch(`/api/events/${eventId}/tables`),
        ]);

        if (eventRes.ok) {
          const contentType = eventRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const eventData = await eventRes.json();
            if (eventData?.event) foundEvent = eventData.event;
          }
        }

        if (guestsRes.ok) {
          const contentType = guestsRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const guestsData = await guestsRes.json();
            if (guestsData?.guests) foundGuests = guestsData.guests;
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
        console.warn("API fetch fallback triggered for kit:", err);
      }

      if (!foundEvent) {
        foundEvent = MOCK_EVENTS[eventId] || MOCK_EVENTS["camila-andres-2025"];
      }

      if (foundGuests.length === 0) {
        foundGuests = MOCK_GUESTS[eventId] || MOCK_GUESTS["camila-andres-2025"] || [];
      }

      if (foundTables.length === 0) {
        foundTables = MOCK_TABLES[eventId] || MOCK_TABLES["camila-andres-2025"] || [];
      }

      setEvent(foundEvent);
      setGuests(foundGuests);
      setTables(foundTables);
      setLoading(false);
    }

    loadKitData();
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-lenis-prevent
        className="fixed inset-0 z-50 bg-[#FAF8F5] overflow-y-auto"
      >
        {/* Floating Top Control Bar */}
        <div className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8DFC8]/60 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#DFC9A6] text-zinc-700 hover:text-zinc-900 hover:bg-white text-[13px] font-sans font-medium shadow-sm transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a AUREA</span>
          </button>

          <div className="text-center">
            <span className="font-sans text-sm text-zinc-800 font-semibold">
              El Día de la Celebración
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            aria-label="Cerrar vista"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading || !event ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#B89758]" />
            <p className="font-sans text-lg text-zinc-700 font-medium">
              Preparando la experiencia del evento...
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
            {/* Header */}
            <div className="text-center space-y-3">
              <span className="text-[12px] uppercase tracking-widest text-[#8F7138] font-sans font-semibold">
                Kit de Recepción y Fiesta
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 font-normal">
                {event.brideName} &amp; {event.groomName}
              </h1>
              <p className="text-[13px] sm:text-sm font-sans text-zinc-600">
                {event.venueName} · {event.eventDateFormatted}
              </p>
            </div>

            {/* Table Finder */}
            <TableFinder guests={guests} tables={tables} />

            {/* Live Timeline */}
            <LiveTimeline itinerary={event.itinerary} />

            {/* Menu */}
            <BanquetMenu event={event} />

            {/* WiFi */}
            <WifiCard event={event} />

            {/* Live Photo Album */}
            <LiveAlbum event={event} />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
