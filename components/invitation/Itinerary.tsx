"use client";

import React from "react";
import {
  Church,
  GlassWater,
  UtensilsCrossed,
  Music4,
  Sparkles,
  MapPin,
  Calendar,
  Navigation,
  Compass,
} from "lucide-react";
import { EventMeta, ItineraryItem } from "@/lib/types";
import { downloadCalendarIcs } from "@/lib/utils";

interface ItineraryProps {
  event: EventMeta;
}

export function Itinerary({ event }: ItineraryProps) {
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

  const handleDownloadIcs = () => {
    downloadCalendarIcs({
      title: `Boda de ${event.title}`,
      description: `Celebración Nupcial de ${event.brideName} & ${event.groomName}. Venue: ${event.venueName}.`,
      location: `${event.venueName}, ${event.venueAddress}`,
      startDateIso: event.eventDate,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10">
      {/* Venue & Location Card with Fast Navigation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-champagne-400/30 shadow-luxury">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-champagne-300/30">
          <div>
            <div className="flex items-center gap-2 text-champagne-700 text-xs font-semibold uppercase tracking-widest mb-1">
              <MapPin className="w-4 h-4" />
              <span>Lugar de la Celebración</span>
            </div>
            <h3 className="font-serif italic text-2xl sm:text-3xl text-carbon-900">
              {event.venueName}
            </h3>
            <p className="text-sm text-carbon-600 mt-1 max-w-md">
              {event.venueAddress}
            </p>
          </div>

          {/* Direct map action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={event.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Abrir en Waze</span>
            </a>

            <a
              href={event.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>

            <button
              onClick={handleDownloadIcs}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-900 text-champagne-200 text-xs font-semibold shadow-sm transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-champagne-400" />
              <span>Guardar en Calendario (.ics)</span>
            </button>
          </div>
        </div>

        {/* Timeline List */}
        <div className="pt-8">
          <h4 className="text-xs uppercase tracking-[0.25em] text-carbon-500 mb-6 font-semibold">
            Cronograma del Día
          </h4>
          <div className="relative pl-6 sm:pl-8 border-l-2 border-champagne-300/60 space-y-8">
            {event.itinerary.map((item, index) => {
              const Icon = getIcon(item.iconName);
              return (
                <div key={index} className="relative group">
                  {/* Timeline bullet icon */}
                  <div className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-8 h-8 rounded-full bg-champagne-100 border-2 border-champagne-500 text-champagne-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                    <span className="font-serif italic text-2xl font-bold text-champagne-700 tracking-wider">
                      {item.time}
                    </span>
                    <span className="font-serif text-xl sm:text-2xl text-carbon-900 font-semibold">
                      {item.title}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-carbon-500 mt-0.5">
                    📍 {item.location}
                  </p>
                  <p className="text-xs sm:text-sm text-carbon-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
