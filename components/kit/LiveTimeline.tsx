"use client";

import React, { useState } from "react";
import { Clock, Church, GlassWater, UtensilsCrossed, Music4, Sparkles, Heart } from "lucide-react";
import { ItineraryItem } from "@/lib/types";

interface LiveTimelineProps {
  itinerary: ItineraryItem[];
}

export function LiveTimeline({ itinerary }: LiveTimelineProps) {
  const [activeMomentIndex, setActiveMomentIndex] = useState(1);

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
    <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-luxury p-6 sm:p-8 text-carbon-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DFC8]/60 gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[12px] font-sans font-semibold border border-[#DECDB3] mb-1">
            <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
            <span>El Ritmo de la Celebración</span>
          </div>
          <h3 className="font-serif text-3xl font-normal text-zinc-900">
            Cronograma Minuto a Minuto
          </h3>
        </div>

        <div className="text-[13px] text-zinc-600 font-sans">
          Toca cualquier momento para ver detalles de la fiesta
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
                  ? "bg-gradient-to-r from-[#FAF7F2] via-[#F3EBDD] to-[#FAF7F2] border-[#C5A059] shadow-md ring-2 ring-[#C5A059]/40"
                  : isPast
                  ? "bg-carbon-50/50 border-carbon-200 opacity-60"
                  : "bg-[#FAF7F2]/60 border-[#E8DFC8] hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isCurrent
                      ? "bg-[#C5A059] text-carbon-950 border-[#B88E3E] shadow-gold"
                      : "bg-white text-[#7A5C30] border-[#DECDB3]"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xl sm:text-2xl font-bold text-[#8C6D46]">
                      {item.time}
                    </span>
                    <h4 className="font-serif text-xl font-medium text-zinc-900">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[13px] text-zinc-600 font-sans">
                    📍 {item.location} • {item.description}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="shrink-0 self-start sm:self-center">
                {isCurrent && (
                  <span className="px-3.5 py-1 rounded-full bg-emerald-700 text-white font-sans text-[12px] shadow-sm flex items-center gap-1.5 animate-pulse font-semibold">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>SUCEDIENDO AHORA</span>
                  </span>
                )}
                {isPast && (
                  <span className="text-[12px] text-zinc-500 font-sans">
                    Concluido
                  </span>
                )}
                {!isCurrent && !isPast && (
                  <span className="text-[12px] text-[#7A5C30] font-sans font-medium">
                    Siguiente momento
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
