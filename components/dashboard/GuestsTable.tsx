"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  UserPlus,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  QrCode,
  Sparkles,
  Check,
  DoorOpen,
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
    const url = `${origin}/invitacion/${token}`;
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
    <div className="rounded-3xl bg-white border border-carbon-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-carbon-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-carbon-900 font-semibold">
            Lista Maestra de Invitados &amp; Familias
          </h3>
          <p className="text-xs text-carbon-500 mt-0.5">
            Seguimiento de entregas por WhatsApp, aperturas silenciosas y confirmaciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-carbon-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por familia o titular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-carbon-300 text-xs text-carbon-900 focus:outline-none focus:border-champagne-500 w-48 sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-carbon-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "ALL" ? "bg-white text-carbon-900 shadow-sm" : "text-carbon-600"
              }`}
            >
              Todos ({guests.length})
            </button>
            <button
              onClick={() => setStatusFilter("UNOPENED")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "UNOPENED" ? "bg-white text-carbon-900 shadow-sm" : "text-carbon-600"
              }`}
            >
              Sin abrir
            </button>
            <button
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "CONFIRMED" ? "bg-white text-emerald-800 shadow-sm" : "text-carbon-600"
              }`}
            >
              Confirmados
            </button>
          </div>

          {/* Add Guest Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-champagne-500 hover:bg-champagne-600 text-carbon-950 text-xs font-bold transition-all shadow-gold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nueva Familia</span>
          </button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-carbon-700">
          <thead className="bg-alabaster-100 border-b border-carbon-200 text-carbon-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Familia / Titular</th>
              <th className="py-3 px-4">Pases</th>
              <th className="py-3 px-4">Estado Invitación</th>
              <th className="py-3 px-4">Apertura / RSVP</th>
              <th className="py-3 px-4">Mesa Asignada</th>
              <th className="py-3 px-4">Check-in Puerta</th>
              <th className="py-3 px-4 text-right">Acciones WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-100">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-carbon-400">
                  No se encontraron invitados con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => {
                const tableName = getTableName(guest.tableId);
                const appUrl = typeof window !== "undefined" ? window.location.origin : "";
                const inviteUrl = `${appUrl}/invitacion/${guest.guestToken}`;

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
                  <tr key={guest.guestToken} className="hover:bg-alabaster-50/80 transition-colors">
                    {/* Family Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-carbon-900 text-sm">
                        {guest.familyName}
                      </div>
                      <div className="text-[11px] text-carbon-400 font-mono">
                        {guest.guestToken} • {guest.phone || "Sin teléfono"}
                      </div>
                    </td>

                    {/* Seats */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="font-bold text-carbon-900">
                          {guest.status === "CONFIRMED" ? guest.confirmedSeats : guest.maxSeats}
                        </span>
                        <span className="text-carbon-400 text-[10px]">
                          / {guest.maxSeats} máx
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {guest.status === "CONFIRMED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmado
                        </span>
                      )}
                      {guest.status === "OPENED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                          <Eye className="w-3 h-3 text-blue-600" />
                          Abierto (Pendiente)
                        </span>
                      )}
                      {guest.status === "UNOPENED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Sin Abrir
                        </span>
                      )}
                      {guest.status === "DECLINED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-carbon-200 text-carbon-700">
                          <XCircle className="w-3 h-3 text-carbon-500" />
                          Rechazado
                        </span>
                      )}
                    </td>

                    {/* Timestamps */}
                    <td className="py-3 px-4 text-[11px] text-carbon-500">
                      {guest.confirmedAt ? (
                        <div>
                          <span className="font-semibold text-carbon-700">RSVP: </span>
                          {new Date(guest.confirmedAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      ) : guest.openedAt ? (
                        <div>
                          <span className="text-blue-700 font-medium">Abrió: </span>
                          {new Date(guest.openedAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      ) : (
                        <span className="text-carbon-400 italic">No ha ingresado</span>
                      )}
                    </td>

                    {/* Table */}
                    <td className="py-3 px-4">
                      {tableName ? (
                        <span className="px-2 py-0.5 rounded-lg bg-champagne-100 text-champagne-900 border border-champagne-300 font-semibold text-[11px]">
                          {tableName}
                        </span>
                      ) : (
                        <span className="text-carbon-400 text-[11px] italic">Sin asignar</span>
                      )}
                    </td>

                    {/* CheckIn */}
                    <td className="py-3 px-4">
                      {guest.checkedInAt ? (
                        <div className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          <DoorOpen className="w-3.5 h-3.5" />
                          <span>{new Date(guest.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      ) : (
                        <span className="text-carbon-300 text-[11px]">Fuera</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Invite / Reminder Button */}
                        <a
                          href={guest.status === "UNOPENED" ? waInviteUrl : waReminderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title={guest.status === "UNOPENED" ? "Enviar invitación por WhatsApp" : "Enviar recordatorio"}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        {/* Copy Link */}
                        <button
                          onClick={() => copyGuestLink(guest.guestToken)}
                          className="p-1.5 rounded-lg bg-carbon-100 hover:bg-carbon-200 text-carbon-700 transition-colors"
                          title="Copiar enlace de invitación"
                        >
                          {copiedToken === guest.guestToken ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open in new tab */}
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-carbon-100 hover:bg-carbon-200 text-carbon-700 transition-colors"
                          title="Abrir como invitado"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-950/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-champagne-300">
            <h3 className="font-serif italic text-2xl text-carbon-900 font-semibold mb-1">
              Agregar Nueva Familia o Invitado
            </h3>
            <p className="text-xs text-carbon-500 mb-5">
              Se generará un enlace tokenizado de alta seguridad listo para WhatsApp.
            </p>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-carbon-600 mb-1">
                  Nombre de la Familia o Invitado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Familia Sandoval Duarte"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-carbon-300 text-xs text-carbon-900 focus:outline-none focus:border-champagne-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-carbon-600 mb-1">
                  Nombre del Titular de Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lic. Fernando Sandoval"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-carbon-300 text-xs text-carbon-900 focus:outline-none focus:border-champagne-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-carbon-600 mb-1">
                    Teléfono WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+502..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-carbon-300 text-xs text-carbon-900 focus:outline-none focus:border-champagne-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-carbon-600 mb-1">
                    Lugares Asignados *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={newMaxSeats}
                    onChange={(e) => setNewMaxSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-carbon-300 text-xs text-carbon-900 focus:outline-none focus:border-champagne-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-carbon-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-100 hover:bg-carbon-200 text-carbon-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-champagne-500 hover:bg-champagne-600 text-carbon-950 text-xs font-bold shadow-gold"
                >
                  {isSaving ? "Guardando..." : "Crear Invitado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
