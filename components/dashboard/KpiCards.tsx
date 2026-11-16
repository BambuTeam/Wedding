"use client";

import React, { useState } from "react";
import {
  Heart,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  Utensils,
  DoorOpen,
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
      title: "Invitados Queridos",
      value: stats.totalSeatsAllocated,
      subtitle: `${stats.totalFamilies} familias invitadas`,
      icon: Heart,
      color: "text-carbon-900",
      bg: "bg-white",
      border: "border-[#E8DFC8]",
    },
    {
      title: "Confirmados",
      value: stats.totalSeatsConfirmed,
      subtitle: `${Math.round((stats.totalSeatsConfirmed / (stats.totalSeatsAllocated || 1)) * 100)}% nos acompañarán`,
      icon: CheckCircle2,
      color: "text-emerald-800",
      bg: "bg-emerald-50/50",
      border: "border-emerald-200",
    },
    {
      title: "Por Confirmar",
      value: stats.totalGuestsPending,
      subtitle: "Respuestas pendientes",
      icon: Clock,
      color: "text-amber-800",
      bg: "bg-amber-50/50",
      border: "border-amber-200",
    },
    {
      title: "Sobres Abiertos",
      value: `${stats.openRatePercentage}%`,
      subtitle: `${stats.openedInvitationsCount} de ${stats.totalFamilies} ya abrieron su carta`,
      icon: Eye,
      color: "text-[#8C6D46]",
      bg: "bg-[#F7F2E7]/70",
      border: "border-[#DFC9A6]",
    },
    {
      title: "Ya en la Fiesta",
      value: stats.totalCheckedInSeats,
      subtitle: "Abrazos dados al llegar",
      icon: DoorOpen,
      color: "text-purple-800",
      bg: "bg-purple-50/50",
      border: "border-purple-200",
    },
    {
      title: "Cuidados de Cocina",
      value: stats.dietaryRestrictionsCount,
      subtitle: "Menús especiales / alergias",
      icon: Utensils,
      color: "text-[#7A5C30]",
      bg: "bg-[#F3EBDD]/70",
      border: "border-[#DFC9A6]",
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
                <span className="text-[10px] font-serif italic text-carbon-500 uppercase tracking-wider">
                  {c.title}
                </span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>

              <div>
                <span className={`text-2xl sm:text-3xl font-bold font-serif ${c.color}`}>
                  {c.value}
                </span>
                <p className="text-[11px] text-carbon-500 mt-0.5 leading-tight font-sans">
                  {c.subtitle}
                </p>
              </div>

              {c.clickable && (
                <div className="mt-2 pt-2 border-t border-[#DFC9A6]/50 flex items-center justify-between text-[10px] font-serif italic text-[#7A5C30]">
                  <span>Ver notas del chef</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dietary Restrictions Modal */}
      {showDietaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#DFC9A6]">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#8C6D46]" />
                <h3 className="font-serif italic text-2xl text-carbon-900 font-bold">
                  Notas para el Chef &amp; Banquete
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
                <p className="text-xs text-carbon-500 py-6 text-center font-serif italic">
                  Ningún invitado ha registrado restricciones alimenticias por ahora.
                </p>
              ) : (
                stats.dietaryNotesList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DFC9A6]"
                  >
                    <span className="text-xs font-bold text-carbon-900 font-serif italic block">
                      {item.guestName}
                    </span>
                    <p className="text-xs text-[#7A5C30] mt-1 font-sans">
                      ⚠️ {item.notes}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-carbon-100 flex justify-end">
              <button
                onClick={() => setShowDietaryModal(false)}
                className="px-5 py-2 rounded-full bg-carbon-900 text-white text-xs font-sans font-medium"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
