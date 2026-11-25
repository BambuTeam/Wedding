"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={c.onClick}
              className={`p-3.5 sm:p-4 rounded-2xl ${c.bg} border ${c.border} shadow-sm transition-all flex flex-col justify-between ${
                c.clickable ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-zinc-500 uppercase tracking-wider line-clamp-1">
                  {c.title}
                </span>
                <Icon className={`w-4 h-4 shrink-0 ${c.color}`} />
              </div>

              <div>
                <span className={`text-xl sm:text-2xl lg:text-3xl font-bold font-sans ${c.color}`}>
                  {c.value}
                </span>
                <p className="text-[11px] sm:text-[12px] text-zinc-600 mt-1 leading-snug font-sans">
                  {c.subtitle}
                </p>
              </div>

              {c.clickable && (
                <div className="mt-2 pt-2 border-t border-[#DFC9A6]/50 flex items-center justify-between text-[11px] font-sans font-semibold text-[#7A5C30]">
                  <span>Ver notas del chef</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dietary Restrictions Modal */}
      {showDietaryModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#DFC9A6]">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#8C6D46]" />
                <h3 className="font-serif text-xl sm:text-2xl text-zinc-900 font-semibold">
                  Notas para el Chef &amp; Banquete
                </h3>
              </div>
              <button
                onClick={() => setShowDietaryModal(false)}
                className="text-[13px] text-zinc-600 hover:text-zinc-900 font-sans font-semibold px-2 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3">
              {stats.dietaryNotesList.length === 0 ? (
                <p className="text-[13px] text-zinc-500 py-6 text-center font-sans">
                  Ningún invitado ha registrado restricciones alimenticias por ahora.
                </p>
              ) : (
                stats.dietaryNotesList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DFC9A6]"
                  >
                    <span className="text-[13px] font-bold text-zinc-900 font-sans block">
                      {item.guestName}
                    </span>
                    <p className="text-[13px] text-[#7A5C30] mt-1 font-sans">
                      ⚠️ {item.notes}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-carbon-100 flex justify-end">
              <button
                onClick={() => setShowDietaryModal(false)}
                className="px-5 py-2 rounded-full bg-zinc-900 text-white text-[13px] font-sans font-medium hover:bg-black transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
