"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  UserCheck,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
  Plus,
  Loader2,
  Banknote,
  Send,
} from "lucide-react";
import { Tenant, PlanType, PaymentStatus } from "@/lib/types";

interface PendingReleaseInboxProps {
  pendingTenants: Tenant[];
  isReleasing: string | null;
  onRelease: (tenantId: string, options?: any) => Promise<void>;
  onOpenCreateModal: () => void;
}

export function PendingReleaseInbox({
  pendingTenants,
  isReleasing,
  onRelease,
  onOpenCreateModal,
}: PendingReleaseInboxProps) {
  const [selectedTenantToRelease, setSelectedTenantToRelease] = useState<Tenant | null>(null);
  const [releasePlan, setReleasePlan] = useState<PlanType>("FIRMA");
  const [releaseGuestLimit, setReleaseGuestLimit] = useState(200);
  const [releaseAmount, setReleaseAmount] = useState(2600);
  const [releasePaymentStatus, setReleasePaymentStatus] = useState<PaymentStatus>("PAID");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenReleaseModal = (tenant: Tenant) => {
    setSelectedTenantToRelease(tenant);
    setReleasePlan(tenant.plan || "FIRMA");
    setReleaseGuestLimit(tenant.maxGuestsPerEvent || 200);
    setReleaseAmount(tenant.amountPaid || 2600);
    setReleasePaymentStatus(tenant.paymentStatus || "PAID");
  };

  const handleConfirmRelease = async () => {
    if (!selectedTenantToRelease) return;
    await onRelease(selectedTenantToRelease.tenantId, {
      plan: releasePlan,
      maxGuestsPerEvent: Number(releaseGuestLimit),
      amountPaid: Number(releaseAmount),
      paymentStatus: releasePaymentStatus,
    });
    setSelectedTenantToRelease(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900">
              Bandeja de Liberación de Clientes
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {pendingTenants.length} pendientes
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Solicitudes capturadas desde la Landing Page listas para activar con credenciales por WhatsApp.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#DFC07D]" />
          <span>Crear y Liberar Cliente Manual</span>
        </button>
      </div>

      {/* List of Pending Tenants */}
      {pendingTenants.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-zinc-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">
            ¡Bandeja al día! Cero solicitudes pendientes
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Todas las solicitudes web han sido liberadas y activadas con éxito.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingTenants.map((t) => {
            const isLoading = isReleasing === t.tenantId;

            return (
              <div
                key={t.tenantId}
                className="p-6 rounded-3xl bg-white border border-amber-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                        {t.celebrationType || "Celebración"} · Plan {t.plan}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 mt-1">
                        {t.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(t.createdAt).toLocaleDateString("es-GT")}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-medium truncate">{t.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{t.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{t.estimatedDate || "Fecha tentativa"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>~{t.estimatedGuests || t.maxGuestsPerEvent} invitados</span>
                    </div>
                  </div>

                  {t.notes && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600">
                      <strong>Nota:</strong> {t.notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-zinc-400 text-[11px] block">Monto pactado:</span>
                    <span className="font-bold text-zinc-900">Q {t.amountPaid.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReleaseModal(t)}
                      disabled={isLoading}
                      className="px-4 py-2 min-h-[44px] rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#DFC07D]" />
                      )}
                      <span>Liberar y Activar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Release Options Modal */}
      {selectedTenantToRelease && mounted && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8F7138] block">
                Confirmar Liberación de Cliente
              </span>
              <h3 className="text-xl font-bold text-zinc-900 mt-0.5">
                {selectedTenantToRelease.name}
              </h3>
              <p className="text-xs text-zinc-500">
                Al activar, se generará su evento inicial en DynamoDB y su PIN de acceso de 6 dígitos.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase mb-1">
                  Plan a Asignar
                </label>
                <select
                  value={releasePlan}
                  onChange={(e) => setReleasePlan(e.target.value as PlanType)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-800"
                >
                  <option value="ESENCIAL">Colección Esencial (Hasta 100 invitados)</option>
                  <option value="FIRMA">Colección Firma (Hasta 200 invitados)</option>
                  <option value="GRAN_CELEBRACION">Gran Celebración (Hasta 350 invitados)</option>
                  <option value="PLANNER_PRO">Planner Pro (Multi-Evento Ilimitado)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase mb-1">
                    Cupo de Invitados
                  </label>
                  <input
                    type="number"
                    value={releaseGuestLimit}
                    onChange={(e) => setReleaseGuestLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase mb-1">
                    Monto (GTQ)
                  </label>
                  <input
                    type="number"
                    value={releaseAmount}
                    onChange={(e) => setReleaseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase mb-1">
                  Estado de Pago
                </label>
                <select
                  value={releasePaymentStatus}
                  onChange={(e) => setReleasePaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-800"
                >
                  <option value="PAID">Pagado 100%</option>
                  <option value="PARTIAL">Anticipo 50%</option>
                  <option value="COMPLIMENTARY">Cortesía / Demo VIP</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTenantToRelease(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRelease}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DFC07D]" />
                <span>Confirmar y Enviar Accesos</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
