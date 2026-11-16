"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  PartyPopper,
  Calendar,
  MapPin,
  Sparkles,
  Loader2,
  Tv,
} from "lucide-react";
import { EventMeta, Guest, Table } from "@/lib/types";
import { TableFinder } from "@/components/kit/TableFinder";
import { LiveTimeline } from "@/components/kit/LiveTimeline";
import { BanquetMenu } from "@/components/kit/BanquetMenu";
import { WifiCard } from "@/components/kit/WifiCard";
import { LiveAlbum } from "@/components/kit/LiveAlbum";

export default function KitDelDiaPage() {
  const eventId = "camila-andres-2025";
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKitData() {
      try {
        const [eventRes, guestsRes, tablesRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/guests`),
          fetch(`/api/events/${eventId}/tables`),
        ]);

        const eventData = await eventRes.json();
        const guestsData = await guestsRes.json();
        const tablesData = await tablesRes.json();

        if (eventData.event) setEvent(eventData.event);
        if (guestsData.guests) setGuests(guestsData.guests);
        if (tablesData.tables) setTables(tablesData.tables);
      } catch (err) {
        console.error("Error loading kit data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadKitData();
  }, [eventId]);

  if (loading || !event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="font-serif italic text-xl text-carbon-700">
          Abriendo el kit de la celebración...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-12">
      {/* Header Banner */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EBDD] border border-[#DFC9A6] text-[#7A5C30] text-xs font-serif italic tracking-wide">
          <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
          <span>Tu Guía para Disfrutar la Fiesta</span>
        </div>

        <h1 className="font-serif italic text-4xl sm:text-6xl text-carbon-900 font-bold">
          El Día de la Boda • {event.title}
        </h1>

        <p className="text-xs sm:text-base text-carbon-600 max-w-xl mx-auto font-serif italic">
          Todo lo que necesitas saber hoy en {event.venueName}, {event.venueCity}.
        </p>
      </section>

      {/* 1. Fast Table Finder */}
      <section id="mesa">
        <TableFinder guests={guests} tables={tables} />
      </section>

      {/* 2. Fast Wi-Fi Card */}
      <section id="wifi">
        <WifiCard event={event} />
      </section>

      {/* 3. Live Wedding Minute-by-Minute Timeline */}
      <section id="cronograma">
        <LiveTimeline itinerary={event.itinerary} />
      </section>

      {/* 4. Collaborative Live Photo Album */}
      <section id="album">
        <LiveAlbum event={event} />
      </section>

      {/* 5. Banquet Menu */}
      <section id="menu">
        <BanquetMenu event={event} />
      </section>
    </div>
  );
}
