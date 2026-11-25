"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Sparkles, QrCode, Users, Camera, ArrowRight } from "lucide-react";
import Image from "next/image";

interface ScrollytellingStepsProps {
  onOpenDayOf?: () => void;
  onOpenHost?: () => void;
}

export function ScrollytellingSteps({ onOpenDayOf, onOpenHost }: ScrollytellingStepsProps) {
  const steps = [
    {
      num: "01",
      badge: "El Anuncio",
      title: "La emoción de abrirla",
      subtitle: "Un sobre con el nombre de su familia, sellado para ellos.",
      description:
        "Tus invitados reciben un enlace personal por WhatsApp. Al tocarlo, un sobre de papel fino con sello de lacre se desliza revelando la carta de tu evento, su historia, itinerario, código de vestimenta y el número exacto de pases reservados.",
      features: [
        "Sobre digital personalizado por familia",
        "Música de fondo, mapa interactivo y cuenta regresiva",
        "Pases asignados sin malentendidos ni agregados sorpresa",
      ],
      image:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
      imageAlt: "Sobre y caligrafía artesanal",
    },
    {
      num: "02",
      badge: "La Confirmación",
      title: "La calma de organizar",
      subtitle: "Respuestas al instante, sin perseguir a nadie.",
      description:
        "Cada familia confirma sus lugares con un solo toque desde su celular, especificando alergias o restricciones alimentarias y dejándote un mensaje de cariño. Tú ves cómo se completa tu lista sin enviar recordatorios incómodos.",
      features: [
        "Confirmación instantánea de asistencia con un toque",
        "Registro de restricciones alimentarias y mensajes de cariño",
        "Acomodo de mesas en armonía con vista clara de lugares",
      ],
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
      imageAlt: "Montaje de mesa y flores de celebración",
    },
    {
      num: "03",
      badge: "La Fiesta",
      title: "La magia el día del evento",
      subtitle: "Bienvenida ágil, mesas claras y recuerdos compartidos.",
      description:
        "El día de la fiesta, tus invitados tienen en su mano el itinerario minuto a minuto, la clave de Wi-Fi y su número de mesa. Al llegar, muestran su pase personal para una bienvenida cálida y pueden subir sus fotos al álbum colaborativo de la noche.",
      features: [
        "Pase QR personal para una recepción fluida sin listas en papel",
        "Buscador de mesa y Wi-Fi accesible en un segundo",
        "Álbum en vivo para revivir la noche desde la mirada de todos",
      ],
      image:
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop",
      imageAlt: "Brindis y celebración en vivo",
      action: {
        label: "Ver experiencia el día de la fiesta",
        onClick: onOpenDayOf,
      },
    },
  ];

  return (
    <section id="experiencia" className="py-28 px-6 md:px-12 bg-[#F6F3EE] relative overflow-hidden">
      {/* Subtle organic background lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#C2A676_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="font-serif italic text-stone-500 text-lg mb-2">
            El recorrido de tus invitados
          </p>
          <h2 className="text-3xl md:text-5xl font-serif text-stone-900 tracking-tight font-normal">
            De la primera emoción al último brindis
          </h2>
          <p className="mt-4 text-stone-600 text-base leading-relaxed">
            Una experiencia pensada de inicio a fin para que tus invitados se sientan esperados
            y tú vivas tu día con total serenidad.
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Visual side */}
                <div
                  className={`lg:col-span-6 relative ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-stone-900/10 border border-stone-200/80 group">
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
                    
                    {/* Floating badge inside image */}
                    <div className="absolute bottom-5 left-5 right-5 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#B89758]/15 text-[#8F7138] flex items-center justify-center font-serif font-bold text-sm">
                          {step.num}
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">
                            {step.badge}
                          </p>
                          <p className="text-sm font-serif font-medium text-stone-900">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content side */}
                <div
                  className={`lg:col-span-6 space-y-6 ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-300/70 text-stone-600 text-xs font-serif uppercase tracking-widest">
                    Paso {step.num} · {step.badge}
                  </div>

                  <h3 className="text-2xl md:text-4xl font-serif text-stone-900 font-normal leading-tight">
                    {step.title}
                  </h3>

                  <p className="text-stone-600 text-base md:text-lg leading-relaxed">
                    {step.description}
                  </p>

                  <ul className="space-y-3 pt-2">
                    {step.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-stone-700 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#8F7138] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {step.action && (
                    <div className="pt-4">
                      <button
                        onClick={step.action.onClick}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-stone-50 hover:bg-[#8F7138] transition-colors duration-300 text-sm font-medium shadow-md shadow-stone-900/10 group"
                      >
                        <span>{step.action.label}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
