'use client';

import React, { useState } from 'react';
import { Tenant, TenantRole, TenantStatus } from '@/lib/types';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Archive,
  MessageCircle,
  MoreVertical,
  Building2,
  Key,
  RotateCcw
} from 'lucide-react';

interface TenantsDirectoryProps {
  tenants: Tenant[];
  onToggleStatus: (tenantId: string, currentStatus: TenantStatus) => Promise<void>;
  onShowCredentials: (tenant: Tenant) => void;
  onRefresh: () => void;
}

export function TenantsDirectory({
  tenants,
  onToggleStatus,
  onShowCredentials,
  onRefresh,
}: TenantsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | TenantRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      (tenant.accountCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.tenantId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || tenant.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || tenant.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggle = async (tenant: Tenant) => {
    setActionMenuOpen(null);
    setLoadingId(tenant.tenantId);
    try {
      await onToggleStatus(tenant.tenantId, tenant.status);
    } finally {
      setLoadingId(null);
    }
  };

  const handleResetPin = async (tenant: Tenant) => {
    setActionMenuOpen(null);
    const confirmed = window.confirm(
      `¿Deseas restablecer el PIN de acceso para "${tenant.name}"? El PIN actual quedará invalidado inmediatamente y se generará uno nuevo de 6 dígitos.`
    );
    if (!confirmed) return;

    setLoadingId(tenant.tenantId);
    try {
      const res = await fetch("/api/root/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.tenantId, action: "RESET_PIN" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo restablecer el PIN");
      }
      onRefresh();
      if (data.tenant) {
        onShowCredentials(data.tenant);
      }
    } catch (err: any) {
      alert(err.message || "Error al restablecer PIN");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Activo
          </span>
        );
      case 'PENDING_RELEASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pendiente
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            Suspendido
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Archive className="w-3.5 h-3.5 text-zinc-500" />
            Archivado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por anfitrión, wedding planner, correo, teléfono o ID..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900 placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="ALL">Todos los roles</option>
            <option value="HOST">Anfitriones (HOST)</option>
            <option value="PLANNER">Planners / Agencias</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="PENDING_RELEASE">Pendientes</option>
            <option value="SUSPENDED">Suspendidos</option>
            <option value="ARCHIVED">Archivados</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Cliente / Cuenta</th>
                <th className="py-3 px-4">Rol & Colección</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Pago & Saldo</th>
                <th className="py-3 px-4">PIN Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No se encontraron clientes con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const isMenuOpen = actionMenuOpen === tenant.tenantId;
                  const isLoading = loadingId === tenant.tenantId;

                  const cleanPhone = tenant.phone.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}`;

                  return (
                    <tr
                      key={tenant.tenantId}
                      className="hover:bg-zinc-50/60 transition-colors group"
                    >
                      {/* Cliente / Cuenta */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                            tenant.role === 'PLANNER'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-zinc-100 text-zinc-800'
                          }`}>
                            {tenant.role === 'PLANNER' ? (
                              <Building2 className="w-4 h-4 text-purple-700" />
                            ) : (
                              tenant.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 group-hover:text-zinc-950 flex items-center gap-2">
                              {tenant.name}
                              {tenant.accountCode && (
                                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-[#8A6D1C] border border-amber-200">
                                  {tenant.accountCode}
                                </span>
                              )}
                              {tenant.role === 'PLANNER' && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                  Agencia
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-zinc-400">
                              {tenant.accountCode ? `Cuenta: ${tenant.accountCode}` : tenant.tenantId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rol & Colección */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-zinc-800">
                          {tenant.plan || 'Plan Estándar'}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {tenant.maxEvents || 1} {tenant.maxEvents === 1 ? 'evento' : 'eventos'}
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {tenant.phone}
                          </a>
                          <div className="text-xs text-zinc-500 truncate max-w-[180px]">
                            {tenant.email}
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(tenant.status)}
                      </td>

                      {/* Pago */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-zinc-900">
                          {tenant.currency === 'USD' ? '$' : 'Q'}{tenant.amountPaid || 0} {tenant.currency}
                        </div>
                        <div className="text-[11px]">
                          {tenant.paymentStatus === 'PAID' ? (
                            <span className="text-emerald-600 font-medium">Pagado</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Pendiente</span>
                          )}
                        </div>
                      </td>

                      {/* PIN */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {tenant.accessPin ? (
                          <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-bold border border-zinc-200 tracking-wider">
                            {tenant.accessPin}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">Sin PIN</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <div className="flex items-center justify-end gap-1">
                            {tenant.accessPin && (
                              <>
                                <button
                                  onClick={() => onShowCredentials(tenant)}
                                  title="Ver y Compartir Credenciales"
                                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleResetPin(tenant)}
                                  title="Resetear PIN de Acceso"
                                  disabled={isLoading}
                                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                >
                                  <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setActionMenuOpen(isMenuOpen ? null : tenant.tenantId)}
                              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActionMenuOpen(null)}
                              />
                              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-30 text-xs">
                                {tenant.accessPin && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setActionMenuOpen(null);
                                        onShowCredentials(tenant);
                                      }}
                                      className="w-full text-left px-3 py-2.5 min-h-[44px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                    >
                                      <Key className="w-4 h-4 text-zinc-400" />
                                      <span>Credenciales & Enlace</span>
                                    </button>

                                    <button
                                      onClick={() => handleResetPin(tenant)}
                                      disabled={isLoading}
                                      className="w-full text-left px-3 py-2.5 min-h-[44px] text-zinc-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2"
                                    >
                                      <RotateCcw className="w-4 h-4 text-amber-600" />
                                      <span>Resetear PIN (6 dígitos)</span>
                                    </button>
                                  </>
                                )}

                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full text-left px-3 py-2.5 min-h-[44px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                  onClick={() => setActionMenuOpen(null)}
                                >
                                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                                  <span>Escribir por WhatsApp</span>
                                </a>

                                <div className="border-t border-zinc-100 my-1" />

                                {tenant.status === 'ACTIVE' ? (
                                  <button
                                    disabled={isLoading}
                                    onClick={() => handleToggle(tenant)}
                                    className="w-full text-left px-3 py-2.5 min-h-[44px] text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                  >
                                    <Ban className="w-4 h-4" />
                                    <span>Suspender Cliente</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled={isLoading}
                                    onClick={() => handleToggle(tenant)}
                                    className="w-full text-left px-3 py-2.5 min-h-[44px] text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Reactivar Cliente</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
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
