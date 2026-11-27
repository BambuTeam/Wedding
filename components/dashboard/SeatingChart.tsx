"use client";

import React, { useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  Heart,
  LayoutGrid,
} from "lucide-react";
import { Table, Guest } from "@/lib/types";
import { getClientTenantHeaders } from "@/lib/auth/clientAuth";

interface SeatingChartProps {
  tables: Table[];
  guests: Guest[];
  eventId: string;
  onRefresh: () => void;
}

export function SeatingChart({ tables, guests, eventId, onRefresh }: SeatingChartProps) {
  const [isAssigning, setIsAssigning] = useState(false);

  // Group unassigned confirmed guests
  const unassignedGuests = guests.filter((g) => !g.tableId && g.status === "CONFIRMED");

  const handleAssign = async (guestToken: string, tableId: string | null) => {
    setIsAssigning(true);
    try {
      await fetch(`/api/events/${eventId}/guests/${guestToken}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getClientTenantHeaders(),
        },
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
    <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DFC8]/60 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7A5C30] text-[13px] font-sans font-semibold mb-1">
            <Heart className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
            <span>Acomodo &amp; Hospitalidad</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
            Acomodo de Mesas en el Jardín
          </h3>
          <p className="text-[13px] text-zinc-600 mt-0.5 font-sans">
            Ubica con cariño a cada familia asegurando que disfruten junto a sus personas favoritas.
          </p>
        </div>

        {/* Unassigned count pill */}
        <div className="px-4 py-2 rounded-2xl bg-[#F3EBDD] border border-[#DFC9A6] text-[#7A5C30] text-[13px] font-sans font-semibold flex items-center gap-2">
          <span>{unassignedGuests.length} familias confirmadas por ubicar</span>
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
                  ? "bg-red-50/60 border-red-300"
                  : isFull
                  ? "bg-emerald-50/40 border-emerald-300"
                  : "bg-[#FAF7F2] border-[#DFC9A6] hover:border-[#C5A059]"
              }`}
            >
              {/* Table Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[11px] font-sans font-semibold text-zinc-500 uppercase tracking-wider block">
                    {table.type === "IMPERIAL" ? "Mesa Imperial" : "Mesa Redonda"}
                  </span>
                  <h4 className="font-serif text-xl font-medium text-zinc-900">
                    {table.name}
                  </h4>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-[12px] font-sans font-semibold border ${
                    isOverbooked
                      ? "bg-red-100 text-red-800 border-red-300"
                      : isFull
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-[#F3EBDD] text-[#7A5C30] border-[#DECDB3]"
                  }`}
                >
                  {occupiedSeats} / {table.capacity} lugares
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-carbon-200 overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverbooked ? "bg-red-500" : isFull ? "bg-emerald-600" : "bg-[#C5A059]"
                  }`}
                  style={{ width: `${Math.min(100, (occupiedSeats / table.capacity) * 100)}%` }}
                />
              </div>

              {/* Assigned Guests List */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                {assignedGuests.length === 0 ? (
                  <p className="text-[13px] text-zinc-500 font-sans py-3 text-center">
                    Mesa libre (sin invitados asignados aún)
                  </p>
                ) : (
                  assignedGuests.map((g) => (
                    <div
                      key={g.guestToken}
                      className="p-2.5 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-sans font-semibold text-[13px] text-zinc-900 block truncate">
                          {g.familyName}
                        </span>
                        <span className="text-[12px] text-zinc-500 font-sans">
                          {g.confirmedSeats || g.maxSeats} personas
                        </span>
                      </div>

                      <button
                        onClick={() => handleAssign(g.guestToken, null)}
                        disabled={isAssigning}
                        className="text-zinc-400 hover:text-red-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                        title="Mover de esta mesa"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Assign Guest Dropdown */}
              {!isFull && unassignedGuests.length > 0 && (
                <div className="pt-2 border-t border-[#DFC9A6]/50">
                  <select
                    disabled={isAssigning}
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssign(e.target.value, table.tableId);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DFC9A6] bg-white text-[13px] text-zinc-800 font-sans font-medium focus:outline-none min-h-[44px]"
                  >
                    <option value="" disabled>
                      + Sentar familia en esta mesa...
                    </option>
                    {unassignedGuests.map((ug) => (
                      <option key={ug.guestToken} value={ug.guestToken}>
                        {ug.familyName} ({ug.confirmedSeats || ug.maxSeats} lugares)
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
