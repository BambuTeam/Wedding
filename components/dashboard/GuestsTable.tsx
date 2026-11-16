"use client";

import React, { useState } from "react";
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
    <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-[#E8DFC8]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-carbon-900 font-bold">
            ¿Quiénes nos acompañan?
          </h3>
          <p className="text-xs text-carbon-500 mt-0.5 font-sans">
            Tus familias queridas, sobres entregados por WhatsApp y sus confirmaciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-carbon-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por familia o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-[#DFC9A6] text-xs text-carbon-900 focus:outline-none focus:border-[#C5A059] w-48 sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-xl text-xs font-serif italic">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "ALL" ? "bg-white text-carbon-900 shadow-sm font-bold" : "text-carbon-600"
              }`}
            >
              Todos ({guests.length})
            </button>
            <button
              onClick={() => setStatusFilter("UNOPENED")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "UNOPENED" ? "bg-white text-carbon-900 shadow-sm font-bold" : "text-carbon-600"
              }`}
            >
              Sin abrir
            </button>
            <button
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "CONFIRMED" ? "bg-white text-emerald-800 shadow-sm font-bold" : "text-carbon-600"
              }`}
            >
              Confirmados
            </button>
          </div>

          {/* Add Guest Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#B88E3E] text-carbon-950 text-xs font-bold font-sans uppercase tracking-wider transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invitar Familia</span>
          </button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-carbon-700">
          <thead className="bg-[#FAF7F2] border-b border-[#E8DFC8] text-carbon-500 font-serif italic text-xs tracking-wider">
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
          <tbody className="divide-y divide-carbon-100 font-sans">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-carbon-400 font-serif italic">
                  No se encontraron familias con ese nombre.
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
                  <tr key={guest.guestToken} className="hover:bg-[#FAF7F2]/80 transition-colors">
                    {/* Family Name */}
                    <td className="py-3 px-4">
                      <div className="font-serif italic font-bold text-carbon-900 text-base">
                        {guest.familyName}
                      </div>
                      <div className="text-[11px] text-carbon-400">
                        {guest.primaryContactName || "Sin titular"} • {guest.phone || "Sin teléfono"}
                      </div>
                    </td>

                    {/* Seats */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="font-bold text-carbon-900 font-serif text-sm">
                          {guest.status === "CONFIRMED" ? guest.confirmedSeats : guest.maxSeats}
                        </span>
                        <span className="text-carbon-400 text-[10px]">
                          / {guest.maxSeats}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {guest.status === "CONFIRMED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-serif italic font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmado
                        </span>
                      )}
                      {guest.status === "OPENED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-serif italic font-medium bg-amber-100 text-amber-900 border border-amber-300">
                          <Eye className="w-3 h-3 text-amber-700" />
                          Sobre Abierto
                        </span>
                      )}
                      {guest.status === "UNOPENED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-serif italic text-carbon-600 bg-carbon-100">
                          <Clock className="w-3 h-3 text-carbon-500" />
                          Por abrir
                        </span>
                      )}
                      {guest.status === "DECLINED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-serif italic text-carbon-600 bg-carbon-200">
                          <XCircle className="w-3 h-3 text-carbon-500" />
                          No asistirá
                        </span>
                      )}
                    </td>

                    {/* Timestamps & Message */}
                    <td className="py-3 px-4 text-[11px] text-carbon-500">
                      {guest.guestMessage ? (
                        <div className="max-w-[180px] truncate font-serif italic text-carbon-700" title={guest.guestMessage}>
                          &ldquo;{guest.guestMessage}&rdquo;
                        </div>
                      ) : guest.openedAt ? (
                        <div className="font-serif italic text-carbon-500">
                          Abierto: {new Date(guest.openedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </div>
                      ) : (
                        <span className="text-carbon-400 font-serif italic">Pendiente</span>
                      )}
                    </td>

                    {/* Table */}
                    <td className="py-3 px-4">
                      {tableName ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#F3EBDD] text-[#7A5C30] border border-[#DFC9A6] font-serif italic text-xs">
                          {tableName}
                        </span>
                      ) : (
                        <span className="text-carbon-400 text-xs font-serif italic">Por asignar</span>
                      )}
                    </td>

                    {/* CheckIn */}
                    <td className="py-3 px-4">
                      {guest.checkedInAt ? (
                        <div className="text-emerald-800 font-bold text-xs flex items-center gap-1 font-serif italic">
                          <DoorOpen className="w-3.5 h-3.5" />
                          <span>¡En la fiesta!</span>
                        </div>
                      ) : (
                        <span className="text-carbon-300 text-xs font-serif italic">—</span>
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
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                          title={guest.status === "UNOPENED" ? "Enviar invitación por WhatsApp" : "Enviar recordatorio cariñoso"}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        {/* Copy Link */}
                        <button
                          onClick={() => copyGuestLink(guest.guestToken)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EFEA] text-carbon-700 border border-[#E8DFC8] transition-colors"
                          title="Copiar enlace de su carta"
                        >
                          {copiedToken === guest.guestToken ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open as guest */}
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EFEA] text-carbon-700 border border-[#E8DFC8] transition-colors"
                          title="Ver cómo ve su carta este invitado"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#FAF7F2] p-6 sm:p-8 shadow-2xl border border-[#DFC9A6]">
            <h3 className="font-serif italic text-2xl text-carbon-900 font-bold mb-1">
              Invitar a una Nueva Familia
            </h3>
            <p className="text-xs text-carbon-500 mb-5 font-sans">
              Se creará su carta personalizada con sobre digital lista para enviar por WhatsApp.
            </p>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-serif italic text-carbon-700 mb-1">
                  Nombre de la familia o invitados *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Familia Sandoval Duarte"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-xs text-carbon-900 bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif italic text-carbon-700 mb-1">
                  Nombre del titular de contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Fernando Sandoval"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-xs text-carbon-900 bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-serif italic text-carbon-700 mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+502..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-xs text-carbon-900 bg-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif italic text-carbon-700 mb-1">
                    Lugares reservados *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={newMaxSeats}
                    onChange={(e) => setNewMaxSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFC9A6] text-xs text-carbon-900 bg-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#E8DFC8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DFC9A6] text-carbon-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#B88E3E] text-carbon-950 text-xs font-bold font-sans uppercase tracking-wider shadow-sm"
                >
                  {isSaving ? "Guardando..." : "Crear Sobre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
