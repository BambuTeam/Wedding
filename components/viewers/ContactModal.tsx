"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, CheckCircle2, MessageCircle, Loader2 } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

export function ContactModal({ isOpen, onClose, initialPlan = "Colección Firma" }: ContactModalProps) {
  const [eventType, setEventType] = useState("Boda");
  const [hostName, setHostName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState("150");
  const [eventDate, setEventDate] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    tenantId: string;
    hostName: string;
    phone: string;
    celebrationType: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/public/request-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName,
          email,
          phone,
          celebrationType: eventType,
          estimatedDate: eventDate,
          guestCount,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo registrar la solicitud.");
      }

      setSubmittedData({
        tenantId: data.tenantId,
        hostName,
        phone,
        celebrationType: eventType,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!submittedData) return;
    const text = encodeURIComponent(
      `✨ *SOLICITUD DE INVITACIÓN AUREA* ✨\n\n` +
        `Hola AUREA, acabo de registrar mi solicitud en la plataforma con el folio *#${submittedData.tenantId}*.\n\n` +
        `• Anfitrión(es) / Agencia: *${submittedData.hostName}*\n` +
        `• Celebración: *${submittedData.celebrationType}*\n` +
        `• Plan: *${selectedPlan}*\n` +
        `• Teléfono: *${submittedData.phone}*\n\n` +
        `¿Podrían apoyarme con la liberación y activación de mi espacio? ¡Muchas gracias!`
    );
    window.open(`https://wa.me/5215500000000?text=${text}`, "_blank");
  };

  const handleResetAndClose = () => {
    setSubmittedData(null);
    setErrorMsg(null);
    setHostName("");
    setEmail("");
    setPhone("");
    setEventDate("");
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-[#141311]/75 backdrop-blur-md"
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          data-lenis-prevent
          className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 z-10 overflow-y-auto max-h-[90vh]"
        >
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>

          {submittedData ? (
            <div className="text-center py-6 space-y-4 font-sans">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8F7138] block mb-1">
                  Solicitud Registrada con Éxito
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-zinc-900 font-normal">
                  ¡Gracias, {submittedData.hostName}!
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DFC8] text-left text-xs space-y-1.5 text-zinc-700 shadow-sm max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Folio de solicitud:</span>
                  <span className="font-mono font-bold text-zinc-900">{submittedData.tenantId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Estado:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                    Pendiente de Liberación
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Plan elegido:</span>
                  <span className="font-semibold text-zinc-800">{selectedPlan}</span>
                </div>
              </div>

              <p className="text-[13px] text-zinc-600 max-w-sm mx-auto leading-relaxed">
                Tu solicitud ha ingresado a nuestra bandeja de activación. Para agilizar la entrega de tus accesos y personalizar tu carta muestra de inmediato, escríbenos directamente por WhatsApp:
              </p>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Escribir por WhatsApp para agilizar mi activación</span>
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 rounded-full text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors"
                >
                  Cerrar y volver a la página
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-sans text-[12px] uppercase font-semibold text-[#8C6D46] mb-1">
                Atelier personalizado AUREA
              </p>
              <h3 className="text-2xl sm:text-3xl font-serif text-zinc-900 font-normal">
                Solicitar mi invitación
              </h3>
              <p className="text-[13px] text-zinc-600 mt-1 mb-6 font-sans">
                Completa estos sencillos datos para registrar tu evento y recibir tu muestra personalizada.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                <div>
                  <label className="block text-[12px] font-sans font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Nombre(s) de los anfitriones o agencia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Camila & Andrés / Familia Rivas / Atelier Eventos"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-zinc-800 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#B89758]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Tipo de Celebración
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-zinc-800 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#B89758]"
                    >
                      <option value="Boda">Boda</option>
                      <option value="XV Años">Mis XV Años</option>
                      <option value="Bautizo">Bautizo o Baby Shower</option>
                      <option value="Cumpleaños">Cumpleaños o Aniversario</option>
                      <option value="Corporativo">Gala Corporativa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Plan Deseado
                    </label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-zinc-800 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#B89758]"
                    >
                      <option value="Colección Esencial">Colección Esencial</option>
                      <option value="Colección Firma">Colección Firma</option>
                      <option value="Gran Celebración">Gran Celebración</option>
                      <option value="Planner Pro">Planner Pro (Multi-Evento)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Invitados aprox.
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 180"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-zinc-800 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#B89758]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Fecha estimada
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 28 Nov 2026"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-zinc-800 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#B89758]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      WhatsApp / Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+502 5555 1234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-zinc-800 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#B89758]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-zinc-800 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#B89758]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-full bg-zinc-900 hover:bg-[#8F7138] text-stone-50 font-semibold font-sans text-[13px] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando solicitud...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#DFC07D]" />
                        <span>Solicitar y recibir muestra personalizada</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
