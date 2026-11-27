'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Archive,
  MessageCircle,
  Building2,
  Key,
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

export function UnifiedClientsDirectory({
  tenants,
  events,
  onOpenManageDrawer,
  onShowCredentials,
  onRefresh,
}: UnifiedClientsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | TenantRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [expandedPlannerId, setExpandedPlannerId] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

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

    const matchesRole = roleFilter === 'ALL' || tenant.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || tenant.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCopyPin = (e: React.MouseEvent, pin: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pin);
    setCopiedPinId(id);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  const getStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Activo
          </span>
        );
      case 'PENDING_RELEASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pendiente
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3 text-rose-600" />
            Suspendido
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Archive className="w-3 h-3 text-zinc-500" />
            Archivado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, AUR-XXXX, correo, WhatsApp o evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium text-zinc-800 placeholder:text-zinc-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="COUPLE">Parejas & Anfitriones</option>
            <option value="PLANNER">Planners & Agencias</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="PENDING_RELEASE">Pendientes</option>
            <option value="SUSPENDED">Suspendidos</option>
            <option value="ARCHIVED">Archivados</option>
          </select>
        </div>
      </div>

      {/* Tabla Maestra Unificada */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
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

                  // URL de suplantación segura como SuperAdmin
                  const impersonationUrl = `/dashboard?account=${accountCode}&pin=${tenant.accessPin || '782910'}&eventId=${linkedEvent?.eventId || ''}`;

                  return (
                    <React.Fragment key={tenant.tenantId}>
                      <tr className="hover:bg-[#FAF8F5]/80 transition-colors group">
                        {/* 1. Cliente & Cuenta */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
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
                                <span className="font-bold text-sm text-zinc-900 group-hover:text-black leading-tight">
                                  {tenant.name}
                                </span>
                                <span className="text-[10px] font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-[#8A6D1C] border border-amber-200/80 whitespace-nowrap shrink-0">
                                  {accountCode}
                                </span>
                                {tenant.role === 'PLANNER' && (
                                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 shrink-0">
                                    Agencia
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-xs text-zinc-500">
                                <span className="truncate max-w-[190px]">{tenant.email}</span>
                                <span className="hidden sm:inline text-zinc-300">•</span>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
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
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                                  {linkedEvent.category || tenant.celebrationType || 'Boda'}
                                </span>
                              </div>
                              <div className="text-zinc-500 text-[11px] flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-400" />
                                <span>{linkedEvent.venueCity || linkedEvent.eventDateFormatted || 'Guatemala'}</span>
                              </div>

                              {tenant.role === 'PLANNER' && tenantEvents.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedPlannerId(isExpanded ? null : tenant.tenantId)}
                                  className="inline-flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-bold mt-1"
                                >
                                  <span>{isExpanded ? 'Ocultar' : `Ver ${tenantEvents.length} eventos`}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-zinc-400 italic">Sin evento vinculado</div>
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
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-zinc-900">
                                Q{tenant.paidAmountGTQ || tenant.amountPaid || 2600}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  tenant.paymentStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {tenant.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                              </span>
                            </div>

                            <div className="text-[11px] text-zinc-500">Plan {tenant.plan || 'FIRMA'}</div>

                            <div className="pt-0.5">{getStatusBadge(tenant.status)}</div>
                          </div>
                        </td>

                        {/* 5. Credenciales & Control */}
                        <td className="py-4 px-4 align-top text-right">
                          <div className="flex flex-col items-end gap-2">
                            {/* PIN Pill con botón de copiar */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 border border-zinc-200">
                              <span className="text-[10px] uppercase font-bold text-zinc-400">PIN:</span>
                              <span className="font-mono font-extrabold text-zinc-900 tracking-wider">
                                {tenant.accessPin || '982341'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyPin(e, tenant.accessPin || '982341', tenant.tenantId)}
                                className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
                                title="Copiar PIN"
                              >
                                {copiedPinId === tenant.tenantId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex items-center gap-1.5">
                              {/* Entrar al panel (suplantación) */}
                              <a
                                href={impersonationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-[11px] font-bold transition-all shadow-sm"
                                title="Ingresar directamente a su panel de anfitrión"
                              >
                                <span>Entrar al panel</span>
                                <ExternalLink className="w-3 h-3 text-[#DFC07D]" />
                              </a>

                              {/* Botón Administrar (Drawer) */}
                              <button
                                type="button"
                                onClick={() => onOpenManageDrawer(tenant, linkedEvent)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-100 text-zinc-800 text-[11px] font-bold transition-all shadow-sm"
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
                                    className="p-3 bg-white rounded-xl border border-purple-200/80 shadow-sm flex items-center justify-between"
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
