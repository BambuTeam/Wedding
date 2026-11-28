"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  RefreshCw,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2,
  Tv,
  Shield,
  KeyRound,
  Lock,
  MessageCircle,
  AlertCircle,
  LogOut,
  Sparkles,
  CheckCircle2,
  Music,
  Camera,
} from "lucide-react";
import { EventMeta, Guest, Table, EventDashboardStats, Tenant, LivePhoto } from "@/lib/types";
import { EventSelector } from "@/components/dashboard/EventSelector";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { GuestsTable } from "@/components/dashboard/GuestsTable";
import { SeatingChart } from "@/components/dashboard/SeatingChart";
import { CheckInScanner } from "@/components/dashboard/CheckInScanner";
import { MusicConfigModal } from "@/components/dashboard/MusicConfigModal";
import { InvitationCustomizer } from "@/components/dashboard/InvitationCustomizer";
import { LivePhotoModeration } from "@/components/dashboard/LivePhotoModeration";
import { MOCK_EVENTS, MOCK_GUESTS, MOCK_TABLES } from "@/lib/db/mock-data";

interface SessionState {
  valid: boolean;
  tenant: Tenant | null;
  events: EventMeta[];
  currentEvent: EventMeta | null;
  isRootAdmin: boolean;
  reason?: "NO_TENANT" | "NOT_FOUND" | "PENDING_RELEASE" | "SUSPENDED" | "ARCHIVED" | "INVALID_PIN" | "SERVER_ERROR";
  message?: string;
  tenantName?: string;
  phone?: string;
  celebrationType?: string;
}

export default function DashboardPage() {
  // Session & Tenant Auth State
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionState | null>(null);

  // Manual PIN login form state
  const [inputTenantId, setInputTenantId] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinFormError, setPinFormError] = useState<string | null>(null);

  // Event & Dashboard Data State
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [stats, setStats] = useState<EventDashboardStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [photos, setPhotos] = useState<LivePhoto[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"invitados" | "mesas" | "recepcion" | "album" | "personalizar">("invitados");
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);

  // ============================================================================
  // 1. VALIDACIÓN MULTI-TENANT CONTRA DYNAMODB (/api/tenant/session)
  // ============================================================================
  const verifyTenantSession = useCallback(async (tenantParam?: string, pinParam?: string, eventIdParam?: string) => {
    try {
      setSessionLoading(true);

      // 1. Resolver parámetros de URL o de localStorage
      let targetTenant = tenantParam;
      let targetPin = pinParam;
      let targetEventId = eventIdParam;

      if (typeof window !== "undefined") {
        const queryParams = new URLSearchParams(window.location.search);
        if (!targetTenant) targetTenant = queryParams.get("account") || queryParams.get("accountCode") || queryParams.get("code") || queryParams.get("tenant") || queryParams.get("tenantId") || undefined;
        if (!targetPin) targetPin = queryParams.get("pin") || undefined;
        if (!targetEventId) targetEventId = queryParams.get("eventId") || undefined;

        // Fallback a localStorage si no vienen en la URL
        if (!targetTenant) targetTenant = localStorage.getItem("aurea_tenant_account") || localStorage.getItem("aurea_tenant_id") || undefined;
        if (!targetPin) targetPin = localStorage.getItem("aurea_access_pin") || undefined;
      }

      const urlParams = new URLSearchParams();
      if (targetTenant) {
        urlParams.set("tenant", targetTenant);
        urlParams.set("account", targetTenant);
        urlParams.set("accountCode", targetTenant);
      }
      if (targetPin) urlParams.set("pin", targetPin);
      if (targetEventId) urlParams.set("eventId", targetEventId);

      const res = await fetch(`/api/tenant/session?${urlParams.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setSessionData({
          valid: false,
          tenant: null,
          events: [],
          currentEvent: null,
          isRootAdmin: false,
          reason: data.reason || "SERVER_ERROR",
          message: data.message || "No fue posible verificar las credenciales.",
          tenantName: data.tenantName,
          phone: data.phone,
          celebrationType: data.celebrationType,
        });

        if (targetTenant) setInputTenantId(targetTenant);
        setSessionLoading(false);
        return;
      }

      // Sesión Válida: Persistir credenciales para recargas futuras
      if (typeof window !== "undefined") {
        const storedCode = data.tenant?.accountCode || targetTenant;
        if (storedCode) {
          localStorage.setItem("aurea_tenant_account", storedCode);
          localStorage.setItem("aurea_tenant_id", data.tenant?.tenantId || storedCode);
        }
        if (targetPin) localStorage.setItem("aurea_access_pin", targetPin);
      }

      setSessionData(data);
      const chosenEvent = data.currentEvent || data.events[0];
      if (chosenEvent) {
        setSelectedEventId(chosenEvent.eventId);
        setEvent(chosenEvent);
      }
      setSessionLoading(false);
    } catch (err: any) {
      console.error("[verifyTenantSession] Error:", err);
      setSessionData({
        valid: false,
        tenant: null,
        events: [],
        currentEvent: null,
        isRootAdmin: false,
        reason: "SERVER_ERROR",
        message: "Error de conexión al validar credenciales.",
      });
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyTenantSession();
  }, [verifyTenantSession]);

  // Manejo de envío manual de PIN
  const handleManualPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinFormError(null);
    setIsVerifyingPin(true);

    try {
      await verifyTenantSession(inputTenantId.trim(), inputPin.trim());
    } catch (err: any) {
      setPinFormError(err.message || "Error al validar PIN");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Cerrar sesión de anfitrión
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aurea_tenant_account");
      localStorage.removeItem("aurea_tenant_id");
      localStorage.removeItem("aurea_access_pin");
      window.location.href = "/dashboard";
    }
  };

  // ============================================================================
  // 2. CARGA DE DATOS EXCLUSIVOS DE LA CELEBRACIÓN SELECCIONADA
  // ============================================================================
  const loadDashboardData = useCallback(async (isManual = false) => {
    if (!selectedEventId) return;
    if (isManual) setIsRefreshing(true);
    setLoadingData(true);

    let foundEvent: EventMeta | null = null;
    let foundStats: EventDashboardStats | null = null;
    let foundGuests: Guest[] = [];
    let foundTables: Table[] = [];

    // Preparar headers con credenciales de anfitrión para garantizar aislamiento multi-tenant
    const authHeaders: Record<string, string> = {};
    const tenantIdOrCode =
      sessionData?.tenant?.accountCode ||
      sessionData?.tenant?.tenantId ||
      (typeof window !== "undefined" ? localStorage.getItem("aurea_tenant_account") || localStorage.getItem("aurea_tenant_id") : null);
    const accessPin =
      sessionData?.tenant?.accessPin ||
      (typeof window !== "undefined" ? localStorage.getItem("aurea_access_pin") : null);

    if (tenantIdOrCode) authHeaders["x-tenant-id"] = tenantIdOrCode;
    if (accessPin) authHeaders["x-tenant-pin"] = accessPin;

    try {
      const [eventRes, guestsRes, tablesRes, photosRes] = await Promise.all([
        fetch(`/api/events/${selectedEventId}`, { headers: authHeaders }),
        fetch(`/api/events/${selectedEventId}/guests`, { headers: authHeaders }),
        fetch(`/api/events/${selectedEventId}/tables`, { headers: authHeaders }),
        fetch(`/api/public/events/${selectedEventId}/photos`, { cache: "no-store" }),
      ]);

      if (eventRes.status === 403) {
        const errorData = await eventRes.json();
        if (errorData?.allowedEventId && errorData.allowedEventId !== selectedEventId) {
          console.warn("[loadDashboardData] Intento de acceso cruzado detectado. Redirigiendo a evento propio:", errorData.allowedEventId);
          setSelectedEventId(errorData.allowedEventId);
          return;
        }
      }

      if (eventRes.ok) {
        const eventData = await eventRes.json();
        if (eventData?.event) foundEvent = eventData.event;
        if (eventData?.stats) foundStats = eventData.stats;
      }

      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        if (guestsData?.guests) foundGuests = guestsData.guests;
      }

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json();
        if (tablesData?.tables) foundTables = tablesData.tables;
      }

      if (photosRes.ok) {
        const photosData = await photosRes.json();
        if (Array.isArray(photosData?.photos)) {
          setPhotos(photosData.photos);
        }
      }
    } catch (err) {
      console.warn("[loadDashboardData] API fallback:", err);
    }

    // Si la API no devolvió el evento, usar el evento del tenant actual
    if (!foundEvent) {
      foundEvent = sessionData?.events.find((e) => e.eventId === selectedEventId) || sessionData?.currentEvent || null;
    }

    if (!foundStats && foundEvent) {
      const confirmed = foundGuests.reduce((acc, g) => acc + (g.confirmedSeats || 0), 0);
      const totalSeats = foundGuests.reduce((acc, g) => acc + (g.maxSeats || 1), 0);
      const openedCount = foundGuests.filter((g) => g.status === "OPENED" || g.status === "CONFIRMED").length;

      foundStats = {
        totalFamilies: foundGuests.length,
        totalSeatsAllocated: totalSeats,
        totalSeatsConfirmed: confirmed,
        totalSeatsDeclined: foundGuests.filter((g) => g.status === "DECLINED").length,
        totalGuestsPending: foundGuests.filter((g) => g.status === "UNOPENED" || g.status === "OPENED").length,
        openedInvitationsCount: openedCount,
        unopenedInvitationsCount: foundGuests.filter((g) => g.status === "UNOPENED").length,
        openRatePercentage: foundGuests.length > 0 ? Math.round((openedCount / foundGuests.length) * 100) : 0,
        totalCheckedInSeats: foundGuests.filter((g) => !!g.checkedInAt).length,
        dietaryRestrictionsCount: foundGuests.filter((g) => !!g.dietaryNotes).length,
        dietaryNotesList: foundGuests
          .filter((g) => !!g.dietaryNotes)
          .map((g) => ({ guestName: g.familyName, notes: g.dietaryNotes || "" })),
      };
    }

    if (foundEvent) setEvent(foundEvent);
    if (foundStats) setStats(foundStats);
    setGuests(foundGuests);
    setTables(foundTables);
    setLoadingData(false);
    setIsRefreshing(false);
  }, [selectedEventId, sessionData]);

  useEffect(() => {
    if (selectedEventId) {
      loadDashboardData();
    }
  }, [selectedEventId, loadDashboardData]);

  // Polling automático cada 6s cuando está activa la pestaña de moderación del álbum
  useEffect(() => {
    if (activeTab !== "album" || !selectedEventId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/events/${selectedEventId}/photos`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.photos)) {
            setPhotos(data.photos);
          }
        }
      } catch {
        // silent
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab, selectedEventId]);

  // Moderación: Eliminar foto en vivo de S3 y DynamoDB
  const handleDeletePhoto = async (photoId: string): Promise<boolean> => {
    if (!selectedEventId) return false;
    const authHeaders: Record<string, string> = {};
    const tenantIdOrCode =
      sessionData?.tenant?.accountCode ||
      sessionData?.tenant?.tenantId ||
      (typeof window !== "undefined" ? localStorage.getItem("aurea_tenant_account") || localStorage.getItem("aurea_tenant_id") : null);
    const accessPin =
      sessionData?.tenant?.accessPin ||
      (typeof window !== "undefined" ? localStorage.getItem("aurea_access_pin") : null);

    if (tenantIdOrCode) authHeaders["x-tenant-id"] = tenantIdOrCode;
    if (accessPin) authHeaders["x-tenant-pin"] = accessPin;

    try {
      const res = await fetch(`/api/events/${selectedEventId}/photos/${photoId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.photoId !== photoId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Moderación: Ocultar o mostrar foto del Modo TV Proyector
  const handleTogglePhotoVisibility = async (photoId: string, hiddenFromTv: boolean): Promise<boolean> => {
    if (!selectedEventId) return false;
    const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const tenantIdOrCode =
      sessionData?.tenant?.accountCode ||
      sessionData?.tenant?.tenantId ||
      (typeof window !== "undefined" ? localStorage.getItem("aurea_tenant_account") || localStorage.getItem("aurea_tenant_id") : null);
    const accessPin =
      sessionData?.tenant?.accessPin ||
      (typeof window !== "undefined" ? localStorage.getItem("aurea_access_pin") : null);

    if (tenantIdOrCode) authHeaders["x-tenant-id"] = tenantIdOrCode;
    if (accessPin) authHeaders["x-tenant-pin"] = accessPin;

    try {
      const res = await fetch(`/api/events/${selectedEventId}/photos/${photoId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ hiddenFromTv }),
      });
      if (res.ok) {
        setPhotos((prev) =>
          prev.map((p) => (p.photoId === photoId ? { ...p, hiddenFromTv } : p))
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // ============================================================================
  // 3. PANTALLAS DE ESTADO: CARGA, PENDIENTE, SUSPENDIDO O LOGIN PIN
  // ============================================================================

  // A. Cargando sesión
  if (sessionLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="text-sm font-semibold text-zinc-700 tracking-wide">
          Verificando credenciales de anfitrión en DynamoDB...
        </p>
      </div>
    );
  }

  // B. Cliente con activación pendiente (PENDING_RELEASE)
  if (sessionData && !sessionData.valid && sessionData.reason === "PENDING_RELEASE") {
    const waText = encodeURIComponent(
      `✨ *CONSULTA DE ACTIVACIÓN ÁUREA* ✨\n\n` +
      `Hola equipo Áurea, soy *${sessionData.tenantName || "Anfitrión"}*.\n` +
      `Registré mi solicitud para mi *${sessionData.celebrationType || "Celebración"}* y quisiera consultar sobre la activación de mi panel de anfitrión.\n\n` +
      `¡Muchas gracias! 🤍`
    );
    const waLink = `https://wa.me/50255551234?text=${waText}`;

    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 font-sans py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-amber-200/80 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
              Activación en Proceso
            </span>
            <h2 className="text-xl font-bold text-zinc-900 mt-2">
              {sessionData.tenantName || "Tu Espacio está casi Listo"}
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Tu solicitud para <strong className="text-zinc-800">{sessionData.celebrationType || "tu evento"}</strong> está siendo preparada y liberada por el equipo boutique de Áurea.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] text-xs text-zinc-600 text-left space-y-1.5">
            <div className="font-semibold text-zinc-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¿Qué sucederá a continuación?</span>
            </div>
            <p className="text-zinc-500">
              Recibirás un mensaje de WhatsApp con tu enlace mágico y tu PIN exclusivo de 6 dígitos para ingresar y armar tu lista de invitados.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Escribir por WhatsApp para Agilizar</span>
            </a>

            <button
              onClick={() => verifyTenantSession()}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors"
            >
              Volver a comprobar activación
            </button>
          </div>
        </div>
      </div>
    );
  }

  // C. Cliente suspendido o archivado
  if (sessionData && !sessionData.valid && (sessionData.reason === "SUSPENDED" || sessionData.reason === "ARCHIVED")) {
    const isArchived = sessionData.reason === "ARCHIVED";
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 font-sans py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-zinc-200 text-center space-y-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${isArchived ? "bg-zinc-100 text-zinc-600" : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900">
              {isArchived ? "Celebración Archivada" : "Acceso Pausado Temporalmente"}
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {sessionData.message || (isArchived
                ? "Esta celebración ha concluido y el panel de anfitrión se encuentra en modo archivo."
                : "El acceso a este espacio se encuentra en pausa. Comunícate con tu anfitrión o administrador para reactivarlo.")}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
          >
            Ingresar con otra cuenta o PIN
          </button>
        </div>
      </div>
    );
  }

  // D. Formulario de PIN si falta o es inválido
  if (!sessionData || !sessionData.valid) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 font-sans py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-zinc-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-[#DFC07D] flex items-center justify-center mx-auto shadow-md border border-[#C5A059]/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mt-2">
              Acceso a tu Panel de Anfitrión
            </h2>
            <p className="text-xs text-zinc-500">
              Ingresa el identificador de tu evento y tu PIN confidencial de 6 dígitos entregado por WhatsApp.
            </p>
          </div>

          {(pinFormError || sessionData?.reason === "INVALID_PIN") && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {pinFormError || sessionData?.message || "El PIN de 6 dígitos ingresado no es válido."}
              </span>
            </div>
          )}

          <form onSubmit={handleManualPinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                CORREO ELECTRÓNICO O CÓDIGO DE CUENTA
              </label>
              <input
                type="text"
                required
                value={inputTenantId}
                onChange={(e) => setInputTenantId(e.target.value)}
                placeholder="Ej. lucia@gmail.com o AUR-4829"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                PIN de Seguridad (6 dígitos)
              </label>
              <input
                type="password"
                maxLength={6}
                required
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="******"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-center text-lg font-mono tracking-widest font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingPin || inputPin.length < 4}
              className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifyingPin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#DFC07D]" />
                  <span>Verificando PIN...</span>
                </>
              ) : (
                <span>Ingresar a mi Celebración</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-100 text-center">
            <a
              href={`https://wa.me/50255551234?text=${encodeURIComponent(
                `Hola equipo Áurea, necesito restablecer el PIN de acceso para mi cuenta: ${inputTenantId.trim() || "[mi correo o código]"}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-500 hover:text-zinc-800 font-medium underline"
            >
              ¿Olvidaste tu PIN? Solicítalo por WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 4. SESIÓN AUTENTICADA: RENDERIZADO DEL DASHBOARD AISLADO
  // ============================================================================
  const isCoupleHost = sessionData.tenant?.role === "COUPLE" || sessionData.tenant?.role === "HOST";
  const canSwitchEvents = !isCoupleHost && (sessionData.isRootAdmin || sessionData.tenant?.role === "PLANNER");

  if (loadingData || !event || !stats) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="text-sm font-semibold text-zinc-700">
          Cargando tu celebración...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 space-y-8 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* AISLAMIENTO MULTI-TENANT:
              Si es COUPLE/HOST (como Lucía Méndez), oculta el dropdown y muestra SU celebración directamente.
              Solo muestra el dropdown si es PLANNER o ROOT SUPERADMIN. */}
          {canSwitchEvents && sessionData.events.length > 1 ? (
            <EventSelector
              currentEvent={event}
              allEvents={sessionData.events}
              onSelectEvent={(id) => {
                setSelectedEventId(id);
              }}
            />
          ) : (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#DFC9A6] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#F3EBDD] border border-[#DECDB3] flex items-center justify-center text-[#7A5C30] shrink-0">
                <Heart className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 block font-medium">
                  {event.category || sessionData.tenant?.celebrationType || "Celebración Activa"}
                </span>
                <span className="text-sm font-bold text-zinc-900 block leading-tight mt-0.5">
                  {event.title}
                </span>
                <span className="text-[12px] text-zinc-600 block mt-0.5">
                  {event.venueCity || event.eventDateFormatted || "Guatemala"}
                </span>
              </div>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-[12px] font-medium text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Actualizado en tiempo real</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-white border border-[#DFC9A6] text-zinc-700 hover:bg-[#FAF7F2] text-[13px] font-medium shadow-sm transition-all"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C5A059]" : ""}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={() => setIsMusicModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-white border border-[#DFC9A6] text-zinc-800 hover:bg-[#FAF7F2] text-[13px] font-medium shadow-sm transition-all"
            title="Personalizar música de la invitación (YouTube, Spotify o Melodía Áurea)"
          >
            <Music className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Banda Sonora</span>
            {event.musicConfig?.provider && event.musicConfig.provider !== "none" && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
          </button>

          <Link
            href={`/modo-tv?eventId=${event.eventId}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-white border border-[#DFC9A6] text-zinc-800 hover:bg-[#FAF7F2] text-[13px] font-medium shadow-sm transition-all"
            title="Abrir pantalla para proyector o TV de la fiesta en vivo"
          >
            <Tv className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Pantalla Proyector TV</span>
            <span className="sm:hidden">Modo TV</span>
          </Link>

          <Link
            href={`/invitacion/preview?eventId=${event.eventId}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-[#1E1C1A] text-white hover:bg-black text-[13px] font-medium shadow-sm transition-all"
          >
            <span>Vista previa de invitación</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#DFC07D]" />
          </Link>

          <button
            onClick={handleLogout}
            title="Cerrar sesión de anfitrión"
            className="p-2 rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <KpiCards stats={stats} />

      {/* Human Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 text-[13px] sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("invitados")}
          className={`px-5 py-2.5 rounded-2xl transition-all ${activeTab === "invitados"
              ? "bg-[#1E1C1A] text-white shadow-sm font-bold"
              : "text-zinc-600 hover:bg-[#FAF7F2]"
            }`}
        >
          ¿Quiénes nos acompañan? ({guests.length})
        </button>

        <button
          onClick={() => setActiveTab("mesas")}
          className={`px-5 py-2.5 rounded-2xl transition-all ${activeTab === "mesas"
              ? "bg-[#1E1C1A] text-white shadow-sm font-bold"
              : "text-zinc-600 hover:bg-[#FAF7F2]"
            }`}
        >
          Acomodo de mesas ({tables.length})
        </button>

        <button
          onClick={() => setActiveTab("recepcion")}
          className={`px-5 py-2.5 rounded-2xl transition-all ${activeTab === "recepcion"
              ? "bg-[#C5A059] text-zinc-950 font-bold shadow-sm"
              : "text-zinc-600 hover:bg-[#FAF7F2]"
            }`}
        >
          Bienvenida en recepción
        </button>

        <button
          onClick={() => setActiveTab("album")}
          className={`px-5 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${activeTab === "album"
              ? "bg-[#1E1C1A] text-white shadow-sm font-bold"
              : "text-zinc-600 hover:bg-[#FAF7F2]"
            }`}
        >
          <Camera className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Álbum en Vivo (Moderación) ({photos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("personalizar")}
          className={`px-5 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${activeTab === "personalizar"
              ? "bg-[#1E1C1A] text-white shadow-sm font-bold"
              : "text-[#8C6D46] hover:bg-[#FAF7F2] font-semibold"
            }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#DFC07D]" />
          <span>Personalizar Invitación</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "personalizar" && (
        <InvitationCustomizer
          event={event}
          onSaved={(updatedEvent) => setEvent(updatedEvent)}
        />
      )}
      {activeTab === "invitados" && (
        <GuestsTable
          guests={guests}
          event={event}
          tables={tables}
          onRefresh={() => loadDashboardData()}
        />
      )}

      {activeTab === "mesas" && (
        <SeatingChart
          tables={tables}
          guests={guests}
          eventId={event.eventId}
          onRefresh={() => loadDashboardData()}
        />
      )}

      {activeTab === "recepcion" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFC9A6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 text-[#7A5C30] flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Álbum en Vivo & Proyector TV</p>
                <p className="text-[11px] text-zinc-500">Hay {photos.length} fotografías compartidas por los invitados.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("album")}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E1C1A] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Moderar Fotos ({photos.length}) →
            </button>
          </div>

          <CheckInScanner
            guests={guests}
            event={event}
            tables={tables}
            onCheckInSuccess={() => loadDashboardData()}
          />
        </div>
      )}

      {activeTab === "album" && (
        <LivePhotoModeration
          photos={photos}
          loading={loadingData}
          isRefreshing={isRefreshing}
          eventId={event.eventId}
          onRefresh={() => loadDashboardData(true)}
          onDeletePhoto={handleDeletePhoto}
          onToggleVisibility={handleTogglePhotoVisibility}
        />
      )}

      {/* Modal de Banda Sonora de la Invitación */}
      {isMusicModalOpen && (
        <MusicConfigModal
          isOpen={isMusicModalOpen}
          onClose={() => setIsMusicModalOpen(false)}
          eventId={event.eventId}
          currentConfig={event.musicConfig}
          onSaved={(newCfg) => {
            setEvent({ ...event, musicConfig: newCfg });
          }}
        />
      )}
    </div>
  );
}
