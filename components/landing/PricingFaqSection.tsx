"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Sparkles, MessageCircle, ArrowRight } from "lucide-react";

interface PricingFaqSectionProps {
  onOpenContact: (planName?: string) => void;
}

export function PricingFaqSection({ onOpenContact }: PricingFaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      name: "Colección Esencial",
      tagline: "Para celebraciones íntimas y anuncios con calidez",
      features: [
        "Carta digital personalizada con su historia y fotos",
        "Apertura de sobre con sello de lacre interactivo",
        "Música de fondo y cuenta regresiva al momento",
        "Ubicación con botón directo a Google Maps y Waze",
        "Confirmación de asistencia (RSVP) básica",
        "Mesa de regalos y datos bancarios discretos",
      ],
      highlight: false,
    },
    {
      name: "Colección Firma",
      tagline: "La experiencia completa de hospitalidad personalizada",
      badge: "Más elegida",
      features: [
        "Todo lo incluido en la Colección Esencial",
        "Pases asignados por familia sin confusiones",
        "Registro de restricciones alimentarias y notas de cariño",
        "Acomodo de mesas dinámico (Seating Chart)",
        "Pase personal QR para cada familia confirmada",
        "Monitoreo de confirmaciones en tiempo real",
      ],
      highlight: true,
    },
    {
      name: "Gran Celebración",
      tagline: "Con el Kit del Día y álbum colaborativo para la fiesta",
      features: [
        "Todo lo incluido en la Colección Firma",
        "Kit del Día: buscador de mesa por apellido en celular",
        "Tarjeta de Wi-Fi con código QR instantáneo",
        "Itinerario minuto a minuto dinámico para la fiesta",
        "Álbum colaborativo en vivo para fotos de los invitados",
        "Escáner de recepción multi-dispositivo sin filas",
      ],
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: "¿Cómo reciben mis invitados la invitación?",
      a: "Les envías su enlace personal por WhatsApp o mensaje directo. Al tocarlo, no tienen que descargar ninguna aplicación: se abre en su navegador con una animación suave de apertura de sobre con lacre, mostrando el nombre de su propia familia.",
    },
    {
      q: "¿Puedo limitar el número de pases por familia?",
      a: "Sí, cada familia tiene asignado un número exacto de lugares reservados (ej. 2, 3 o 4 pases). Al confirmar, solo pueden confirmar hasta el máximo asignado, evitando invitados sorpresa.",
    },
    {
      q: "¿Cómo funciona la bienvenida con pase QR el día del evento?",
      a: "Cada familia confirmada recibe su Pase de Bienvenida con un código QR único. En la puerta, tu equipo o recepcionista escanea el código desde cualquier celular o tablet y la pantalla muestra al instante sus nombres y su número de mesa.",
    },
    {
      q: "¿Se pueden cambiar los horarios o la ubicación si hay imprevistos?",
      a: "Totalmente. Cualquier ajuste en itinerarios, mesas o notas se actualiza en tiempo real en la nube sin necesidad de reenviar enlaces.",
    },
    {
      q: "¿Funciona para bodas, XV años, bautizos o eventos de empresa?",
      a: "Sí, AUREA se adapta a cualquier tipo de celebración. Diseñamos la atmósfera, paleta de colores y protocolo a la medida de tu fecha especial.",
    },
    {
      q: "¿Tienen herramientas para Wedding Planners y coordinadores?",
      a: "Sí, contamos con un espacio especializado para organizadores donde pueden gestionar múltiples eventos, visualizar acomodo de mesas por plano y descargar reportes de dietas especiales.",
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-white border-t border-stone-200/80">
      <div className="max-w-6xl mx-auto space-y-28">
        {/* ============================================================== */}
        {/* 1. COLECCIONES / PLANES                                        */}
        {/* ============================================================== */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-sans text-[12px] uppercase font-semibold text-[#8C6D46] tracking-wider mb-2">
              Atelier de diseño a la medida
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-stone-900 font-normal tracking-tight">
              Colecciones creadas para cada celebración
            </h2>
            <p className="mt-4 text-stone-600 text-base leading-relaxed">
              Elige el nivel de acompañamiento que mejor se adapte al tamaño y estilo de tu evento.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${plan.highlight
                  ? "bg-[#FAF7F2] border-2 border-[#B89758] shadow-2xl scale-[1.02] relative"
                  : "bg-white border border-stone-200/90 shadow-md hover:shadow-xl"
                  }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#B89758] text-stone-950 font-sans text-[12px] font-semibold uppercase tracking-wider shadow">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl text-zinc-900 font-normal">
                      {plan.name}
                    </h3>
                    <p className="text-[13px] text-zinc-700 mt-1 leading-relaxed font-sans">
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="border-t border-stone-200/80 pt-4" />

                  <ul className="space-y-3">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-[13px] md:text-sm text-zinc-800 font-medium leading-snug font-sans">
                        <Check className="w-4 h-4 text-[#8F7138] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => onOpenContact(plan.name)}
                    className={`w-full py-3.5 rounded-full text-[13px] font-sans font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${plan.highlight
                      ? "bg-[#18181B] text-[#FAF7F2] hover:bg-[#8F7138] shadow-md"
                      : "bg-[#18181B] text-[#FAF7F2] hover:bg-[#27272A] shadow-sm"
                      }`}
                  >
                    <span className="text-[#FAF7F2]">Solicitar propuesta</span>
                    <ArrowRight className="w-4 h-4 text-[#DFC07D]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. PREGUNTAS FRECUENTES (FAQ)                                 */}
        {/* ============================================================== */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-sans text-[12px] uppercase font-semibold text-[#8C6D46] tracking-wider mb-2">
              Dudas comunes
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 font-normal tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="mt-3 text-stone-600 text-sm">
              Todo lo que necesitas saber sobre la experiencia de tus invitados y anfitriones.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200 bg-[#FAF8F5] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-sans text-base md:text-lg text-zinc-900 font-medium">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#8F7138]" : ""
                        }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 text-[13px] md:text-sm text-zinc-600 leading-relaxed border-t border-stone-200/60 mt-2 pt-4 font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
