"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  LayoutDashboard,
  Layers,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2,
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
    // Intelligent periodic polling every 10 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedEventId]);

  if (loading || !event || !stats) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-600" />
        <p className="font-serif italic text-lg text-carbon-600">
          Cargando suite operativa de Wedding Planner...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-4">
          <EventSelector
            currentEvent={event}
            allEvents={allEventsList}
            onSelectEvent={(id) => {
              setSelectedEventId(id);
              setLoading(true);
            }}
          />

          <div className="hidden sm:flex items-center gap-2 text-xs text-carbon-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronización en vivo activa</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboardData(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-carbon-200 text-carbon-700 hover:bg-carbon-50 text-xs font-semibold shadow-sm transition-all"
            title="Recargar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-champagne-600" : ""}`} />
            <span>Actualizar</span>
          </button>

          <a
            href={`/invitacion/rivas-molina`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-900 text-champagne-200 text-xs font-semibold shadow-sm transition-all"
          >
            <span>Ver Invitación Digital</span>
            <ExternalLink className="w-3.5 h-3.5 text-champagne-400" />
          </a>
        </div>
      </div>

      {/* KPI Cards Row */}
      <KpiCards stats={stats} />

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-carbon-200 pb-2">
        <button
          onClick={() => setActiveTab("invitados")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "invitados"
              ? "bg-carbon-900 text-white shadow-sm"
              : "text-carbon-600 hover:bg-carbon-100"
          }`}
        >
          Lista de Invitados &amp; WhatsApp ({guests.length})
        </button>

        <button
          onClick={() => setActiveTab("mesas")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "mesas"
              ? "bg-carbon-900 text-white shadow-sm"
              : "text-carbon-600 hover:bg-carbon-100"
          }`}
        >
          Seating Chart &amp; Mesas ({tables.length})
        </button>

        <button
          onClick={() => setActiveTab("recepcion")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "recepcion"
              ? "bg-champagne-500 text-carbon-950 font-bold shadow-gold"
              : "text-carbon-600 hover:bg-carbon-100"
          }`}
        >
          Recepción Puerta &amp; Escáner QR
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
