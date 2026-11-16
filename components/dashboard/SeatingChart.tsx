"use client";

import React, { useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { Table, Guest } from "@/lib/types";

interface SeatingChartProps {
  tables: Table[];
  guests: Guest[];
  eventId: string;
  onRefresh: () => void;
}

export function SeatingChart({ tables, guests, eventId, onRefresh }: SeatingChartProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Group guests by table
  const unassignedGuests = guests.filter((g) => !g.tableId && g.status === "CONFIRMED");

  const handleAssign = async (guestToken: string, tableId: string | null) => {
    setIsAssigning(true);
    try {
      await fetch(`/api/events/${eventId}/guests/${guestToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_table",
          tableId,
        }),
      });
      onRefresh();
    } catch (err) {
      console.error("Error assigning table:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-carbon-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-carbon-100 gap-4">
        <div>
          <div className="flex items-center gap-2 text-champagne-700 text-xs font-semibold uppercase tracking-widest mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span>Seating Plan &amp; Protocolo</span>
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-carbon-900 font-semibold">
            Distribución de Mesas en Convento de las Capuchinas
          </h3>
          <p className="text-xs text-carbon-500 mt-0.5">
            Asigna familias confirmadas controlando en vivo la capacidad de cada mesa.
          </p>
        </div>

        {/* Unassigned count pill */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{unassignedGuests.length} familias confirmadas sin mesa</span>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
        {tables.map((table) => {
          const assignedGuests = guests.filter((g) => g.tableId === table.tableId);
          const occupiedSeats = assignedGuests.reduce(
            (acc, g) => acc + (g.confirmedSeats || g.maxSeats),
            0
          );
          const isFull = occupiedSeats >= table.capacity;
          const isOverbooked = occupiedSeats > table.capacity;

          return (
            <div
              key={table.tableId}
              className={`p-5 rounded-3xl border transition-all ${
                isOverbooked
                  ? "bg-red-50/50 border-red-300"
                  : isFull
                  ? "bg-emerald-50/30 border-emerald-300"
                  : "bg-alabaster-50/80 border-champagne-300/60 hover:border-champagne-500"
              }`}
            >
              {/* Table Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-carbon-500">
                    {table.type === "IMPERIAL" ? "Mesa Imperial Rectangular" : "Mesa Redonda"}
                  </span>
                  <h4 className="font-serif text-xl font-bold text-carbon-900">
                    {table.name}
                  </h4>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isOverbooked
                      ? "bg-red-100 text-red-800 border-red-300"
                      : isFull
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-champagne-100 text-champagne-900 border-champagne-300"
                  }`}
                >
                  {occupiedSeats} / {table.capacity}
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-carbon-200 overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverbooked ? "bg-red-500" : isFull ? "bg-emerald-600" : "bg-champagne-500"
                  }`}
                  style={{ width: `${Math.min(100, (occupiedSeats / table.capacity) * 100)}%` }}
                />
              </div>

              {/* Assigned Guests List */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                {assignedGuests.length === 0 ? (
                  <p className="text-xs text-carbon-400 italic py-2 text-center">
                    Mesa disponible (sin invitados asignados)
                  </p>
                ) : (
                  assignedGuests.map((g) => (
                    <div
                      key={g.guestToken}
                      className="p-2 rounded-xl bg-white border border-carbon-200 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-semibold text-carbon-900 block truncate">
                          {g.familyName}
                        </span>
                        <span className="text-[10px] text-carbon-500">
                          {g.confirmedSeats || g.maxSeats} pases
                        </span>
                      </div>

                      <button
                        onClick={() => handleAssign(g.guestToken, null)}
                        disabled={isAssigning}
                        className="text-carbon-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                        title="Desasignar de esta mesa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Assign Guest Dropdown */}
              {!isFull && unassignedGuests.length > 0 && (
                <div className="pt-2 border-t border-carbon-200/60">
                  <select
                    disabled={isAssigning}
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssign(e.target.value, table.tableId);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-champagne-300 bg-white text-xs text-carbon-800 font-medium focus:outline-none"
                  >
                    <option value="" disabled>
                      + Sentar familia en esta mesa...
                    </option>
                    {unassignedGuests.map((ug) => (
                      <option key={ug.guestToken} value={ug.guestToken}>
                        {ug.familyName} ({ug.confirmedSeats || ug.maxSeats} pases)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
