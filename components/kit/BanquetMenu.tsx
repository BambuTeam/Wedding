"use client";

import React from "react";
import { Utensils, Sparkles, Wine } from "lucide-react";
import { EventMeta } from "@/lib/types";

interface BanquetMenuProps {
  event: EventMeta;
}

export function BanquetMenu({ event }: BanquetMenuProps) {
  return (
    <div className="rounded-3xl bg-white border border-champagne-400/40 shadow-luxury p-6 sm:p-8 text-carbon-900">
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-[12px] font-sans font-semibold uppercase tracking-widest mb-2">
          <Utensils className="w-3.5 h-3.5 text-champagne-600" />
          <span>Experiencia Gastronómica</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
          Menú del Banquete Imperial
        </h3>
        <p className="text-[13px] sm:text-sm text-zinc-600 mt-1 font-sans">
          Diseñado por la cocina del Convento con maridaje de autor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {event.menu.map((dish, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-alabaster-50/70 border border-champagne-300/60 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#8C6D46]">
                  {dish.course}
                </span>
                {dish.dietaryFlag && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-sans font-semibold border border-emerald-200">
                    {dish.dietaryFlag}
                  </span>
                )}
              </div>

              <h4 className="font-serif text-xl sm:text-2xl font-medium text-zinc-900 mt-1">
                {dish.title}
              </h4>

              <p className="text-[13px] sm:text-sm text-zinc-600 mt-2 leading-relaxed font-sans">
                {dish.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
