"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Loader2 } from "lucide-react";
import { EventDirectoryItem, PlanType } from "@/lib/types";

interface EditEventLimitsModalProps {
  isOpen: boolean;
  event: EventDirectoryItem | null;
  onClose: () => void;
  onSave: (eventId: string, updates: { maxGuestsLimit: number; plan: PlanType }) => Promise<void>;
}

export function EditEventLimitsModal({
  isOpen,
  event,
  onClose,
  onSave,
}: EditEventLimitsModalProps) {
  const [maxGuests, setMaxGuests] = useState(event?.maxGuestsLimit || 200);
  const [plan, setPlan] = useState<PlanType>(event?.plan || "FIRMA");
  const [isSaving, setIsSaving] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (event) {
      setMaxGuests(event.maxGuestsLimit || 200);
      setPlan(event.plan || "FIRMA");
    }
  }, [event]);

  if (!isOpen || !event || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(event.eventId, {
        maxGuestsLimit: Number(maxGuests),
        plan,
      });
      onClose();
    } catch (err) {
      console.error("Error saving limits:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8F7138] block">
            Control de Capacidad
          </span>
          <h3 className="text-xl font-bold text-zinc-900 mt-0.5">
            Editar Límites &amp; Cupo
          </h3>
          <p className="text-xs text-zinc-500">
            {event.title} ({event.category})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase mb-1">
              Plan Asignado
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-800"
            >
              <option value="ESENCIAL">Colección Esencial (Límite 100)</option>
              <option value="FIRMA">Colección Firma (Límite 200)</option>
              <option value="GRAN_CELEBRACION">Gran Celebración (Límite 350)</option>
              <option value="PLANNER_PRO">Planner Pro (Ilimitado)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase mb-1">
              Límite Máximo de Invitados Permitidos
            </label>
            <input
              type="number"
              min={event.totalGuestsConfirmed || 1}
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-900"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Actualmente hay {event.totalGuestsConfirmed} invitados confirmados y {event.totalSeatsAllocated} asientos distribuidos.
            </p>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#DFC07D]" />}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
