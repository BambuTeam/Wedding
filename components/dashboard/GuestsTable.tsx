"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  UserPlus,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  Check,
  DoorOpen,
  Heart,
} from "lucide-react";
import { Guest, EventMeta, Table } from "@/lib/types";
import { buildWhatsAppInviteUrl, buildWhatsAppReminderUrl } from "@/lib/utils";

interface GuestsTableProps {
  guests: Guest[];
  event: EventMeta;
  tables: Table[];
  onRefresh: () => void;
}

export function GuestsTable({ guests, event, tables, onRefresh }: GuestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // New Guest Form State
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newMaxSeats, setNewMaxSeats] = useState(2);
  const [isSaving, setIsSaving] = useState(false);

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.primaryContactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.guestToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.phone && g.phone.includes(searchTerm));

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    return g.status === statusFilter;
  });

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/events/${event.eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyName: newFamilyName,
          primaryContactName: newContactName || newFamilyName,
          phone: newPhone,
          maxSeats: Number(newMaxSeats) || 2,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewFamilyName("");
        setNewContactName("");
        setNewPhone("");
        setNewMaxSeats(2);
        onRefresh();
      }
    } catch (err) {
      console.error("Error creating guest:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyGuestLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/invitacion/${token}?eventId=${event.eventId}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const getTableName = (tableId?: string) => {
    if (!tableId) return null;
    const t = tables.find((item) => item.tableId === tableId);
    return t ? t.name : null;
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-[#E8DFC8]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
            ¿Quiénes nos acompañan?
          </h3>
          <p className="text-[13px] text-zinc-600 mt-0.5 font-sans">
            Tus familias queridas, sobres entregados por WhatsApp y sus confirmaciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por familia o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-[#DFC9A6] text-[13px] text-zinc-900 font-sans focus:outline-none focus:border-[#C5A059] w-48 sm:w-64 bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-xl text-[13px] font-sans">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "ALL" ? "bg-white text-zinc-900 shadow-sm font-semibold" : "text-zinc-600"
              }`}
            >
              Todos ({guests.length})
            </button>
            <button
              onClick={() => setStatusFilter("UNOPENED")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "UNOPENED" ? "bg-white text-zinc-900 shadow-sm font-semibold" : "text-zinc-600"
              }`}
            >
              Sin abrir
            </button>
            <button
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "CONFIRMED" ? "bg-white text-emerald-800 shadow-sm font-semibold" : "text-zinc-600"
              }`}
            >
              Confirmados
            </button>
          </div>

          {/* Add Guest Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#B88E3E] text-zinc-950 text-[13px] font-semibold font-sans tracking-normal transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invitar Familia</span>
          </button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] text-zinc-800 font-sans">
          <thead className="bg-[#FAF7F2] border-b border-[#E8DFC8] text-zinc-700 font-sans font-semibold text-[13px] tracking-normal">
            <tr>
              <th className="py-3.5 px-4">Familia o Pareja</th>
              <th className="py-3.5 px-4">Lugares</th>
              <th className="py-3.5 px-4">Respuesta</th>
              <th className="py-3.5 px-4">Apertura / Mensaje</th>
              <th className="py-3.5 px-4">Mesa</th>
              <th className="py-3.5 px-4">Recepción</th>
              <th className="py-3.5 px-4 text-right">Compartir por WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-sans">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500 font-sans text-sm">
                  No se encontraron familias con ese nombre.
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => {
                const tableName = getTableName(guest.tableId);
                const appUrl = typeof window !== "undefined" ? window.location.origin : "";
                const inviteUrl = `${appUrl}/invitacion/${guest.guestToken}?eventId=${event.eventId}`;

                const waInviteUrl = buildWhatsAppInviteUrl({
                  phone: guest.phone,
                  guestName: guest.familyName,
                  maxSeats: guest.maxSeats,
                  inviteUrl,
                  coupleNames: event.title,
                });

                const waReminderUrl = buildWhatsAppReminderUrl({
                  phone: guest.phone,
                  guestName: guest.familyName,
                  inviteUrl,
                  coupleNames: event.title,
                });

                return (
                  <tr key={guest.guestToken} className="hover:bg-[#FAF7F2]/80 transition-colors">
                    {/* Family Name */}
                    <td className="py-3 px-4">
                      <div className="font-sans font-semibold text-zinc-900 text-sm">
                        {guest.familyName}
                      </div>
                      <div className="text-[12px] text-zinc-600 font-sans mt-0.5">
                        {guest.primaryContactName || "Sin titular"} • {guest.phone || "Sin teléfono"}
                      </div>
                    </td>

                    {/* Seats */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-sans">
                        <span className="font-semibold text-zinc-900 text-[13px]">
                          {guest.status === "CONFIRMED" ? guest.confirmedSeats : guest.maxSeats}
                        </span>
                        <span className="text-zinc-500 text-[12px]">
                          / {guest.maxSeats}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {guest.status === "CONFIRMED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-sans font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmado
                        </span>
                      )}
                      {guest.status === "OPENED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-sans font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          <Eye className="w-3 h-3 text-amber-700" />
                          Sobre Abierto
                        </span>
                      )}
                      {guest.status === "UNOPENED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-sans font-medium text-zinc-700 bg-zinc-200">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          Por abrir
                        </span>
                      )}
                      {guest.status === "DECLINED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-sans font-medium text-zinc-700 bg-zinc-200">
                          <XCircle className="w-3 h-3 text-zinc-500" />
                          No asistirá
                        </span>
                      )}
                    </td>

                    {/* Timestamps & Message */}
                    <td className="py-3 px-4 text-[13px] text-zinc-700 font-sans">
                      {guest.guestMessage ? (
                        <div className="max-w-[200px] truncate text-zinc-800 font-medium" title={guest.guestMessage}>
                          &ldquo;{guest.guestMessage}&rdquo;
                        </div>
                      ) : guest.openedAt ? (
                        <div className="text-[12px] text-zinc-600 font-sans">
                          Abierto: {new Date(guest.openedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[13px]">Pendiente</span>
                      )}
                    </td>

                    {/* Table */}
                    <td className="py-3 px-4">
                      {tableName ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#F3EBDD] text-[#7A5C30] border border-[#DFC9A6] font-sans font-semibold text-[13px]">
                          {tableName}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[13px] font-sans">Por asignar</span>
                      )}
                    </td>

                    {/* CheckIn */}
                    <td className="py-3 px-4">
                      {guest.checkedInAt ? (
                        <div className="text-emerald-800 font-semibold text-[13px] flex items-center gap-1 font-sans">
                          <DoorOpen className="w-3.5 h-3.5" />
                          <span>¡En la fiesta!</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[13px] font-sans">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Invite / Reminder */}
                        <a
                          href={guest.status === "UNOPENED" ? waInviteUrl : waReminderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                          title={guest.status === "UNOPENED" ? "Enviar invitación por WhatsApp" : "Enviar recordatorio cariñoso"}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Copy Link */}
                        <button
                          onClick={() => copyGuestLink(guest.guestToken)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFEA] text-carbon-700 border border-[#E8DFC8] transition-colors cursor-pointer"
                          title="Copiar enlace de su carta"
                        >
                          {copiedToken === guest.guestToken ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Open as guest */}
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFEA] text-carbon-700 border border-[#E8DFC8] transition-colors"
                          title="Ver cómo ve su carta este invitado"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil Apilada (< 768px) para Uso Cómodo con el Pulgar */}
      <div className="md:hidden divide-y divide-zinc-200">
        {filteredGuests.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 font-sans text-sm">
            No se encontraron familias con ese nombre.
          </div>
        ) : (
          filteredGuests.map((guest) => {
            const tableName = getTableName(guest.tableId);
            const appUrl = typeof window !== "undefined" ? window.location.origin : "";
            const inviteUrl = `${appUrl}/invitacion/${guest.guestToken}?eventId=${event.eventId}`;

            const waInviteUrl = buildWhatsAppInviteUrl({
              phone: guest.phone,
              guestName: guest.familyName,
              maxSeats: guest.maxSeats,
              inviteUrl,
              coupleNames: event.title,
            });

            const waReminderUrl = buildWhatsAppReminderUrl({
              phone: guest.phone,
              guestName: guest.familyName,
              inviteUrl,
              coupleNames: event.title,
            });

            return (
              <div key={guest.guestToken} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-sans font-bold text-zinc-900 text-base">
                      {guest.familyName}
                    </h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {guest.primaryContactName || "Sin titular"} · {guest.phone || "Sin teléfono"}
                    </p>
                  </div>

                  <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#DFC9A6] text-[#7A5C30]">
                    {guest.status === "CONFIRMED" ? `${guest.confirmedSeats} / ${guest.maxSeats}` : `${guest.maxSeats} cupos`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {guest.status === "CONFIRMED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Confirmado
                    </span>
                  )}
                  {guest.status === "OPENED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      Sobre Abierto
                    </span>
                  )}
                  {guest.status === "UNOPENED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-700 bg-zinc-200">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      Por abrir
                    </span>
                  )}
                  {guest.status === "DECLINED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-700 bg-zinc-200">
                      <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                      No asistirá
                    </span>
                  )}

                  {tableName && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#F3EBDD] text-[#7A5C30] border border-[#DFC9A6] font-semibold text-xs">
                      {tableName}
                    </span>
                  )}

                  {guest.checkedInAt && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      <DoorOpen className="w-3.5 h-3.5" />
                      En la fiesta
                    </span>
                  )}
                </div>

                {guest.guestMessage && (
                  <p className="text-xs text-zinc-700 italic bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DFC9A6]/50">
                    &ldquo;{guest.guestMessage}&rdquo;
                  </p>
                )}

                {/* Acciones Táctiles Cómodas (min-h-[44px]) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={guest.status === "UNOPENED" ? waInviteUrl : waReminderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => copyGuestLink(guest.guestToken)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFEA] text-zinc-800 border border-[#E8DFC8] text-xs font-semibold transition-colors"
                  >
                    {copiedToken === guest.guestToken ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-600" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>

                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFEA] text-zinc-800 border border-[#E8DFC8] text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-zinc-600" />
                    <span>Ver Carta</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Guest Modal */}
      {isAddModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-[#FAF7F2] p-6 sm:p-8 shadow-2xl border border-[#DFC9A6]">
            <h3 className="font-serif text-2xl text-zinc-900 font-normal mb-1">
              Invitar a una Nueva Familia
            </h3>
            <p className="text-[13px] text-zinc-600 mb-5 font-sans">
              Se creará su carta personalizada con sobre digital lista para enviar por WhatsApp.
            </p>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div>
                <label className="block text-[13px] font-sans font-medium text-zinc-800 mb-1">
                  Nombre de la familia o invitados *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Familia Sandoval Duarte"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-sm text-zinc-900 bg-white font-sans focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-sans font-medium text-zinc-800 mb-1">
                  Nombre del titular de contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Fernando Sandoval"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-sm text-zinc-900 bg-white font-sans focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-sans font-medium text-zinc-800 mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+502..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-sm text-zinc-900 bg-white font-sans focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-sans font-medium text-zinc-800 mb-1">
                    Lugares reservados *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={newMaxSeats}
                    onChange={(e) => setNewMaxSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-sm text-zinc-900 bg-white font-sans focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#E8DFC8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DFC9A6] text-zinc-700 text-[13px] font-sans font-medium hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#B88E3E] text-zinc-950 text-[13px] font-semibold font-sans tracking-normal shadow-sm cursor-pointer"
                >
                  {isSaving ? "Guardando..." : "Crear Sobre"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
