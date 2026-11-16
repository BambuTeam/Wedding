"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, Check, Sparkles, Building2 } from "lucide-react";
import { EventMeta } from "@/lib/types";

interface EventSelectorProps {
  currentEvent: EventMeta;
  allEvents: EventMeta[];
  onSelectEvent: (eventId: string) => void;
}

export function EventSelector({ currentEvent, allEvents, onSelectEvent }: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-champagne-300 shadow-sm hover:border-champagne-500 transition-all text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-champagne-100 border border-champagne-300 flex items-center justify-center text-champagne-800 shrink-0">
          <Building2 className="w-5 h-5" />
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-carbon-400 block">
            Modo Wedding Planner
          </span>
          <span className="font-serif italic text-lg text-carbon-900 font-semibold block leading-tight">
            {currentEvent.title}
          </span>
          <span className="text-[11px] text-carbon-500">
            {currentEvent.venueCity}
          </span>
        </div>

        <ChevronDown className="w-4 h-4 text-carbon-400 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-champagne-300/80 shadow-2xl p-2 z-50">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-carbon-400 border-b border-carbon-100">
            Eventos en Gestión Activa
          </div>

          <div className="mt-1 space-y-1">
            {allEvents.map((evt) => {
              const isSelected = evt.eventId === currentEvent.eventId;
              return (
                <button
                  key={evt.eventId}
                  onClick={() => {
                    onSelectEvent(evt.eventId);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-champagne-50 border border-champagne-300 text-carbon-950 font-medium"
                      : "hover:bg-alabaster-100 text-carbon-700"
                  }`}
                >
                  <div>
                    <p className="font-serif italic text-base font-semibold text-carbon-900">
                      {evt.title}
                    </p>
                    <p className="text-[11px] text-carbon-500">
                      {evt.venueName} • {evt.eventDateFormatted.split(",")[1] || evt.eventDateFormatted}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-champagne-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
