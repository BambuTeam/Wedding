"use client";

import React, { useState } from "react";
import {
  Search,
  ExternalLink,
  ShieldAlert,
  Archive,
  RotateCcw,
  SlidersHorizontal,
  Users,
  Camera,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";
import { EventDirectoryItem, EventStatus, PlanType } from "@/lib/types";
import { EditEventLimitsModal } from "./EditEventLimitsModal";

interface EventsDirectoryProps {
  events: EventDirectoryItem[];
  onToggleStatus: (eventId: string, newStatus: EventStatus) => Promise<void>;
  onSaveLimits: (eventId: string, updates: { maxGuestsLimit: number; plan: PlanType }) => Promise<void>;
}

export function EventsDirectory({
  events,
  onToggleStatus,
  onSaveLimits,
}: EventsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingEvent, setEditingEvent] = useState<EventDirectoryItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filtrado reactivo
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venueCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tenantName && e.tenantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && e.status === "ACTIVE") ||
      (statusFilter === "SUSPENDED" && e.status === "SUSPENDED") ||
      (statusFilter === "ARCHIVED" && (e.status === "ARCHIVED" || e.isArchived));

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
    setActionLoadingId(eventId);
    try {
      await onToggleStatus(eventId, newStatus);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls: Search and Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            Directorio Global de Celebraciones
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Supervisión operativa, control de acceso y suplantación segura de anfitrión.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar evento, ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
            {[
              { id: "ALL", label: "Todos" },
              { id: "ACTIVE", label: "Activos" },
              { id: "SUSPENDED", label: "Suspendidos" },
              { id: "ARCHIVED", label: "Archivados" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table / Card Grid */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3.5 px-6">Celebración &amp; Tipo</th>
                <th className="py-3.5 px-4">Fecha &amp; Lugar</th>
                <th className="py-3.5 px-4">Invitados / Cupo</th>
                <th className="py-3.5 px-4">Mesas</th>
                <th className="py-3.5 px-4">S3 Media</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones de Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No se encontraron celebraciones con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const percentConfirmed = Math.min(
                    100,
                    Math.round((evt.totalGuestsConfirmed / (evt.maxGuestsLimit || 1)) * 100)
                  );
                  const isSuspended = evt.status === "SUSPENDED";
                  const isArchived = evt.status === "ARCHIVED" || evt.isArchived;
                  const isLoading = actionLoadingId === evt.eventId;

                  return (
                    <tr
                      key={evt.eventId}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        isSuspended ? "bg-rose-50/20" : isArchived ? "bg-zinc-50/50 opacity-80" : ""
                      }`}
                    >
                      {/* Celebración */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-900 text-sm block">
                            {evt.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <span className="px-2 py-0.5 rounded-full bg-[#F3EBDD] text-[#7A5C30] font-semibold text-[10px]">
                              {evt.category}
                            </span>
                            <span>•</span>
                            <span>Plan {evt.plan}</span>
                          </div>
                        </div>
                      </td>

                      {/* Fecha y Lugar */}
                      <td className="py-4 px-4 text-zinc-600">
                        <div className="space-y-0.5">
                          <span className="font-medium text-zinc-800 block">
                            {new Date(evt.eventDate).toLocaleDateString("es-GT", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[11px] text-zinc-400 block truncate max-w-[150px]" title={evt.venueName}>
                            {evt.venueName}, {evt.venueCity.split(",")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Invitados y Cupo */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-zinc-900">
                              {evt.totalGuestsConfirmed} conf.
                            </span>
                            <span className="text-zinc-500">
                              / {evt.maxGuestsLimit} máx
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                percentConfirmed > 90 ? "bg-amber-500" : "bg-emerald-600"
                              }`}
                              style={{ width: `${percentConfirmed}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Mesas */}
                      <td className="py-4 px-4 font-medium text-zinc-700">
                        <div className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{evt.totalTables} mesas</span>
                        </div>
                      </td>

                      {/* S3 Media */}
                      <td className="py-4 px-4 font-medium text-zinc-700">
                        <div className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{evt.totalPhotosS3} fotos</span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4">
                        {isArchived ? (
                          <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Archive className="w-3 h-3" />
                            <span>Archivado</span>
                          </span>
                        ) : isSuspended ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Suspendido</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Activo</span>
                          </span>
                        )}
                      </td>

                      {/* Acciones Rápidas */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Suplantación Segura / Entrar al panel del evento */}
                          <a
                            href={`/dashboard?eventId=${evt.eventId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-xl bg-zinc-900 hover:bg-black text-white text-[11px] font-semibold transition-all shadow-sm"
                            title="Entrar al panel de este evento como anfitrión"
                          >
                            <span>Entrar al panel</span>
                            <ExternalLink className="w-3 h-3 text-[#DFC07D]" />
                          </a>

                          {/* 2. Editar Límites / Cupo */}
                          <button
                            onClick={() => setEditingEvent(evt)}
                            className="p-1.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors"
                            title="Editar cupo de invitados o cambiar plan"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          {/* 3. Suspender / Activar */}
                          {isSuspended ? (
                            <button
                              onClick={() => handleStatusChange(evt.eventId, "ACTIVE")}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 min-h-[44px] rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 transition-colors"
                              title="Reactivar evento"
                            >
                              Activar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(evt.eventId, "SUSPENDED")}
                              disabled={isLoading || isArchived}
                              className="px-2.5 py-1.5 min-h-[44px] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-colors disabled:opacity-40"
                              title="Suspender temporalmente acceso"
                            >
                              Suspender
                            </button>
                          )}

                          {/* 4. Archivar */}
                          {!isArchived && (
                            <button
                              onClick={() => handleStatusChange(evt.eventId, "ARCHIVED")}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[44px] rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 text-[11px] font-semibold transition-colors"
                              title="Archivar evento (bloquea nuevas fotos en S3 y protege cuotas)"
                            >
                              <Archive className="w-3 h-3 text-zinc-500" />
                              <span>Archivar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición de cupo */}
      {editingEvent && (
        <EditEventLimitsModal
          isOpen={Boolean(editingEvent)}
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={onSaveLimits}
        />
      )}
    </div>
  );
}
