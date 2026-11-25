"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { EventMeta, Guest, Table } from "@/lib/types";
import { InvitationExperience } from "@/components/invitation/InvitationExperience";

export default function GuestInvitationPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = (params.slug as string) || (params.token as string) || "preview";
  const eventId = searchParams.get("eventId") || undefined;

  const [invitationData, setInvitationData] = useState<{
    event: EventMeta;
    guest: Guest;
    tables: Table[];
    isPreview: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitation() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const query = new URLSearchParams();
        query.set("slug", slug);
        if (eventId) query.set("eventId", eventId);

        const res = await fetch(`/api/public/invitation?${query.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "No se pudo cargar la invitación.");
        }

        setInvitationData({
          event: data.event,
          guest: data.guest,
          tables: data.tables || [],
          isPreview: Boolean(data.isPreview),
        });
      } catch (err: any) {
        console.error("[fetchInvitation] Error:", err);
        setErrorMsg(err.message || "Error al abrir la invitación.");
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [slug, eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="text-sm font-semibold text-zinc-700 tracking-wide">
          Preparando tu invitación de honor...
        </p>
      </div>
    );
  }

  if (errorMsg || !invitationData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 font-sans py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-zinc-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Invitación No Encontrada</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {errorMsg || "El enlace o identificador de la invitación no es válido o ha expirado."}
          </p>
          <a
            href="/"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Ir a la página principal
          </a>
        </div>
      </div>
    );
  }

  return (
    <InvitationExperience
      event={invitationData.event}
      guest={invitationData.guest}
      tables={invitationData.tables}
      isPreview={invitationData.isPreview}
    />
  );
}
