"use client";

import React from "react";
import { Sparkles, Info } from "lucide-react";
import { EventMeta } from "@/lib/types";

interface DressCodeProps {
  event: EventMeta;
}

export function DressCode({ event }: DressCodeProps) {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-champagne-400/30 shadow-luxury text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-xs font-semibold uppercase tracking-widest mb-3">
        <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
        <span>Código de Vestimenta</span>
      </div>

      <h3 className="font-serif italic text-3xl sm:text-4xl text-carbon-900 mb-3">
        {event.dressCodeTitle}
      </h3>

      <p className="text-sm sm:text-base text-carbon-600 max-w-xl mx-auto leading-relaxed mb-6 font-sans">
        {event.dressCodeDescription}
      </p>

      {/* Palette Color Circles */}
      <div className="pt-2">
        <span className="text-[11px] uppercase tracking-widest text-carbon-400 font-semibold block mb-3">
          Paleta de Inspiración
        </span>
        <div className="flex items-center justify-center gap-3">
          {event.paletteColors.map((color, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5 group">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md transform group-hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: color }}
                title={`Color ${color}`}
              />
              <span className="text-[10px] font-mono text-carbon-400 uppercase">
                {color}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
