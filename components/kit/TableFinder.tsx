"use client";

import React, { useState } from "react";
import { Search, MapPin, Heart } from "lucide-react";
import { Guest, Table } from "@/lib/types";

interface TableFinderProps {
  guests: Guest[];
  tables: Table[];
}

export function TableFinder({ guests, tables }: TableFinderProps) {
  const [query, setQuery] = useState("");

  const searchResults = query.trim()
    ? guests.filter((g) =>
        g.familyName.toLowerCase().includes(query.toLowerCase()) ||
        g.primaryContactName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const getTable = (tableId?: string) => {
    if (!tableId) return null;
    return tables.find((t) => t.tableId === tableId) || null;
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-luxury p-6 sm:p-8 text-carbon-900">
      <div className="text-center max-w-lg mx-auto mb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[12px] font-sans font-semibold border border-[#DECDB3]">
          <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
          <span>Tu Lugar en el Banquete</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
          ¿Dónde nos sentamos hoy?
        </h3>
        <p className="text-[13px] sm:text-sm text-zinc-600 font-sans">
          Escribe tu apellido o nombre para conocer tu mesa asignada con cariño.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto relative mb-6">
        <Search className="w-5 h-5 text-[#8C6D46] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Escribe tu apellido (ej. Hernández, Rivas, Mendoza)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#DFC9A6] bg-[#FAF7F2] text-[13px] sm:text-sm font-medium text-zinc-900 focus:outline-none focus:border-[#C5A059] shadow-inner font-sans"
        />
      </div>

      {/* Results */}
      {query.trim().length > 0 && (
        <div className="max-w-md mx-auto space-y-3">
          {searchResults.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFC9A6] text-center text-[13px] text-zinc-600 font-sans">
              No encontramos una asignación con ese apellido. Por favor acércate a la mesa de bienvenida en la entrada del claustro.
            </div>
          ) : (
            searchResults.map((guest) => {
              const table = getTable(guest.tableId);
              return (
                <div
                  key={guest.guestToken}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF7F2] to-[#F3EBDD] border border-[#DFC9A6] shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="font-sans font-semibold text-base sm:text-lg text-zinc-900 block">
                      {guest.familyName}
                    </span>
                    <span className="text-[12px] text-zinc-600 font-sans">
                      {guest.confirmedSeats || guest.maxSeats} lugares reservados
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-[#7A5C30] block">
                      Tu Mesa
                    </span>
                    <span className="px-3.5 py-1 rounded-xl bg-[#C5A059] text-carbon-950 font-bold text-xs sm:text-sm shadow-gold inline-block mt-0.5 font-sans">
                      {table ? table.name : "Asignada en la entrada"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
