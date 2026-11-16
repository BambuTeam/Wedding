"use client";

import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Eye,
  Utensils,
  DoorOpen,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { EventDashboardStats } from "@/lib/types";

interface KpiCardsProps {
  stats: EventDashboardStats;
}

export function KpiCards({ stats }: KpiCardsProps) {
  const [showDietaryModal, setShowDietaryModal] = useState(false);

  const cards = [
    {
      title: "Pases Asignados",
      value: stats.totalSeatsAllocated,
      subtitle: `${stats.totalFamilies} familias / invitaciones`,
      icon: Users,
      color: "text-carbon-900",
      bg: "bg-white",
      border: "border-carbon-200",
    },
    {
      title: "Confirmados",
      value: stats.totalSeatsConfirmed,
      subtitle: `${Math.round((stats.totalSeatsConfirmed / (stats.totalSeatsAllocated || 1)) * 100)}% de asistencia`,
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50/60",
      border: "border-emerald-200",
    },
    {
      title: "Pendientes",
      value: stats.totalGuestsPending,
      subtitle: "Por responder RSVP",
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50/60",
      border: "border-amber-200",
    },
    {
      title: "Tasa de Apertura",
      value: `${stats.openRatePercentage}%`,
      subtitle: `${stats.openedInvitationsCount} de ${stats.totalFamilies} ya abrieron el sobre`,
      icon: Eye,
      color: "text-blue-700",
      bg: "bg-blue-50/60",
      border: "border-blue-200",
    },
    {
      title: "Check-in en Puerta",
      value: stats.totalCheckedInSeats,
      subtitle: "Invitados ya dentro del venue",
      icon: DoorOpen,
      color: "text-purple-700",
      bg: "bg-purple-50/60",
      border: "border-purple-200",
    },
    {
      title: "Alergias & Cocina",
      value: stats.dietaryRestrictionsCount,
      subtitle: "Menús especiales requeridos",
      icon: Utensils,
      color: "text-champagne-800",
      bg: "bg-champagne-50/70",
      border: "border-champagne-300",
      clickable: true,
      onClick: () => setShowDietaryModal(true),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={c.onClick}
              className={`p-4 rounded-2xl ${c.bg} border ${c.border} shadow-sm transition-all flex flex-col justify-between ${
                c.clickable ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-carbon-500">
                  {c.title}
                </span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>

              <div>
                <span className={`text-2xl sm:text-3xl font-bold font-serif ${c.color}`}>
                  {c.value}
                </span>
                <p className="text-[11px] text-carbon-500 mt-0.5 leading-tight">
                  {c.subtitle}
                </p>
              </div>

              {c.clickable && (
                <div className="mt-2 pt-2 border-t border-champagne-200 flex items-center justify-between text-[10px] font-semibold text-champagne-700">
                  <span>Ver detalle</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dietary Restrictions Modal */}
      {showDietaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-950/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-champagne-300">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-champagne-600" />
                <h3 className="font-serif italic text-2xl text-carbon-900 font-semibold">
                  Resumen para Chef Ejecutivo &amp; Catering
                </h3>
              </div>
              <button
                onClick={() => setShowDietaryModal(false)}
                className="text-xs text-carbon-500 hover:text-carbon-900 font-bold px-2 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3">
              {stats.dietaryNotesList.length === 0 ? (
                <p className="text-xs text-carbon-500 py-4 text-center">
                  No hay requerimientos alimenticios registrados hasta el momento.
                </p>
              ) : (
                stats.dietaryNotesList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-alabaster-50 border border-champagne-200"
                  >
                    <span className="text-xs font-bold text-carbon-900 block">
                      {item.guestName}
                    </span>
                    <p className="text-xs text-champagne-800 mt-1 font-medium">
                      ⚠️ {item.notes}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-carbon-100 flex justify-end">
              <button
                onClick={() => setShowDietaryModal(false)}
                className="px-4 py-2 rounded-xl bg-carbon-900 text-white text-xs font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
