"use client";

import React, { useState } from "react";
import { ChevronDown, Check, Heart } from "lucide-react";
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
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#DFC9A6] shadow-sm hover:border-[#C5A059] transition-all text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-[#F3EBDD] border border-[#DECDB3] flex items-center justify-center text-[#7A5C30] shrink-0">
          <Heart className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-carbon-400 block font-sans">
            Celebración Activa
          </span>
          <span className="font-serif italic text-lg text-carbon-900 font-bold block leading-tight">
            {currentEvent.title}
          </span>
          <span className="text-[11px] text-carbon-500 font-serif italic">
            {currentEvent.venueCity}
          </span>
        </div>

        <ChevronDown className="w-4 h-4 text-carbon-400 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-[#DFC9A6] shadow-2xl p-2 z-50">
          <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-carbon-400 border-b border-carbon-100 font-sans">
            Cambiar de Celebración
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
                      ? "bg-[#FAF7F2] border border-[#DFC9A6] text-carbon-950 font-medium"
                      : "hover:bg-[#FAF7F2]/60 text-carbon-700"
                  }`}
                >
                  <div>
                    <p className="font-serif italic text-base font-bold text-carbon-900">
                      {evt.title}
                    </p>
                    <p className="text-[11px] text-carbon-500 font-sans">
                      {evt.venueName} • {evt.eventDateFormatted.split(",")[1] || evt.eventDateFormatted}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#8C6D46]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
