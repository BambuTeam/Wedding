"use client";

import React from "react";
import { Check, X, Sparkles, Heart } from "lucide-react";

export function ComparisonSection() {
  const comparisonItems = [
    {
      feature: "Entrega personalizada por familia",
      pdf: "Un mismo PDF o tarjeta genérica para todos",
      aurea: "Sobre digital con el nombre exacto de la familia y pases asignados",
    },
    {
      feature: "Confirmación de asistencia (RSVP)",
      pdf: "Perseguir respuestas una por una por WhatsApp",
      aurea: "Confirman en un toque con alergias y mensaje de cariño automático",
    },
    {
      feature: "Acomodo de mesas y protocolo",
      pdf: "Hojas de cálculo confusas y cambios de último minuto en papel",
      aurea: "Plano visual dinámico donde cada invitado sabe su mesa en segundos",
    },
    {
      feature: "Recepción en la puerta del evento",
      pdf: "Filas lentas buscando nombres con marcador en listas impresas",
      aurea: "Pase personal QR que da la bienvenida en 5 segundos sin esperas",
    },
    {
      feature: "Música, mapa interactivo y cambios",
      pdf: "Estático, si cambia un horario hay que reenviar o reimprimir",
      aurea: "Música de fondo, botón directo a Waze/Maps y cambios en tiempo real",
    },
    {
      feature: "Recuerdos de la fiesta",
      pdf: "Las fotos se quedan dispersas en los chats de los invitados",
      aurea: "Álbum colaborativo en vivo donde todos suben sus fotos durante la noche",
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-[#FAF8F5] border-t border-stone-200/80 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-sans text-[12px] uppercase tracking-wider text-[#8F7138] font-bold mb-2">
            Hospitalidad versus formatos estáticos
          </p>
          <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 font-normal tracking-tight">
            Lo que una invitación impresa o PDF no puede hacer por ti
          </h2>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed font-sans">
            La belleza del papel fino combinada con la paz mental de tener cada detalle bajo control.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden">
          <div className="grid grid-cols-12 bg-stone-100/80 p-5 md:p-6 border-b border-stone-200 text-[13px] font-sans font-semibold tracking-normal text-zinc-700">
            <div className="col-span-5 md:col-span-4">Momento de la celebración</div>
            <div className="col-span-3 md:col-span-4 text-zinc-500 font-medium">PDF tradicional o papel</div>
            <div className="col-span-4 md:col-span-4 text-[#8F7138] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AUREA Atelier</span>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-5 md:p-6 items-center gap-4 hover:bg-stone-50/60 transition-colors text-[13px] md:text-sm font-sans"
              >
                <div className="col-span-5 md:col-span-4 font-sans text-zinc-900 font-semibold">
                  {item.feature}
                </div>
                <div className="col-span-3 md:col-span-4 text-zinc-600 flex items-start gap-2">
                  <X className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{item.pdf}</span>
                </div>
                <div className="col-span-4 md:col-span-4 text-zinc-900 font-medium flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#8F7138] shrink-0 mt-0.5" />
                  <span>{item.aurea}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
