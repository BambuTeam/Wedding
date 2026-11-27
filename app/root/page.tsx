'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlatformKpis,
  Tenant,
  EventDirectoryItem,
  TenantStatus,
  EventStatus,
  PlanType,
} from '@/lib/types';
import { RootNavbar } from '@/components/root/RootNavbar';
import { RootKpiSection } from '@/components/root/RootKpiSection';
import { PendingReleaseInbox } from '@/components/root/PendingReleaseInbox';
import { EventsDirectory } from '@/components/root/EventsDirectory';
import { TenantsDirectory } from '@/components/root/TenantsDirectory';
import { CredentialsSuccessModal } from '@/components/root/CredentialsSuccessModal';
import { CreateClientModal } from '@/components/root/CreateClientModal';
import {
  CalendarDays,
  Inbox,
  Users,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function RootDashboardPage() {
  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'inbox' | 'events' | 'tenants'>('inbox');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  // Data State
  const [kpis, setKpis] = useState<PlatformKpis | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [events, setEvents] = useState<EventDirectoryItem[]>([]);
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>('admin@aurea.lat');
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; table: string }>({
    connected: true,
    table: 'EventosPlatform',
  });

  // Modals State
  const [credentialsData, setCredentialsData] = useState<{
    clientName: string;
    phone: string;
    celebrationType?: string;
    accountCode?: string;
    email?: string;
    accessUrl: string;
    accessPin: string;
    eventId?: string;
  } | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Verify session & admin info
      const meRes = await fetch('/api/root/auth/me');
      if (meRes.status === 401) {
        router.push('/root/login');
        return;
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.email) {
          setCurrentAdminEmail(meData.user.email);
        }
      }

      // Fetch KPIs, Tenants, Events and AWS Status in parallel
      const [kpisRes, tenantsRes, eventsRes, statusRes] = await Promise.all([
        fetch('/api/root/kpis'),
        fetch('/api/root/tenants'),
        fetch('/api/root/events'),
        fetch('/api/root/status').catch(() => null),
      ]);

      if (!kpisRes.ok || !tenantsRes.ok || !eventsRes.ok) {
        throw new Error('Error al sincronizar datos del panel');
      }

      const [kpisData, tenantsData, eventsData] = await Promise.all([
        kpisRes.json(),
        tenantsRes.json(),
        eventsRes.json(),
      ]);

      if (statusRes && statusRes.ok) {
        const statusJson = await statusRes.json();
        if (statusJson.dynamodb) {
          setConnectionStatus(statusJson.dynamodb);
        }
      }

      setKpis(kpisData.kpis);
      setTenants(tenantsData.tenants || []);
      setEvents(eventsData.events || []);
    } catch (err: any) {
      console.error('Failed to load root data:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived counts
  const pendingTenants = tenants.filter((t) => t.status === 'PENDING_RELEASE');

  // Handlers
  const handleLogout = async () => {
    try {
      await fetch('/api/root/auth/logout', { method: 'POST' });
      router.push('/root/login');
    } catch (e) {
      console.error(e);
      router.push('/root/login');
    }
  };

  const handleRelease = async (
    tenantId: string,
    options?: { plan?: PlanType; maxGuestsPerEvent?: number; amountPaid?: number }
  ) => {
    try {
      setReleasingId(tenantId);
      const res = await fetch(`/api/root/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          action: 'release',
          ...(options || {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo liberar el cliente');
      }

      const data = await res.json();

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aurea.lat';
      const accessUrl = data.fullMagicUrl || `${origin}${data.magicUrl}`;

      setCredentialsData({
        clientName: data.tenant.name,
        phone: data.tenant.phone,
        celebrationType: data.tenant.celebrationType || 'Celebración',
        accountCode: data.tenant.accountCode || data.accountCode,
        email: data.tenant.email,
        accessUrl,
        accessPin: data.tenant.accessPin,
        eventId: data.eventId || data.tenant.primaryEventId,
      });

      // Reload fresh data
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al liberar cliente');
    } finally {
      setReleasingId(null);
    }
  };

  const handleCreateClient = async (formData: any) => {
    try {
      const res = await fetch('/api/root/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo crear el cliente');
      }

      const data = await res.json();

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aurea.lat';
      const accessUrl = data.fullMagicUrl || `${origin}${data.magicUrl || `/dashboard?account=${data.tenant.accountCode || data.tenant.tenantId}&pin=${data.tenant.accessPin}`}`;

      setCreateModalOpen(false);
      setCredentialsData({
        clientName: data.tenant.name,
        phone: data.tenant.phone,
        celebrationType: data.tenant.celebrationType || formData.celebrationType || 'Celebración',
        accountCode: data.tenant.accountCode || data.accountCode,
        email: data.tenant.email,
        accessUrl,
        accessPin: data.tenant.accessPin,
        eventId: data.tenant.primaryEventId,
      });

      // Reload fresh data
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al crear cliente');
    }
  };

  const handleToggleTenantStatus = async (tenantId: string, currentStatus: TenantStatus) => {
    try {
      const newStatus: TenantStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const res = await fetch(`/api/root/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar estado del cliente');
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: EventStatus) => {
    try {
      const res = await fetch(`/api/root/events`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          status: newStatus,
          isLocked: newStatus === 'ARCHIVED',
        }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar estado del evento');
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar evento');
    }
  };

  const handleSaveEventLimits = async (
    eventId: string,
    updates: { maxGuestsLimit: number; plan: PlanType }
  ) => {
    try {
      const res = await fetch(`/api/root/events`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          maxGuestsLimit: updates.maxGuestsLimit,
          plan: updates.plan,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar límites del evento');
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar límites');
    }
  };

  const handleShowCredentials = (tenant: Tenant) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aurea.lat';
    const accountCode = tenant.accountCode || tenant.tenantId;
    const accessUrl = `${origin}/dashboard?account=${accountCode}&pin=${tenant.accessPin}&eventId=${tenant.primaryEventId || ''}`;

    setCredentialsData({
      clientName: tenant.name,
      phone: tenant.phone,
      celebrationType: tenant.celebrationType,
      accountCode: tenant.accountCode,
      email: tenant.email,
      accessUrl,
      accessPin: tenant.accessPin || '982341',
      eventId: tenant.primaryEventId,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-zinc-900 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <RootNavbar
        userEmail={currentAdminEmail}
        isRefreshing={isRefreshing}
        onRefresh={loadData}
        onLogout={handleLogout}
        connectionStatus={connectionStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error notification if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Executive KPI Section */}
        <section aria-label="Indicadores Clave">
          <RootKpiSection
            kpis={kpis}
            onOpenPending={() => setActiveTab('inbox')}
          />
        </section>

        {/* Tabs and Module View */}
        <section className="space-y-6">
          {/* Tab Navigation Bar */}
          <div className="border-b border-zinc-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-px">
              {/* Tab: Bandeja de Liberación */}
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'inbox'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Bandeja de Liberación</span>
                {pendingTenants.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200/80">
                    {pendingTenants.length}
                  </span>
                )}
              </button>

              {/* Tab: Directorio de Celebraciones */}
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Directorio de Celebraciones</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                  {events.length}
                </span>
              </button>

              {/* Tab: Directorio de Clientes */}
              <button
                onClick={() => setActiveTab('tenants')}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'tenants'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Clientes & Cuentas</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                  {tenants.length}
                </span>
              </button>
            </div>

            {/* Quick Action Button */}
            <div className="pb-3 sm:pb-0 flex items-center justify-end">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear y Liberar Cliente</span>
              </button>
            </div>
          </div>

          {/* Module Content */}
          {loading && !kpis ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-500">
                Sincronizando base de datos global...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'inbox' && (
                <PendingReleaseInbox
                  pendingTenants={pendingTenants}
                  isReleasing={releasingId}
                  onRelease={handleRelease}
                  onOpenCreateModal={() => setCreateModalOpen(true)}
                />
              )}

              {activeTab === 'events' && (
                <EventsDirectory
                  events={events}
                  onToggleStatus={handleUpdateEventStatus}
                  onSaveLimits={handleSaveEventLimits}
                />
              )}

              {activeTab === 'tenants' && (
                <TenantsDirectory
                  tenants={tenants}
                  onToggleStatus={handleToggleTenantStatus}
                  onShowCredentials={handleShowCredentials}
                  onRefresh={loadData}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 tracking-tight">
              ÁUREA SUPERADMIN
            </span>
            <span>•</span>
            <span>AWS DynamoDB Single-Table + S3 Architecture</span>
          </div>
          <div>
            Sesión activa como <span className="font-mono text-zinc-700">{currentAdminEmail}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CredentialsSuccessModal
        isOpen={!!credentialsData}
        onClose={() => setCredentialsData(null)}
        data={credentialsData}
      />

      <CreateClientModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateClient}
      />
    </div>
  );
}
