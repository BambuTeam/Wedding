"use client";

import React, { useState } from "react";
import { Clock, Church, GlassWater, UtensilsCrossed, Music4, Sparkles, CheckCircle2 } from "lucide-react";
import { ItineraryItem } from "@/lib/types";

interface LiveTimelineProps {
  itinerary: ItineraryItem[];
}

export function LiveTimeline({ itinerary }: LiveTimelineProps) {
  // Demo active index (simulating current moment)
  const [activeMomentIndex, setActiveMomentIndex] = useState(1); // 18:00 Cóctel de Bienvenida

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "church":
        return Church;
      case "cocktail":
        return GlassWater;
      case "utensils":
        return UtensilsCrossed;
      case "music":
        return Music4;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-champagne-400/40 shadow-luxury p-6 sm:p-8 text-carbon-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-champagne-200 gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-xs font-semibold uppercase tracking-widest mb-1">
            <Clock className="w-3.5 h-3.5 text-champagne-600 animate-spin" />
            <span>Minuto a Minuto en Vivo</span>
          </div>
          <h3 className="font-serif italic text-3xl font-semibold">
            Cronograma de la Boda
          </h3>
        </div>

        <div className="text-xs text-carbon-500 font-sans">
          Toca cualquier momento para simular el momento actual de la fiesta
        </div>
      </div>

      <div className="space-y-4">
        {itinerary.map((item, index) => {
          const Icon = getIcon(item.iconName);
          const isCurrent = index === activeMomentIndex;
          const isPast = index < activeMomentIndex;

          return (
            <div
              key={index}
              onClick={() => setActiveMomentIndex(index)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isCurrent
                  ? "bg-gradient-to-r from-champagne-100 via-amber-50 to-champagne-100 border-champagne-500 shadow-md ring-2 ring-champagne-400/50"
                  : isPast
                  ? "bg-carbon-50/50 border-carbon-200 opacity-60"
                  : "bg-alabaster-50/80 border-champagne-300/60 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isCurrent
                      ? "bg-champagne-500 text-carbon-950 border-champagne-600 shadow-gold"
                      : "bg-white text-champagne-700 border-champagne-300"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic text-2xl font-bold text-champagne-800">
                      {item.time}
                    </span>
                    <h4 className="font-serif text-xl font-bold text-carbon-900">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-carbon-600">
                    📍 {item.location} • {item.description}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="shrink-0 self-start sm:self-center">
                {isCurrent && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>AHORA SUCEDIENDO</span>
                  </span>
                )}
                {isPast && (
                  <span className="text-[11px] text-carbon-400 font-medium">
                    Finalizado
                  </span>
                )}
                {!isCurrent && !isPast && (
                  <span className="text-[11px] text-champagne-700 font-medium">
                    Próximo momento
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
