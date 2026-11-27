'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Loader2,
  Users,
  Calendar,
  Building2,
  Check,
  CheckCircle2,
  Layers,
  Palette,
  Clock,
  MapPin,
  ShieldCheck,
  Banknote,
  Box,
} from 'lucide-react';
import {
  Tenant,
  TenantRole,
  PlanType,
  PaymentStatus,
  EventCategoryKey,
  ThemePresetKey,
} from '@/lib/types';
import {
  FESTIVITY_PRESETS,
  THEME_PRESETS,
  PLAN_CONFIGS,
  FestivityPreset,
  ThemePresetConfig,
} from '@/lib/eventPresets';

export interface CreateClientWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: Tenant | null;
}

export function CreateClientWizardDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateClientWizardProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bloque 1: Festividad y Plantilla Editorial
  const [selectedFestivity, setSelectedFestivity] = useState<EventCategoryKey>('BODA');
  const [selectedTheme, setSelectedTheme] = useState<ThemePresetKey>('ATELIER_MARFIL');

  // Bloque 2: Datos del Anfitrión & Celebración
  const [role, setRole] = useState<TenantRole>('COUPLE');
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+502 ');
  const [title, setTitle] = useState('');
  const [titleModifiedManually, setTitleModifiedManually] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('16:30');
  const [venueCity, setVenueCity] = useState('Antigua Guatemala, Sacatepéquez');

  // Bloque 3: Plan, Cupo & Cobro
  const [plan, setPlan] = useState<PlanType>('FIRMA');
  const [maxGuests, setMaxGuests] = useState('200');
  const [amountPaid, setAmountPaid] = useState('2400');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-llenar datos si viene de la bandeja de liberación o edición
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '+502 ');
      setRole(initialData.role || 'COUPLE');
      if (initialData.agencyName) setAgencyName(initialData.agencyName);
      if (initialData.plan) {
        setPlan(initialData.plan);
        const planConf = PLAN_CONFIGS[initialData.plan];
        if (planConf) {
          setMaxGuests(String(initialData.maxGuestsPerEvent || planConf.guestsLimit));
          setAmountPaid(String(initialData.paidAmountGTQ || initialData.amountPaid || planConf.priceGTQ));
        }
      }
      if (initialData.estimatedDate) setEventDate(initialData.estimatedDate);
      if (initialData.paymentStatus) setPaymentStatus(initialData.paymentStatus);
      if (initialData.notes) setNotes(initialData.notes);

      // Detectar festividad
      const typeStr = (initialData.celebrationType || '').toUpperCase();
      if (typeStr.includes('XV')) setSelectedFestivity('XV_ANOS');
      else if (typeStr.includes('BAUTIZ') || typeStr.includes('COMUN')) setSelectedFestivity('BAUTIZO');
      else if (typeStr.includes('CUMPLE') || typeStr.includes('ANIV')) setSelectedFestivity('CUMPLES');
      else if (typeStr.includes('CORP') || typeStr.includes('GALA')) setSelectedFestivity('CORPORATIVO');
      else setSelectedFestivity('BODA');

      setTitle(`${initialData.celebrationType || 'Celebración'} · ${initialData.name}`);
      setTitleModifiedManually(true);
    } else {
      // Defaults limpios para cliente nuevo
      setName('');
      setAgencyName('');
      setEmail('');
      setPhone('+502 ');
      setRole('COUPLE');
      setSelectedFestivity('BODA');
      setSelectedTheme('ATELIER_MARFIL');
      setPlan('FIRMA');
      setMaxGuests('200');
      setAmountPaid('2400');
      setPaymentStatus('PAID');
      setEventDate('');
      setStartTime('16:30');
      setVenueCity('Antigua Guatemala, Sacatepéquez');
      setTitle('');
      setTitleModifiedManually(false);
      setNotes('');
      setErrorMsg(null);
    }
  }, [initialData, isOpen]);

  // Autocompletado inteligente del título de celebración
  useEffect(() => {
    if (!titleModifiedManually) {
      const preset = FESTIVITY_PRESETS[selectedFestivity];
      const clientName = (name || '').trim();
      if (clientName) {
        if (selectedFestivity === 'BODA') {
          setTitle(`Boda · ${clientName}`);
        } else if (selectedFestivity === 'XV_ANOS') {
          setTitle(`Mis XV Años · ${clientName}`);
        } else if (selectedFestivity === 'BAUTIZO') {
          setTitle(`Bautizo de ${clientName}`);
        } else if (selectedFestivity === 'CUMPLES') {
          setTitle(`Cumpleaños de ${clientName}`);
        } else {
          setTitle(`Gala Anual · ${clientName}`);
        }
      } else {
        setTitle(preset.defaultTitle);
      }
    }
  }, [name, selectedFestivity, titleModifiedManually]);

  // Al cambiar festividad, actualizar hora sugerida si no se ha tocado
  const handleSelectFestivity = (fest: EventCategoryKey) => {
    setSelectedFestivity(fest);
    const preset = FESTIVITY_PRESETS[fest];
    if (preset.itinerary[0]?.time) {
      setStartTime(preset.itinerary[0].time);
    }
  };

  // Al cambiar plan, actualizar cupo y tarifa sugerida
  const handleSelectPlan = (selectedPlan: PlanType) => {
    setPlan(selectedPlan);
    const planConf = PLAN_CONFIGS[selectedPlan];
    if (planConf) {
      setMaxGuests(String(planConf.guestsLimit));
      setAmountPaid(String(planConf.priceGTQ));
    }
    if (selectedPlan === 'PLANNER_PRO') {
      setRole('PLANNER');
    }
  };

  const handleRoleToggle = (newRole: TenantRole) => {
    setRole(newRole);
    if (newRole === 'PLANNER') {
      handleSelectPlan('PLANNER_PRO');
    } else {
      if (plan === 'PLANNER_PRO') {
        handleSelectPlan('FIRMA');
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clientName = (role === 'PLANNER' && agencyName ? `${name} (${agencyName})` : name).trim();
    if (!clientName) {
      setErrorMsg('Por favor ingresa el nombre del anfitrión o agencia.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      setErrorMsg('Por favor ingresa un número de teléfono / WhatsApp válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const festPreset = FESTIVITY_PRESETS[selectedFestivity];
      const payload: any = {
        tenantId: initialData?.tenantId,
        action: initialData?.tenantId ? 'release' : undefined,
        name: clientName,
        hostName: clientName,
        agencyName: role === 'PLANNER' ? agencyName : undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        celebrationType: festPreset.label,
        eventType: selectedFestivity,
        themePreset: selectedTheme,
        title: title || `${festPreset.category} · ${clientName}`,
        eventDate: eventDate || undefined,
        estimatedDate: eventDate || undefined,
        startTime,
        venueCity,
        plan,
        maxGuestsPerEvent: Number(maxGuests) || 200,
        amountPaid: Number(amountPaid) || 2400,
        paidAmountGTQ: Number(amountPaid) || 2400,
        currency: 'GTQ',
        paymentStatus,
        notes,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la creación del cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const currentFest = FESTIVITY_PRESETS[selectedFestivity];
  const currentTheme = THEME_PRESETS[selectedTheme];

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-3 sm:p-6 flex items-center justify-center bg-[#141311]/80 backdrop-blur-md overflow-y-auto font-sans antialiased">
      {/* Contenedor Principal del Wizard */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-zinc-200/90 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera Editorial */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DFC07D] to-[#9E7A38] text-zinc-950 flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  {initialData ? 'Liberar & Activar Cliente' : 'Nuevo Cliente & Celebración'}
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-[#DFC07D] border border-[#DFC07D]/30 font-bold">
                  Onboarding Ejecutivo
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configuración integral: festividad, paleta editorial, ornamentos 3D y credenciales en 3 pasos rápidos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario Scannable (3 Bloques) */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-7">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* BLOQUE 1: Festividad & Plantilla Editorial */}
          {/* ======================================================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px]">
                  1
                </span>
                <span>Festividad & Plantilla Editorial</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                Auto-configura 3D Slots & Itinerario Base
              </span>
            </div>

            {/* Tarjetas de Festividad */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(Object.keys(FESTIVITY_PRESETS) as EventCategoryKey[]).map((key) => {
                const fest = FESTIVITY_PRESETS[key];
                const isSelected = selectedFestivity === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectFestivity(key)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between min-h-[92px] ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-md ring-2 ring-zinc-950/20'
                        : 'border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="text-xl mb-1">{fest.iconTag}</div>
                      <div className="font-bold text-xs leading-tight">{fest.label}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-200/20 text-[10px] opacity-80 flex items-center gap-1 font-mono">
                      <Box className="w-3 h-3 shrink-0" />
                      <span className="truncate">4 slots .glb</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#DFC07D] text-zinc-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ornamentos 3D Pre-cargados (Visual Badge) */}
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#8A6D1C] shrink-0" />
                <span className="font-semibold text-zinc-700">Ornamentos 3D asignados para {currentFest.label}:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentFest.sample3dNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-zinc-700 border border-zinc-200 shadow-2xs whitespace-nowrap"
                  >
                    ✨ {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Variantes de Plantilla Editorial (Atmósfera Cromática) */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-500" />
                <span>Atmósfera Cromática & Estilo de Invitación:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(THEME_PRESETS) as ThemePresetKey[]).map((themeKey) => {
                  const theme = THEME_PRESETS[themeKey];
                  const isSelected = selectedTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => setSelectedTheme(themeKey)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-zinc-950 bg-white ring-2 ring-zinc-950 shadow-sm'
                          : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-zinc-900">{theme.name}</span>
                        {/* Mini paleta de círculos cromáticos */}
                        <div className="flex items-center -space-x-1">
                          {theme.paletteColors.slice(0, 4).map((c, i) => (
                            <span
                              key={i}
                              style={{ backgroundColor: c }}
                              className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-tight">{theme.subtitle}</p>

                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* BLOQUE 2: Datos del Anfitrión & Celebración */}
          {/* ======================================================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px]">
                  2
                </span>
                <span>Datos del Anfitrión & Celebración</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                Autocompletado Inteligente
              </span>
            </div>

            {/* Selector de Rol: Anfitrión vs Agencia */}
            <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-2xl max-w-md">
              <button
                type="button"
                onClick={() => handleRoleToggle('COUPLE')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  role !== 'PLANNER'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Pareja / Familia (Anfitrión Único)
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle('PLANNER')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  role === 'PLANNER'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Wedding Planner / Agencia
              </button>
            </div>

            {/* Inputs de Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">
                  {role === 'PLANNER' ? 'Nombre del Planner / Contacto *' : 'Nombre de Anfitriones *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'PLANNER' ? 'Ej. Sofía Mendoza' : 'Ej. Camila & Andrés'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>

              {role === 'PLANNER' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-900">
                    Nombre de la Agencia / Atelier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Atelier Bodas Antigua"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 bg-purple-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900 font-medium text-purple-950"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">WhatsApp / Teléfono *</label>
                <input
                  type="text"
                  required
                  placeholder="+502 5555 1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>
            </div>

            {/* Inputs de Celebración */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-zinc-700">
                  Título de la Celebración (Invitación) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleModifiedManually(true);
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-bold text-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Fecha del Evento</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Hora de Inicio</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold text-zinc-700">Sede o Ciudad (Guatemala)</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    placeholder="Ej. Antigua Guatemala, Sacatepéquez o Zona 10, Ciudad de Guatemala"
                    className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* BLOQUE 3: Plan Contratado, Cupo & Cobro */}
          {/* ======================================================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px]">
                  3
                </span>
                <span>Plan Contratado, Cupo & Cobro</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">Tarifas Oficiales GTQ</span>
            </div>

            {/* Tarjetas de Plan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(PLAN_CONFIGS) as PlanType[]).map((planKey) => {
                const planConf = PLAN_CONFIGS[planKey];
                const isSelected = plan === planKey;
                return (
                  <button
                    key={planKey}
                    type="button"
                    onClick={() => handleSelectPlan(planKey)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm ring-2 ring-zinc-950/20'
                        : 'border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{planConf.name}</div>
                    <div className="font-mono text-xs font-extrabold text-[#DFC07D] mt-0.5">
                      Q {planConf.priceGTQ.toLocaleString()}
                    </div>
                    <div className="text-[10px] opacity-75 mt-1 leading-tight">
                      {planConf.description}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#DFC07D] text-zinc-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ajustes de Cupo, Tarifa y Cobro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Cupo Máx. Invitados</label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Monto Cobrado (GTQ)</label>
                <div className="relative">
                  <Banknote className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-mono font-bold text-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Estado del Cobro</label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('PAID')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      paymentStatus === 'PAID'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300'
                    }`}
                  >
                    ✓ Pagado
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('PARTIAL')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      paymentStatus !== 'PAID'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300'
                    }`}
                  >
                    ⏳ Por Cobrar
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Ejecutivo con Resumen Vivo */}
          <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-600 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900">{currentFest.label}</span>
                <span>•</span>
                <span className="font-mono font-bold text-amber-800">Plan {plan} (Q {Number(amountPaid).toLocaleString()})</span>
                <span>•</span>
                <span>{maxGuests} cupos</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Atmósfera: <strong className="text-zinc-700">{currentTheme.name}</strong> · 4 slots 3D activos
              </p>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#DFC07D]" />
                    <span>Guardando en DynamoDB & S3...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#DFC07D]" />
                    <span>Crear, Liberar y Generar Accesos →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
