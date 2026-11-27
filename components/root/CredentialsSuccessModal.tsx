"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Copy, MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";

interface CredentialsSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    clientName: string;
    phone: string;
    celebrationType?: string;
    accountCode?: string;
    email?: string;
    accessUrl: string;
    accessPin: string;
    eventId?: string;
  } | null;
}

export function CredentialsSuccessModal({
  isOpen,
  onClose,
  data,
}: CredentialsSuccessModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !data || !mounted) return null;

  // Asegurar que la URL use exactamente el origin actual (soporta localhost:3000, :3001 y dominio de producción)
  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let computedAccessUrl = data.accessUrl;
  try {
    if (data.accessUrl.startsWith("http")) {
      const parsed = new URL(data.accessUrl);
      parsed.searchParams.delete("eventId");
      computedAccessUrl = parsed.toString();
    } else if (data.accessUrl.startsWith("/")) {
      const parsed = new URL(data.accessUrl, currentOrigin);
      parsed.searchParams.delete("eventId");
      computedAccessUrl = parsed.toString();
    }
  } catch (e) {
    computedAccessUrl = `${currentOrigin}${data.accessUrl}`.replace(/&eventId=[^&]+/, "");
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(computedAccessUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(data.accessPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleCopyAccount = () => {
    if (data.accountCode) {
      navigator.clipboard.writeText(data.accountCode);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    // Limpiar número de teléfono eliminando espacios y signos para wa.me
    const cleanPhone = data.phone.replace(/[^0-9]/g, "");
    const targetPhone = cleanPhone.length >= 8 ? cleanPhone : "50255551234";

    const accountIdentifier = data.accountCode || data.email || "Código de cuenta";
    const celebration = data.celebrationType || "Celebración";

    const message =
      `✨ *¡BIENVENIDO A ÁUREA!* ✨\n` +
      `Tu espacio de anfitrión está activo\n\n` +
      `Hola *${data.clientName}*, es un placer saludarte. Hemos preparado y liberado tu panel exclusivo para tu *${celebration}*.\n\n` +
      `🗝️ *Tus Credenciales de Acceso:*\n` +
      `• *Código de Cuenta:* *${accountIdentifier}*\n` +
      `• *PIN Confidencial (6 dígitos):* *${data.accessPin}*\n` +
      (data.email ? `• *Correo registrado:* ${data.email}\n` : "") +
      `\n` +
      `📲 *Enlace directo a tu panel:* \n${computedAccessUrl}\n\n` +
      `Desde tu panel podrás:\n` +
      `✓ Registrar a tus invitados y familias\n` +
      `✓ Monitorear confirmaciones (RSVP) en vivo\n` +
      `✓ Organizar el acomodo de tus mesas\n` +
      `✓ Personalizar tu invitación con música y fotos\n\n` +
      `💡 *Tip:* Guarda este mensaje para acceder rápidamente cuando lo necesites.\n` +
      `¡Estamos felices de acompañarte en este gran momento! 🤍`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-dvh m-0 p-4 sm:p-6 flex items-center justify-center bg-[#141311]/75 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-700 block">
            Activación Completada con Éxito
          </span>
          <h3 className="text-2xl font-bold text-zinc-900">
            {data.clientName}
          </h3>
          <p className="text-xs text-zinc-500">
            Credenciales de acceso listas para entregar al anfitrión o planner.
          </p>
        </div>

        {/* Credentials Box */}
        <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EADBCC] space-y-4">
          {/* Código de Cuenta & Correo */}
          {data.accountCode && (
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCC]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                  Código de Cuenta Oficial
                </span>
                <span className="text-xl font-mono font-bold tracking-wider text-[#8A6D1C]">
                  {data.accountCode}
                </span>
                {data.email && (
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    {data.email}
                  </span>
                )}
              </div>
              <button
                onClick={handleCopyAccount}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-semibold shadow-sm transition-all"
              >
                {copiedAccount ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* PIN */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCC]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                PIN de Acceso Privado (6 dígitos)
              </span>
              <span className="text-2xl font-mono font-bold tracking-widest text-zinc-900">
                {data.accessPin}
              </span>
            </div>
            <button
              onClick={handleCopyPin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-semibold shadow-sm transition-all"
            >
              {copiedPin ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar PIN</span>
                </>
              )}
            </button>
          </div>

          {/* Enlace Directo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                Enlace Directo al Panel
              </span>
              <button
                onClick={handleCopyUrl}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1"
              >
                {copiedUrl ? (
                  <span className="text-emerald-700 font-bold">¡Enlace Copiado!</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar enlace</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-700 break-all select-all">
              {computedAccessUrl}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Enviar Credenciales por WhatsApp</span>
          </button>

          <a
            href={computedAccessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Abrir y Probar Panel como Anfitrión</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
