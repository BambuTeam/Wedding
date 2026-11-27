'use client';

import React from 'react';
import {
  Clock,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Tenant } from '@/lib/types';

interface PendingReleaseInboxProps {
  pendingTenants: Tenant[];
  isReleasing: string | null;
  onRelease: (tenantId: string, options?: any) => Promise<void>;
  onOpenCreateModal: (tenantToPreload?: Tenant | null) => void;
}

export function PendingReleaseInbox({
  pendingTenants,
  isReleasing,
  onRelease,
  onOpenCreateModal,
}: PendingReleaseInboxProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
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
            Solicitudes capturadas desde la Landing Page listas para activar con credenciales oficiales y WhatsApp.
          </p>
        </div>
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
                        {t.celebrationType || 'Celebración'} · Plan {t.plan}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 mt-1">
                        {t.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(t.createdAt).toLocaleDateString('es-GT')}</span>
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
                      <span>{t.estimatedDate || 'Fecha tentativa'}</span>
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
                    <span className="font-bold text-zinc-900 font-mono">
                      Q {Number(t.paidAmountGTQ || t.amountPaid || 2400).toLocaleString('es-GT')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenCreateModal(t)}
                      disabled={isLoading}
                      className="px-4 py-2 min-h-[42px] rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#DFC07D]" />
                      )}
                      <span>Configurar & Liberar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
