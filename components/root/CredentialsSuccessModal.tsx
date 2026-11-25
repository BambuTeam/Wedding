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
      computedAccessUrl = `${currentOrigin}${parsed.pathname}${parsed.search}`;
    } else if (data.accessUrl.startsWith("/")) {
      computedAccessUrl = `${currentOrigin}${data.accessUrl}`;
    }
  } catch (e) {
    computedAccessUrl = `${currentOrigin}${data.accessUrl}`;
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

  const handleOpenWhatsApp = () => {
    // Limpiar número de teléfono eliminando espacios y signos para wa.me
    const cleanPhone = data.phone.replace(/[^0-9]/g, "");
    const targetPhone = cleanPhone.length >= 8 ? cleanPhone : "50255551234";

    // Usar secuencias Unicode explícitas (\u2728, \uD83D\uDD17, \uD83D\uDD10, \u2022) para evitar corrupción de encoding en cualquier SO/Navegador
    const text = encodeURIComponent(
      `\u2728 *¡BIENVENIDO A ÁUREA! TU ESPACIO ESTÁ ACTIVO* \u2728\n\n` +
        `Hola *${data.clientName}*, nos complace anunciarte que tu acceso exclusivo al panel de anfitrión para tu *${data.celebrationType || "Celebración"}* ha sido liberado con éxito.\n\n` +
        `Desde aquí podrás registrar a tus invitados, acomodar tus mesas en el jardín y monitorear confirmaciones en tiempo real:\n\n` +
        `\uD83D\uDD17 *Enlace directo a tu panel:* \n${computedAccessUrl}\n\n` +
        `\uD83D\uDD10 *PIN confidencial de acceso:* *${data.accessPin}*\n\n` +
        `\u2022 Guarda este mensaje para ingresar cuando lo necesites.\n` +
        `\u2022 ¡Estamos felices de acompañarte en este gran momento!`
    );

    window.open(`https://wa.me/${targetPhone}?text=${text}`, "_blank");
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
          {/* PIN */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCC]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                PIN de Acceso Privado
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
