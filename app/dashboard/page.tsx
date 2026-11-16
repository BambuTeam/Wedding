"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  RefreshCw,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2,
  Tv,
} from "lucide-react";
import { EventMeta, Guest, Table, EventDashboardStats } from "@/lib/types";
import { EventSelector } from "@/components/dashboard/EventSelector";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { GuestsTable } from "@/components/dashboard/GuestsTable";
import { SeatingChart } from "@/components/dashboard/SeatingChart";
import { CheckInScanner } from "@/components/dashboard/CheckInScanner";
import { MOCK_EVENTS } from "@/lib/db/mock-data";

export default function DashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("camila-andres-2025");
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [stats, setStats] = useState<EventDashboardStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"invitados" | "mesas" | "recepcion">("invitados");

  const allEventsList = Object.values(MOCK_EVENTS);

  const loadDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [eventRes, guestsRes, tablesRes] = await Promise.all([
        fetch(`/api/events/${selectedEventId}`),
        fetch(`/api/events/${selectedEventId}/guests`),
        fetch(`/api/events/${selectedEventId}/tables`),
      ]);

      const eventData = await eventRes.json();
      const guestsData = await guestsRes.json();
      const tablesData = await tablesRes.json();

      if (eventData.event) setEvent(eventData.event);
      if (eventData.stats) setStats(eventData.stats);
      if (guestsData.guests) setGuests(guestsData.guests);
      if (tablesData.tables) setTables(tablesData.tables);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedEventId]);

  if (loading || !event || !stats) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="font-serif italic text-xl text-carbon-700">
          Abriendo el panel de la boda...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <EventSelector
            currentEvent={event}
            allEvents={allEventsList}
            onSelectEvent={(id) => {
              setSelectedEventId(id);
              setLoading(true);
            }}
          />

          <div className="hidden sm:flex items-center gap-2 text-xs font-serif italic text-carbon-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Actualizado en tiempo real</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboardData(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#DFC9A6] text-carbon-700 hover:bg-[#FAF7F2] text-xs font-medium shadow-sm transition-all font-sans"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C5A059]" : ""}`} />
            <span>Actualizar</span>
          </button>

          <Link
            href="/invitacion/rivas-molina"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E1C1A] text-white hover:bg-carbon-800 text-xs font-medium shadow-sm transition-all font-sans"
          >
            <span>Ver carta de un invitado</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#DFC07D]" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <KpiCards stats={stats} />

      {/* Human Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 font-serif italic text-base">
        <button
          onClick={() => setActiveTab("invitados")}
          className={`px-5 py-2.5 rounded-2xl transition-all ${
            activeTab === "invitados"
              ? "bg-[#1E1C1A] text-white shadow-sm font-bold"
              : "text-carbon-600 hover:bg-[#FAF7F2]"
          }`}
        >
          ¿Quiénes nos acompañan? ({guests.length})
        </button>

        <button
          onClick={() => setActiveTab("mesas")}
          className={`px-5 py-2.5 rounded-2xl transition-all ${
            activeTab === "mesas"
              ? "bg-[#1E1C1A] text-white shadow-sm font-bold"
              : "text-carbon-600 hover:bg-[#FAF7F2]"
          }`}
        >
          Acomodo de mesas ({tables.length})
        </button>

        <button
          onClick={() => setActiveTab("recepcion")}
          className={`px-5 py-2.5 rounded-2xl transition-all ${
            activeTab === "recepcion"
              ? "bg-[#C5A059] text-carbon-950 font-bold shadow-gold"
              : "text-carbon-600 hover:bg-[#FAF7F2]"
          }`}
        >
          Bienvenida en recepción
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "invitados" && (
        <GuestsTable
          guests={guests}
          event={event}
          tables={tables}
          onRefresh={() => loadDashboardData()}
        />
      )}

      {activeTab === "mesas" && (
        <SeatingChart
          tables={tables}
          guests={guests}
          eventId={event.eventId}
          onRefresh={() => loadDashboardData()}
        />
      )}

      {activeTab === "recepcion" && (
        <CheckInScanner
          guests={guests}
          event={event}
          onCheckInSuccess={() => loadDashboardData()}
        />
      )}
    </div>
  );
}
