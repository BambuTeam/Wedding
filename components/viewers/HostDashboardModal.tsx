"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, RefreshCw, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { EventMeta, Guest, Table, EventDashboardStats } from "@/lib/types";
import { EventSelector } from "@/components/dashboard/EventSelector";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { GuestsTable } from "@/components/dashboard/GuestsTable";
import { SeatingChart } from "@/components/dashboard/SeatingChart";
import { CheckInScanner } from "@/components/dashboard/CheckInScanner";
import { MOCK_EVENTS, MOCK_GUESTS, MOCK_TABLES } from "@/lib/db/mock-data";

interface HostDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string;
}

export function HostDashboardModal({
  isOpen,
  onClose,
  defaultEventId = "camila-andres-2025",
}: HostDashboardModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(defaultEventId);
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [stats, setStats] = useState<EventDashboardStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"invitados" | "mesas" | "recepcion">("invitados");

  const allEventsList = Object.values(MOCK_EVENTS);

  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    let foundEvent: EventMeta | null = null;
    let foundStats: EventDashboardStats | null = null;
    let foundGuests: Guest[] = [];
    let foundTables: Table[] = [];

    try {
      const [eventRes, guestsRes, tablesRes] = await Promise.all([
        fetch(`/api/events/${selectedEventId}`),
        fetch(`/api/events/${selectedEventId}/guests`),
        fetch(`/api/events/${selectedEventId}/tables`),
      ]);

      if (eventRes.ok) {
        const contentType = eventRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const eventData = await eventRes.json();
          if (eventData?.event) foundEvent = eventData.event;
          if (eventData?.stats) foundStats = eventData.stats;
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
      console.warn("API fetch fallback triggered for dashboard:", err);
    }

    if (!foundEvent) {
      foundEvent = MOCK_EVENTS[selectedEventId] || MOCK_EVENTS["camila-andres-2025"];
    }

    if (foundGuests.length === 0) {
      foundGuests = MOCK_GUESTS[selectedEventId] || MOCK_GUESTS["camila-andres-2025"] || [];
    }

    if (foundTables.length === 0) {
      foundTables = MOCK_TABLES[selectedEventId] || MOCK_TABLES["camila-andres-2025"] || [];
    }

    if (!foundStats) {
      const confirmed = foundGuests.reduce((acc, g) => acc + g.confirmedSeats, 0);
      const totalSeats = foundGuests.reduce((acc, g) => acc + g.maxSeats, 0);
      const openedCount = foundGuests.filter((g) => g.status === "OPENED" || g.status === "CONFIRMED").length;
      foundStats = {
        totalFamilies: foundGuests.length || 24,
        totalSeatsAllocated: totalSeats || 180,
        totalSeatsConfirmed: confirmed || 142,
        totalSeatsDeclined: foundGuests.filter((g) => g.status === "DECLINED").length,
        totalGuestsPending: foundGuests.filter((g) => g.status === "UNOPENED" || g.status === "OPENED").length,
        openedInvitationsCount: openedCount,
        unopenedInvitationsCount: foundGuests.filter((g) => g.status === "UNOPENED").length,
        openRatePercentage: foundGuests.length > 0 ? Math.round((openedCount / foundGuests.length) * 100) : 85,
        totalCheckedInSeats: foundGuests.filter((g) => !!g.checkedInAt).length,
        dietaryRestrictionsCount: foundGuests.filter((g) => !!g.dietaryNotes).length,
        dietaryNotesList: foundGuests
          .filter((g) => !!g.dietaryNotes)
          .map((g) => ({ guestName: g.familyName, notes: g.dietaryNotes || "" })),
      };
    }

    setEvent(foundEvent);
    setStats(foundStats);
    setGuests(foundGuests);
    setTables(foundTables);
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadData();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, selectedEventId]);

  if (!isOpen) return null;

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
              Espacio de Anfitriones y Planners
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading || !event ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#B89758]" />
            <p className="font-sans text-lg text-zinc-700 font-medium">
              Cargando cuaderno de celebración...
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Event Selector & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
              <div>
                <EventSelector
                  currentEvent={event}
                  allEvents={allEventsList}
                  onSelectEvent={(id) => {
                    setSelectedEventId(id);
                    setLoading(true);
                  }}
                />
                <p className="text-[13px] text-zinc-600 font-sans mt-1.5">
                  {event.venueName} · {event.eventDateFormatted}
                </p>
              </div>

              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 bg-white text-zinc-700 hover:bg-stone-50 text-[13px] font-sans font-medium self-start sm:self-auto shadow-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-stone-500 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Actualizar datos</span>
              </button>
            </div>

            {/* KPI Cards */}
            {stats && <KpiCards stats={stats} />}

            {/* Tabs */}
            <div className="flex border-b border-stone-200">
              <button
                onClick={() => setActiveTab("invitados")}
                className={`px-6 py-3 font-sans text-[13px] sm:text-sm border-b-2 transition-colors ${
                  activeTab === "invitados"
                    ? "border-stone-900 text-stone-900 font-bold"
                    : "border-transparent text-stone-500 hover:text-stone-800 font-medium"
                }`}
              >
                ¿Quiénes nos acompañan? ({guests.length})
              </button>
              <button
                onClick={() => setActiveTab("mesas")}
                className={`px-6 py-3 font-sans text-[13px] sm:text-sm border-b-2 transition-colors ${
                  activeTab === "mesas"
                    ? "border-stone-900 text-stone-900 font-bold"
                    : "border-transparent text-stone-500 hover:text-stone-800 font-medium"
                }`}
              >
                Acomodo de mesas ({tables.length})
              </button>
              <button
                onClick={() => setActiveTab("recepcion")}
                className={`px-6 py-3 font-sans text-[13px] sm:text-sm border-b-2 transition-colors ${
                  activeTab === "recepcion"
                    ? "border-stone-900 text-stone-900 font-bold"
                    : "border-transparent text-stone-500 hover:text-stone-800 font-medium"
                }`}
              >
                Bienvenida en recepción
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "invitados" && (
              <GuestsTable
                guests={guests}
                event={event}
                tables={tables}
                onRefresh={() => loadData()}
              />
            )}

            {activeTab === "mesas" && (
              <SeatingChart
                tables={tables}
                guests={guests}
                eventId={selectedEventId}
                onRefresh={() => loadData()}
              />
            )}

            {activeTab === "recepcion" && (
              <CheckInScanner
                guests={guests}
                event={event}
                onCheckInSuccess={() => loadData()}
              />
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
