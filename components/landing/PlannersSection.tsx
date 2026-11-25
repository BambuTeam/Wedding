"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Users, Utensils, QrCode, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface PlannersSectionProps {
  onOpenHost?: () => void;
}

export function PlannersSection({ onOpenHost }: PlannersSectionProps) {
  const plannerPillars = [
    {
      icon: Users,
      title: "Control sutil de asistencia",
      description:
        "Sabe exactamente quién asistirá, quién declinó y cuántos lugares están confirmados por familia, con restricciones de menú identificadas a tiempo.",
    },
    {
      icon: Utensils,
      title: "Acomodo armónico de mesas",
      description:
        "Asigna a cada invitado a su mesa correspondiente sin confusiones. Familias, amigos y colegas sentados justo donde deben estar.",
    },
    {
      icon: QrCode,
      title: "Bienvenida sin listas en papel",
      description:
        "Al escanear el pase personal desde cualquier teléfono o tablet en la entrada, el equipo de recepción da una bienvenida cálida y personal en segundos.",
    },
  ];

  return (
    <section id="planners" className="py-28 px-6 md:px-12 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Atelier Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <p className="font-serif italic text-stone-500 text-lg">
              Para Wedding Planners y Anfitriones
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-stone-900 font-normal leading-tight">
              Cada celebración en perfecta armonía
            </h2>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed">
              Diseñamos una herramienta pensada como un cuaderno de atelier: limpia, serena y
              enfocada en los detalles que importan. Para que tú y tu equipo dediquen su energía
              a crear recuerdos memorables, no a resolver listas desactualizadas.
            </p>

            <div className="space-y-6 pt-4">
              {plannerPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 border border-stone-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-stone-900 font-medium">
                        {pillar.title}
                      </h4>
                      <p className="text-stone-600 text-sm mt-1 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6">
              <button
                onClick={onOpenHost}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-stone-900 text-stone-50 hover:bg-[#8F7138] transition-colors duration-300 text-sm font-medium shadow-md shadow-stone-900/10 group"
              >
                <span>Explorar espacio de gestión</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right: Editorial Visual Composition */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
              <Image
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop"
                alt="Montaje de boda y coordinación de mesas"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

              {/* Floating Stat Card 1 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="absolute top-8 right-8 p-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/80 max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                    Recepción fluida
                  </p>
                </div>
                <p className="text-2xl font-serif text-stone-900 mt-2 font-normal">
                  98% de invitados
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Ubicados en su mesa en menos de 10 segundos
                </p>
              </motion.div>

              {/* Floating Stat Card 2 (Dark Luxury Card with p-5 leading-snug) */}
              <motion.div
                whileHover={{ y: -4 }}
                className="absolute bottom-6 left-6 right-6 p-5 bg-[#18181B]/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-white/10"
              >
                <p className="text-[11px] uppercase tracking-widest text-[#DFC07D] font-semibold font-sans">
                  Tranquilidad para el equipo
                </p>
                <p className="text-sm sm:text-base font-serif text-white mt-1 leading-snug">
                  “Pudimos atender a cada familia por su nombre desde el primer instante.”
                </p>
                <p className="text-xs text-stone-400 mt-1.5 italic font-serif">
                  — Atelier Nupcial &amp; Coordinación
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
