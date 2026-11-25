"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Loader2, Users, Calendar, Banknote } from "lucide-react";
import { TenantRole, PlanType, PaymentStatus } from "@/lib/types";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

export function CreateClientModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateClientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<TenantRole>("HOST");
  const [celebrationType, setCelebrationType] = useState("Boda");
  const [estimatedDate, setEventDate] = useState("");
  const [plan, setPlan] = useState<PlanType>("FIRMA");
  const [maxEvents, setMaxEvents] = useState("1");
  const [maxGuestsPerEvent, setMaxGuestsPerEvent] = useState("200");
  const [amountPaid, setAmountPaid] = useState("2600");
  const [currency, setCurrency] = useState<"GTQ" | "USD">("GTQ");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PAID");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handlePlanChange = (newPlan: PlanType) => {
    setPlan(newPlan);
    if (newPlan === "ESENCIAL") {
      setMaxGuestsPerEvent("100");
      setAmountPaid("1400");
      setMaxEvents("1");
    } else if (newPlan === "FIRMA") {
      setMaxGuestsPerEvent("200");
      setAmountPaid("2600");
      setMaxEvents("1");
    } else if (newPlan === "GRAN_CELEBRACION") {
      setMaxGuestsPerEvent("350");
      setAmountPaid("3800");
      setMaxEvents("1");
    } else if (newPlan === "PLANNER_PRO") {
      setMaxGuestsPerEvent("9999");
      setAmountPaid("7500");
      setMaxEvents("9999");
      setRole("PLANNER");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit({
        name,
        email,
        phone,
        role,
        celebrationType,
        estimatedDate,
        plan,
        maxEvents: Number(maxEvents) || 1,
        maxGuestsPerEvent: Number(maxGuestsPerEvent) || 200,
        amountPaid: Number(amountPaid) || 0,
        currency,
        paymentStatus,
        notes,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8F7138] block">
            Alta Directa en Infraestructura
          </span>
          <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">
            Crear y Liberar Nuevo Cliente / Evento
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Configura el perfil, límites de cupo y evento en DynamoDB con entrega inmediata de credenciales.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Fila 1: Nombre y Rol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                Nombre(s) del Cliente / Agencia *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Valeria & Sebastián / Atelier Bodas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                Rol del Cliente
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TenantRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-[13px] text-zinc-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="HOST">Anfitrión Único (1 Evento)</option>
                <option value="PLANNER">Wedding Planner (Multi-Evento)</option>
              </select>
            </div>
          </div>

          {/* Fila 2: WhatsApp y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                WhatsApp / Teléfono *
              </label>
              <input
                type="tel"
                required
                placeholder="+502 5555 1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Fila 3: Celebración y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                Tipo de Celebración
              </label>
              <select
                value={celebrationType}
                onChange={(e) => setCelebrationType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-[13px] text-zinc-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="Boda">Boda</option>
                <option value="XV Años">Mis XV Años</option>
                <option value="Bautizo">Bautizo o Baby Shower</option>
                <option value="Cumpleaños">Cumpleaños o Aniversario</option>
                <option value="Corporativo">Evento Corporativo o Gala</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                Fecha Estimada del Evento
              </label>
              <input
                type="date"
                value={estimatedDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-[13px] text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Configuración del Plan y Límites */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <span className="font-bold text-[12px] text-zinc-800 uppercase tracking-wider block">
              Configuración de Plan y Cuotas
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Plan Asignado
                </label>
                <select
                  value={plan}
                  onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800"
                >
                  <option value="ESENCIAL">Esencial</option>
                  <option value="FIRMA">Firma (Recomendado)</option>
                  <option value="GRAN_CELEBRACION">Gran Celebración</option>
                  <option value="PLANNER_PRO">Planner Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Cupo de Invitados
                </label>
                <input
                  type="number"
                  value={maxGuestsPerEvent}
                  onChange={(e) => setMaxGuestsPerEvent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Límite de Eventos
                </label>
                <input
                  type="number"
                  value={maxEvents}
                  onChange={(e) => setMaxEvents(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800"
                />
              </div>
            </div>

            {/* Cobro y Estado de Pago */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Monto Cobrado
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "GTQ" | "USD")}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800"
                >
                  <option value="GTQ">GTQ (Quetzales)</option>
                  <option value="USD">USD (Dólares)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Estado de Pago
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800"
                >
                  <option value="PAID">Pagado 100%</option>
                  <option value="PARTIAL">Anticipo 50%</option>
                  <option value="COMPLIMENTARY">Cortesía / Demo</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
              Notas Operativas Internas (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Pagado por transferencia Banrural. Requiere apoyo con acomodo de 20 mesas."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creando y liberando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#DFC07D]" />
                  <span>Liberar y Generar Accesos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
