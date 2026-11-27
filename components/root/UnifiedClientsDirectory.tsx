'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Clock,
  Ban,
  Archive,
  MessageCircle,
  Building2,
  Copy,
  Check,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Calendar,
  Image as ImageIcon,
  Grid,
  Sparkles,
} from 'lucide-react';
import { Tenant, EventDirectoryItem, TenantRole, TenantStatus } from '@/lib/types';

interface UnifiedClientsDirectoryProps {
  tenants: Tenant[];
  events: EventDirectoryItem[];
  onOpenManageDrawer: (tenant: Tenant, linkedEvent?: EventDirectoryItem | null) => void;
  onShowCredentials: (tenant: Tenant) => void;
  onRefresh: () => void;
}

type QuickPillFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'PLANNERS';

export function UnifiedClientsDirectory({
  tenants,
  events,
  onOpenManageDrawer,
  onShowCredentials,
  onRefresh,
}: UnifiedClientsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pillFilter, setPillFilter] = useState<QuickPillFilter>('ALL');
  const [expandedPlannerId, setExpandedPlannerId] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  // Formateador de nombres de planes humanos
  const formatPlanName = (plan?: string) => {
    switch (plan?.toUpperCase()) {
      case 'ESENCIAL':
        return 'Plan Esencial';
      case 'FIRMA':
        return 'Plan Firma';
      case 'GRAN_CELEBRACION':
        return 'Gran Celebración';
      case 'PLANNER_PRO':
        return 'Planner Pro';
      default:
        return plan ? `Plan ${plan}` : 'Plan Esencial';
    }
  };

  // Badge de estado operativo de cuenta
  const getStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Activo
          </span>
        );
      case 'PENDING_RELEASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0">
            <Clock className="w-3 h-3 text-amber-600" />
            Por liberar
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shrink-0">
            <Ban className="w-3 h-3 text-rose-600" />
            Suspendido
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 whitespace-nowrap shrink-0">
            <Archive className="w-3 h-3 text-zinc-500" />
            Archivado
          </span>
        );
      default:
        return null;
    }
  };

  // Filtrado de tenants
  const filteredTenants = tenants.filter((tenant) => {
    const linkedEvent =
      events.find((e) => e.eventId === tenant.primaryEventId) ||
      events.find((e) => e.tenantId === tenant.tenantId);

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      tenant.name.toLowerCase().includes(term) ||
      tenant.email.toLowerCase().includes(term) ||
      tenant.phone.includes(term) ||
      (tenant.accountCode || '').toLowerCase().includes(term) ||
      (linkedEvent?.title || '').toLowerCase().includes(term) ||
      (linkedEvent?.venueCity || '').toLowerCase().includes(term);

    if (!matchesSearch) return false;

    // Filtros por píldora rápida
    if (pillFilter === 'ACTIVE' && tenant.status !== 'ACTIVE') return false;
    if (pillFilter === 'PENDING' && tenant.status !== 'PENDING_RELEASE') return false;
    if (pillFilter === 'PLANNERS' && tenant.role !== 'PLANNER') return false;

    return true;
  });

  const handleCopyPin = (e: React.MouseEvent, pin: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pin);
    setCopiedPinId(id);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  // Conteo de píldoras
  const totalCount = tenants.length;
  const activeCount = tenants.filter((t) => t.status === 'ACTIVE').length;
  const pendingCount = tenants.filter((t) => t.status === 'PENDING_RELEASE').length;
  const plannersCount = tenants.filter((t) => t.role === 'PLANNER').length;

  return (
    <div className="space-y-4 font-sans">
      {/* Search and Quick Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, AUR-XXXX, correo, WhatsApp o celebración..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium text-zinc-800 placeholder:text-zinc-400"
          />
        </div>

        {/* 1-Click Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 shrink-0">
          {[
            { id: 'ALL', label: 'Todos', count: totalCount },
            { id: 'ACTIVE', label: 'Activos', count: activeCount },
            { id: 'PENDING', label: 'Por liberar', count: pendingCount },
            { id: 'PLANNERS', label: 'Agencias', count: plannersCount },
          ].map((pill) => {
            const isSelected = pillFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setPillFilter(pill.id as QuickPillFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200/80 text-zinc-600'
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla Maestra Unificada */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/90 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Cliente & Cuenta</th>
                <th className="py-3 px-4">Celebración Vinculada</th>
                <th className="py-3 px-4">Métricas Operativas</th>
                <th className="py-3 px-4">Facturación & Estado</th>
                <th className="py-3 px-4 text-right">Credenciales & Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-zinc-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold text-zinc-600">No se encontraron clientes o celebraciones</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Prueba cambiando los filtros o el término de búsqueda</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const accountCode = tenant.accountCode || tenant.tenantId;
                  const tenantEvents = events.filter((e) => e.tenantId === tenant.tenantId);
                  const linkedEvent =
                    events.find((e) => e.eventId === tenant.primaryEventId) ||
                    tenantEvents[0] ||
                    null;

                  const isExpanded = expandedPlannerId === tenant.tenantId;
                  const cleanPhone = (tenant.phone || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}`;

                  // Métricas
                  const totalConfirmed = linkedEvent?.totalGuestsConfirmed || 0;
                  const maxLimit = linkedEvent?.maxGuestsLimit || tenant.maxGuestsPerEvent || 200;
                  const progressPct = Math.min(100, Math.round((totalConfirmed / Math.max(1, maxLimit)) * 100));
                  const tablesCount = linkedEvent?.totalTables || 0;
                  const photosCount = linkedEvent?.totalPhotosS3 || 0;

                  // Monto formateado
                  const amount = tenant.paidAmountGTQ || tenant.amountPaid || 2600;
                  const formattedAmount = `Q ${Number(amount).toLocaleString('es-GT')}`;

                  // URL de suplantación segura como SuperAdmin
                  const impersonationUrl = `/dashboard?account=${accountCode}&pin=${tenant.accessPin || '782910'}&eventId=${linkedEvent?.eventId || ''}`;

                  return (
                    <React.Fragment key={tenant.tenantId}>
                      <tr className="hover:bg-[#FAF8F5]/80 transition-colors group">
                        {/* 1. Cliente & Cuenta */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                                tenant.role === 'PLANNER'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : 'bg-[#F2ECE1] text-[#7A5C30] border border-[#DFC9A6]'
                              }`}
                            >
                              {tenant.role === 'PLANNER' ? (
                                <Building2 className="w-5 h-5 text-purple-700" />
                              ) : (
                                tenant.name.slice(0, 2).toUpperCase()
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-zinc-900 group-hover:text-black leading-tight whitespace-nowrap">
                                  {tenant.name}
                                </span>
                                <span className="text-[10px] font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-[#8A6D1C] border border-amber-200/80 whitespace-nowrap shrink-0">
                                  {accountCode}
                                </span>
                                {tenant.role === 'PLANNER' && (
                                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 whitespace-nowrap shrink-0">
                                    Agencia
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-xs text-zinc-500 whitespace-nowrap">
                                <span className="truncate max-w-[190px]">{tenant.email}</span>
                                <span className="hidden sm:inline text-zinc-300">•</span>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold whitespace-nowrap"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{tenant.phone}</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Celebración Vinculada */}
                        <td className="py-4 px-4 align-top">
                          {linkedEvent ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-900">{linkedEvent.title}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 whitespace-nowrap shrink-0">
                                  {linkedEvent.category || tenant.celebrationType || 'Boda'}
                                </span>
                              </div>
                              <div className="text-zinc-500 text-[11px] flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span className="truncate">{linkedEvent.venueCity || linkedEvent.eventDateFormatted || 'Guatemala'}</span>
                              </div>

                              {tenant.role === 'PLANNER' && tenantEvents.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedPlannerId(isExpanded ? null : tenant.tenantId)}
                                  className="inline-flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-bold mt-1 whitespace-nowrap"
                                >
                                  <span>{isExpanded ? 'Ocultar' : `Ver ${tenantEvents.length} eventos`}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenManageDrawer(tenant, null)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 text-[11px] font-bold transition-all whitespace-nowrap shadow-2xs group/btn"
                              title="Vincular o liberar evento para este cliente"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover/btn:rotate-12 transition-transform" />
                              <span>+ Vincular / Liberar evento →</span>
                            </button>
                          )}
                        </td>

                        {/* 3. Métricas Operativas */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1.5 min-w-[150px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-zinc-600 font-semibold">
                                {totalConfirmed} <span className="text-zinc-400 font-normal">/ {maxLimit} cupos</span>
                              </span>
                              <span className="font-mono text-zinc-500">{progressPct}%</span>
                            </div>

                            {/* Mini progress bar */}
                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${progressPct}%` }}
                                className={`h-full rounded-full transition-all ${
                                  progressPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              />
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono pt-0.5">
                              <span className="inline-flex items-center gap-1" title="Mesas creadas">
                                <Grid className="w-3 h-3 text-zinc-400" />
                                {tablesCount} mesas
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1" title="Fotografías en S3">
                                <ImageIcon className="w-3 h-3 text-zinc-400" />
                                {photosCount} fotos
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Facturación & Estado */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span className="font-mono font-bold text-zinc-900 text-xs">
                                {formattedAmount}
                              </span>
                              {tenant.paymentStatus === 'PAID' ? (
                                <span className="text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                                  • Pagado
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-amber-700 whitespace-nowrap">
                                  • Cobro pendiente
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-zinc-500 whitespace-nowrap">
                              {formatPlanName(tenant.plan)}
                            </div>

                            <div className="pt-0.5">
                              {getStatusBadge(tenant.status)}
                            </div>
                          </div>
                        </td>

                        {/* 5. Credenciales & Control (Compacto en 2 niveles limpios) */}
                        <td className="py-4 px-4 align-top text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            {/* Fila superior: Pill monospace compacta con botón de copiar y feedback */}
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-100/90 border border-zinc-200/80 whitespace-nowrap">
                              <span className="font-mono font-bold text-xs text-zinc-800 tracking-wider">
                                PIN {tenant.accessPin || '782910'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyPin(e, tenant.accessPin || '782910', tenant.tenantId)}
                                className="p-0.5 rounded text-zinc-400 hover:text-zinc-800 transition-colors"
                                title="Copiar PIN"
                              >
                                {copiedPinId === tenant.tenantId ? (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                                    <Check className="w-3 h-3" /> Copiado
                                  </span>
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Fila inferior: Botones horizontales compactos sin partir texto */}
                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                              {/* Panel ↗ */}
                              <a
                                href={impersonationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-bold transition-all shadow-2xs whitespace-nowrap shrink-0"
                                title="Ingresar directamente a su panel de anfitrión"
                              >
                                <span>Panel</span>
                                <ExternalLink className="w-3 h-3 text-[#DFC07D]" />
                              </a>

                              {/* Administrar */}
                              <button
                                type="button"
                                onClick={() => onOpenManageDrawer(tenant, linkedEvent)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-100 text-zinc-800 text-[11px] font-bold transition-all shadow-2xs whitespace-nowrap shrink-0"
                                title="Abrir panel de administración total"
                              >
                                <SlidersHorizontal className="w-3 h-3 text-zinc-600" />
                                <span>Administrar</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Fila expandible si es Planner con múltiples eventos */}
                      {isExpanded && tenantEvents.length > 1 && (
                        <tr className="bg-purple-50/50 border-t border-purple-100">
                          <td colSpan={5} className="py-3 px-6">
                            <div className="space-y-2">
                              <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                                Celebraciones adicionales gestionadas por {tenant.name}:
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {tenantEvents.map((evt) => (
                                  <div
                                    key={evt.eventId}
                                    className="p-3 bg-white rounded-xl border border-purple-200/80 shadow-xs flex items-center justify-between"
                                  >
                                    <div>
                                      <p className="font-bold text-xs text-zinc-900">{evt.title}</p>
                                      <p className="text-[10px] text-zinc-500 font-mono">
                                        {evt.venueCity || evt.eventDateFormatted}
                                      </p>
                                    </div>
                                    <a
                                      href={`/dashboard?account=${accountCode}&pin=${tenant.accessPin}&eventId=${evt.eventId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                                      title="Abrir este evento"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
