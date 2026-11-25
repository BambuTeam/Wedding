"use client";

import React from "react";
import {
  Users,
  Calendar,
  CheckCircle2,
  Camera,
  Banknote,
  Clock,
  Sparkles,
} from "lucide-react";
import { PlatformKpis } from "@/lib/types";

interface RootKpiSectionProps {
  kpis: PlatformKpis | null;
  onOpenPending: () => void;
}

export function RootKpiSection({ kpis, onOpenPending }: RootKpiSectionProps) {
  if (!kpis) return null;

  const cards = [
    {
      title: "Clientes en Plataforma",
      value: `${kpis.activeTenants} Activos`,
      subtitle: `${kpis.pendingReleaseTenants} pendientes por liberar`,
      icon: Users,
      badgeText: kpis.pendingReleaseTenants > 0 ? `${kpis.pendingReleaseTenants} por liberar` : "Al día",
      badgeColor:
        kpis.pendingReleaseTenants > 0
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : "bg-emerald-100 text-emerald-800 border-emerald-200",
      isClickable: kpis.pendingReleaseTenants > 0,
      onClick: onOpenPending,
    },
    {
      title: "Eventos en Vivo",
      value: `${kpis.activeEvents} en curso`,
      subtitle: `${kpis.upcomingThisWeek} celebraciones en los próximos 14 días`,
      icon: Calendar,
      badgeText: `${kpis.totalEvents} total`,
      badgeColor: "bg-zinc-100 text-zinc-700 border-zinc-200",
    },
    {
      title: "Invitados Gestionados",
      value: kpis.totalGuestsConfirmed.toLocaleString(),
      subtitle: `${kpis.totalGuestsAllocated.toLocaleString()} cupos asignados en DynamoDB`,
      icon: CheckCircle2,
      badgeText: `${Math.round((kpis.totalGuestsConfirmed / (kpis.totalGuestsAllocated || 1)) * 100)}% confirmados`,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      title: "Fotos en S3 Media",
      value: kpis.totalPhotosS3.toLocaleString(),
      subtitle: "Álbum colaborativo del Kit del Día",
      icon: Camera,
      badgeText: "AWS S3 Activo",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      title: "Ingresos Registrados",
      value: `Q ${kpis.totalRevenueGtq.toLocaleString("es-GT")}`,
      subtitle: kpis.totalRevenueUsd > 0 ? `+ $${kpis.totalRevenueUsd.toLocaleString()} USD` : "Cobros directos en GTQ",
      icon: Banknote,
      badgeText: "Cobros al día",
      badgeColor: "bg-[#F3EBDD] text-[#7A5C30] border-[#DECDB3]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            onClick={c.onClick}
            className={`p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between transition-all ${
              c.isClickable ? "cursor-pointer hover:border-amber-400 hover:shadow-md" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {c.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {c.value}
                </span>
                <p className="text-[12px] text-zinc-500 leading-tight">
                  {c.subtitle}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.badgeColor}`}
              >
                {c.badgeText}
              </span>
              {c.isClickable && (
                <span className="text-[11px] text-amber-700 font-semibold underline underline-offset-2">
                  Ver bandeja &rarr;
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
