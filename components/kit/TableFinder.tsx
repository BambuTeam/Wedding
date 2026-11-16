"use client";

import React, { useState } from "react";
import { Search, MapPin, Users, Sparkles, CheckCircle2 } from "lucide-react";
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
    <div className="rounded-3xl bg-white border border-champagne-400/40 shadow-luxury p-6 sm:p-8 text-carbon-900">
      <div className="text-center max-w-lg mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-xs font-semibold uppercase tracking-widest mb-2">
          <MapPin className="w-3.5 h-3.5 text-champagne-600" />
          <span>Buscador Exprés de Mesa</span>
        </div>
        <h3 className="font-serif italic text-3xl sm:text-4xl font-semibold">
          ¿Dónde me siento hoy?
        </h3>
        <p className="text-xs sm:text-sm text-carbon-500 mt-1">
          Escribe tu apellido o nombre para ver el número y nombre exacto de tu mesa asignada.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto relative mb-6">
        <Search className="w-5 h-5 text-champagne-600 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Escribe tu apellido (ej. Hernández, Rivas, Mendoza)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-champagne-300 bg-alabaster-50/50 text-sm font-medium text-carbon-900 focus:outline-none focus:border-champagne-500 shadow-inner"
        />
      </div>

      {/* Results */}
      {query.trim().length > 0 && (
        <div className="max-w-md mx-auto space-y-3">
          {searchResults.length === 0 ? (
            <div className="p-4 rounded-2xl bg-carbon-50 border border-carbon-200 text-center text-xs text-carbon-500">
              No encontramos una asignación con ese nombre. Por favor acércate a la mesa de recepción en la entrada.
            </div>
          ) : (
            searchResults.map((guest) => {
              const table = getTable(guest.tableId);
              return (
                <div
                  key={guest.guestToken}
                  className="p-4 rounded-2xl bg-gradient-to-r from-alabaster-50 to-champagne-50 border border-champagne-400 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="font-serif italic text-xl font-bold text-carbon-900 block">
                      {guest.familyName}
                    </span>
                    <span className="text-xs text-carbon-500">
                      {guest.confirmedSeats || guest.maxSeats} lugares confirmados
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-champagne-700 block">
                      Tu Mesa
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-champagne-500 text-carbon-950 font-bold text-xs sm:text-sm shadow-gold inline-block mt-0.5">
                      {table ? table.name : "Por asignar en puerta"}
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
