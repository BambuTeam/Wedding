'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Key,
  RotateCcw,
  Shield,
  CreditCard,
  Calendar,
  Users,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Archive,
  Ban,
  Trash2,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Tenant, EventDirectoryItem, TenantRole, PlanType, PaymentStatus, TenantStatus, EventStatus } from '@/lib/types';

interface RootTenantControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  linkedEvent?: EventDirectoryItem | null;
  onRefresh: () => void;
  onShowCredentialsModal?: (tenant: Tenant) => void;
}

export function RootTenantControlDrawer({
  isOpen,
  onClose,
  tenant,
  linkedEvent,
  onRefresh,
  onShowCredentialsModal,
}: RootTenantControlDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State - Tenant & Facturación
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<TenantRole>('COUPLE');
  const [plan, setPlan] = useState<PlanType>('FIRMA');
  const [paidAmountGTQ, setPaidAmountGTQ] = useState(2600);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [tenantStatus, setTenantStatus] = useState<TenantStatus>('ACTIVE');

  // Form State - Evento
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxGuestsLimit, setMaxGuestsLimit] = useState(200);
  const [eventStatus, setEventStatus] = useState<EventStatus>('LIVE');
  const [isLocked, setIsLocked] = useState(false);

  // Security State
  const [currentPin, setCurrentPin] = useState('');
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [resetPinSuccessMsg, setResetPinSuccessMsg] = useState<string | null>(null);
  const [newWaLink, setNewWaLink] = useState<string | null>(null);

  // Deletion State
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Clipboard States
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '');
      setEmail(tenant.email || '');
      setPhone(tenant.phone || '');
      setRole(tenant.role || 'COUPLE');
      setPlan(tenant.plan || 'FIRMA');
      setPaidAmountGTQ(tenant.paidAmountGTQ || tenant.amountPaid || 2600);
      setPaymentStatus(tenant.paymentStatus || 'PAID');
      setTenantStatus(tenant.status || 'ACTIVE');
      setCurrentPin(tenant.accessPin || '');
      setResetPinSuccessMsg(null);
      setNewWaLink(null);
      setDeleteConfirmation('');
      setErrorMessage(null);
      setSaveSuccess(false);
    }

    if (linkedEvent) {
      setEventTitle(linkedEvent.title || '');
      setEventDate(linkedEvent.eventDate ? linkedEvent.eventDate.split('T')[0] : '');
      setMaxGuestsLimit(linkedEvent.maxGuestsLimit || 200);
      setEventStatus(linkedEvent.status || 'LIVE');
      setIsLocked(Boolean(linkedEvent.isLocked));
    }
  }, [tenant, linkedEvent]);

  if (!isOpen || !tenant) return null;

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://aurea.lat';
  const accountCode = tenant.accountCode || tenant.tenantId;
  const directAccessUrl = `${currentOrigin}/dashboard?account=${accountCode}&pin=${currentPin}`;

  const handleCopy = (text: string, type: 'account' | 'pin' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else if (type === 'pin') {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Guardar Cambios en Tenant y Evento
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      // 1. Guardar cambios del Tenant
      const tenantRes = await fetch('/api/root/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.tenantId,
          name,
          email,
          phone,
          role,
          plan,
          paidAmountGTQ,
          paymentStatus,
          status: tenantStatus,
          maxGuestsPerEvent: maxGuestsLimit,
        }),
      });

      if (!tenantRes.ok) {
        const data = await tenantRes.json();
        throw new Error(data.error || 'Error al guardar datos del cliente');
      }

      // 2. Guardar cambios del Evento si existe
      if (linkedEvent?.eventId) {
        const eventRes = await fetch('/api/root/events', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: linkedEvent.eventId,
            title: eventTitle,
            eventDate,
            maxGuestsLimit,
            plan,
            status: eventStatus,
            isLocked: eventStatus === 'ARCHIVED' || isLocked,
          }),
        });

        if (!eventRes.ok) {
          const data = await eventRes.json();
          throw new Error(data.error || 'Error al guardar datos del evento');
        }
      }

      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la actualización');
    } finally {
      setIsSaving(false);
    }
  };

  // Resetear PIN
  const handleResetPin = async () => {
    const confirmed = window.confirm(
      `¿Restablecer PIN de acceso para "${tenant.name}"? El PIN actual quedará invalidado y se generará uno nuevo de 6 dígitos.`
    );
    if (!confirmed) return;

    setIsResettingPin(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/root/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.tenantId,
          action: 'RESET_PIN',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo restablecer el PIN');
      }

      const newPin = data.accessPin || data.tenant?.accessPin;
      setCurrentPin(newPin);
      setNewWaLink(data.waLink || null);
      setResetPinSuccessMsg(`¡Nuevo PIN confidencial generado: ${newPin}!`);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al restablecer PIN');
    } finally {
      setIsResettingPin(false);
    }
  };

  // Cambios rápidos de ciclo de vida
  const handleSetLifecycleStatus = (newTenantStatus: TenantStatus, newEventStatus: EventStatus, locked: boolean) => {
    setTenantStatus(newTenantStatus);
    setEventStatus(newEventStatus);
    setIsLocked(locked);
  };

  // Eliminar Cliente
  const handleDeleteTenant = async () => {
    if (deleteConfirmation.trim() !== accountCode.trim()) {
      alert(`Para confirmar, debes escribir exactamente el código: ${accountCode}`);
      return;
    }

    const finalConfirm = window.confirm(
      `⚠️ ACCIÓN IRREVERSIBLE: ¿Estás completamente seguro de eliminar a "${tenant.name}" (${accountCode}) y todos sus eventos de DynamoDB?`
    );
    if (!finalConfirm) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/root/tenants?tenantId=${encodeURIComponent(tenant.tenantId)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar cliente');
      }

      alert(`Cliente ${accountCode} eliminado con éxito.`);
      onRefresh();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar cliente');
      setIsDeleting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl z-10 flex flex-col h-full overflow-hidden border-l border-zinc-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#DFC07D] font-bold text-sm">
              <Shield className="w-5 h-5 text-[#DFC07D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{tenant.name}</h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#C5A059]/30 text-[#DFC07D] border border-[#C5A059]/40 whitespace-nowrap">
                  {accountCode}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Control Total Exclusivo del SuperAdmin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status / Alert Banners */}
        {errorMessage && (
          <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Datos y límites actualizados correctamente en AWS DynamoDB!</span>
          </div>
        )}

        {/* Drawer Body - Scrollable Content */}
        <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 divide-y divide-zinc-100">
          {/* ========================================================================= */}
          {/* SECCIÓN 1: DATOS DEL CLIENTE & FACTURACIÓN                                */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-[#8C6D46]" />
              <span>1. Datos del Cliente & Facturación</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre del Anfitrión / Agencia</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Teléfono WhatsApp</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Rol de Acceso</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TenantRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                >
                  <option value="COUPLE">Pareja / Anfitrión Directo</option>
                  <option value="HOST">Anfitrión Individual</option>
                  <option value="PLANNER">Wedding Planner / Agencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Colección / Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                >
                  <option value="ESENCIAL">Esencial (Q1,800)</option>
                  <option value="FIRMA">Firma (Q2,600)</option>
                  <option value="GRAN_CELEBRACION">Gran Celebración (Q3,500)</option>
                  <option value="PLANNER_PRO">Planner Pro (Q4,800)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Monto Cobrado (GTQ)</label>
                  <input
                    type="number"
                    value={paidAmountGTQ}
                    onChange={(e) => setPaidAmountGTQ(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Estado de Pago</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                  >
                    <option value="PAID">Pagado</option>
                    <option value="PENDING">Pendiente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 2: CONTROL DE SEGURIDAD & RESETEO DE ACCESOS                     */}
          {/* ========================================================================= */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <Key className="w-4 h-4 text-amber-600" />
                <span>2. Seguridad & Reseteo de Credenciales</span>
              </div>
              <span className="text-[11px] text-zinc-400">DynamoDB Auth Vault</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADBCC] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Código de Cuenta */}
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Código de Cuenta</span>
                    <span className="text-sm font-mono font-extrabold text-zinc-900">{accountCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(accountCode, 'account')}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                    title="Copiar código de cuenta"
                  >
                    {copiedAccount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* PIN Confidencial */}
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">PIN Actual</span>
                    <span className="text-sm font-mono font-extrabold text-amber-900 tracking-widest">{currentPin || 'Sin PIN'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentPin, 'pin')}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                    title="Copiar PIN"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Enlace Directo */}
              <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Enlace Mágico Directo</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={directAccessUrl}
                    className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-600 truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(directAccessUrl, 'url')}
                    className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    title="Copiar enlace directo"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={directAccessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    title="Abrir en nueva pestaña"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Botón Resetear PIN */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  disabled={isResettingPin}
                  onClick={handleResetPin}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResettingPin ? 'animate-spin text-amber-700' : 'text-amber-700'}`} />
                  <span>{isResettingPin ? 'Generando nuevo PIN...' : 'Resetear PIN y Generar Nuevo Acceso'}</span>
                </button>

                {newWaLink && (
                  <a
                    href={newWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Enviar nuevos accesos por WhatsApp</span>
                  </a>
                )}
              </div>

              {resetPinSuccessMsg && (
                <p className="text-[11px] font-semibold text-emerald-700 text-center">{resetPinSuccessMsg}</p>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 3: LÍMITES, CUOTAS & CICLO DE VIDA DEL EVENTO                    */}
          {/* ========================================================================= */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>3. Límites, Cuotas & Ciclo de Vida de la Celebración</span>
              </div>
              <span className="text-[11px] text-zinc-400">AWS DynamoDB & S3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Título de la Celebración</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ej. Boda Camila & Andrés"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Fecha de la Celebración</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Cupo Máximo de Invitados (Cuota)</label>
                <input
                  type="number"
                  value={maxGuestsLimit}
                  onChange={(e) => setMaxGuestsLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Almacenamiento S3 Asociado</label>
                <input
                  type="text"
                  readOnly
                  value="aurea-eventos-media-gt (Activo)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500 font-medium font-mono"
                />
              </div>
            </div>

            {/* Controles de Ciclo de Vida en 1 Clic */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-2">Estado del Ciclo de Vida Operativo</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSetLifecycleStatus('ACTIVE', 'LIVE', false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    tenantStatus === 'ACTIVE' && eventStatus === 'LIVE'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Activo / En Vivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetLifecycleStatus('SUSPENDED', 'DRAFT', false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    tenantStatus === 'SUSPENDED'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-amber-50 hover:text-amber-800'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Suspender</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetLifecycleStatus('ARCHIVED', 'ARCHIVED', true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    tenantStatus === 'ARCHIVED'
                      ? 'bg-zinc-800 text-white border-zinc-900 shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archivar</span>
                </button>
              </div>
            </div>

            {/* Zona de Peligro / Borrado de Prueba */}
            <div className="pt-4 border-t border-rose-100 bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Eliminar Cuenta y Celebración de Prueba</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Esta acción eliminará de forma permanente el tenant <strong className="font-mono">{accountCode}</strong> y sus eventos de DynamoDB. Para confirmar, escribe el código de cuenta debajo:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Escribe ${accountCode}`}
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-zinc-900"
                />
                <button
                  type="button"
                  disabled={isDeleting || deleteConfirmation.trim() !== accountCode.trim()}
                  onClick={handleDeleteTenant}
                  className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="pt-6 pb-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#DFC07D]" />
                  <span>Guardando en DynamoDB...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
