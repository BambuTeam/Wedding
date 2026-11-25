"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  QrCode,
  Utensils,
  Camera,
  Wifi,
  Clock,
  ArrowRight,
  ShieldCheck,
  Users,
  Send,
} from "lucide-react";

interface HowItWorksScenesProps {
  onOpenInvitation: (token: string, eventId: string) => void;
  onOpenHost: () => void;
  onOpenDayOf: () => void;
}

export function HowItWorksScenes({
  onOpenInvitation,
  onOpenHost,
  onOpenDayOf,
}: HowItWorksScenesProps) {
  return (
    <section id="experiencia" className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-32">
      {/* ============================================================== */}
      {/* ESCENA 1: UN SOBRE PERSONAL PARA CADA FAMILIA                   */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
      >
        {/* Texto Izquierda */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[13px] font-sans font-semibold border border-[#DFC9A6]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>01 · Personalización &amp; Entrega</span>
          </div>

          <h2 className="font-serif italic text-3xl sm:text-5xl text-zinc-900 leading-[1.12] font-normal">
            Un sobre personal para cada familia.
          </h2>

          <p className="text-zinc-700 text-base sm:text-lg leading-relaxed font-sans">
            Cada invitado recibe un enlace exclusivo por WhatsApp o mensaje directo. Al abrirlo en
            su navegador, no tienen que descargar ninguna aplicación ni lidiar con archivos PDF rígidos:
            su sobre personal aparece rotulado con el nombre de su propia familia y sus lugares reservados
            exactos, cuidando la intimidad de tu celebración.
          </p>

          <div className="space-y-3 pt-2 text-[13px] sm:text-sm font-sans text-zinc-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Rotulación caligráfica nominal para cada hogar</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Límite exacto de pases por familia (cero invitados sorpresa)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Apertura con sello de lacre interactivo y música acústica de bienvenida</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenInvitation("rivas-molina", "camila-andres-2025")}
              className="px-7 py-3.5 rounded-full bg-[#18181B] text-[#FAF7F2] hover:bg-[#27272A] text-[13px] font-sans font-semibold tracking-normal uppercase transition-all shadow-md flex items-center gap-2 group cursor-pointer"
            >
              <span>Ver sobre de muestra de Camila &amp; Andrés</span>
              <ArrowRight className="w-4 h-4 text-[#DFC07D] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mockup WhatsApp Derecha */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-3xl bg-[#EFEAE2] p-4 sm:p-6 shadow-2xl border border-stone-200/80 overflow-hidden">
            {/* Cabecera estilo WhatsApp */}
            <div className="flex items-center gap-3 bg-[#075E54] text-white p-3.5 rounded-2xl shadow-sm mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-sans text-sm font-bold">
                C&amp;A
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-semibold truncate">Camila &amp; Andrés 💍</p>
                <p className="text-[12px] text-emerald-100 font-sans">En línea</p>
              </div>
            </div>

            {/* Mensaje de WhatsApp con Tarjeta Enriquecida */}
            <div className="space-y-3">
              <div className="max-w-md ml-auto bg-[#DCF8C6] rounded-2xl rounded-tr-none p-4 shadow-sm border border-emerald-200/50 space-y-3">
                <p className="text-[13px] sm:text-sm text-zinc-800 font-sans leading-relaxed">
                  ¡Hola Fernando &amp; Familia! Con inmensa alegría queremos invitarlos a celebrar
                  nuestra boda en Antigua Guatemala este 28 de Noviembre. Diseñamos este sobre digital
                  especialmente para ustedes:
                </p>

                {/* Previsualización Enriquecida OpenGraph */}
                <div
                  onClick={() => onOpenInvitation("rivas-molina", "camila-andres-2025")}
                  className="rounded-xl overflow-hidden bg-white border border-stone-200 shadow-sm cursor-pointer hover:border-[#C5A059] transition-all group"
                >
                  <div className="relative h-32 sm:h-36 overflow-hidden bg-stone-900">
                    <img
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                      alt="Boda colonial"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent flex items-end p-3">
                      <span className="text-[11px] uppercase tracking-widest text-[#DFC07D] font-sans font-bold">
                        AUREA · INVITACIÓN PRIVADA
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <p className="font-serif text-base sm:text-lg font-normal text-zinc-900 leading-tight">
                      Nuestra Boda · Camila &amp; Andrés
                    </p>
                    <p className="text-[13px] text-zinc-700 font-sans">
                      Sobre reservado para: Familia Rivas Molina (4 lugares)
                    </p>
                    <span className="text-[12px] text-[#8F7138] font-sans font-medium flex items-center gap-1 pt-1">
                      <span>Toca para abrir la carta personal</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-1 text-[11px] text-zinc-600 font-sans pt-1">
                  <span>11:28 a. m.</span>
                  <span className="text-[#34B7F1] font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============================================================== */}
      {/* ESCENA 2: CONFIRMACIONES Y MESAS SIN PERSEGUIR A NADIE          */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
      >
        {/* Tarjeta Editorial Izquierda */}
        <div className="lg:col-span-6 order-2 lg:order-1 relative">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200/90 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8F7138] font-sans font-semibold">
                  Panel de Hospitalidad en Vivo
                </span>
                <p className="font-serif text-2xl text-zinc-900 mt-0.5 font-normal">
                  Control del Banquete &amp; Acomodo
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-sans font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Actualizado en tiempo real
              </span>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]/60 text-center space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-sans block font-medium">
                  Confirmados
                </span>
                <p className="font-sans text-2xl text-zinc-900 font-bold">124</p>
                <span className="text-[11px] text-emerald-700 font-sans font-medium">89% de pases</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]/60 text-center space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-sans block font-medium">
                  Dietas / Alergias
                </span>
                <p className="font-sans text-2xl text-amber-800 font-bold">4</p>
                <span className="text-[11px] text-amber-800 font-sans font-medium">Avisadas a cocina</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]/60 text-center space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-sans block font-medium">
                  Mesas Listas
                </span>
                <p className="font-sans text-2xl text-zinc-900 font-bold">12</p>
                <span className="text-[11px] text-zinc-600 font-sans font-medium">Capuchinas</span>
              </div>
            </div>

            {/* Lista de Familias y Estado */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-[13px] font-sans">
                <div>
                  <p className="font-sans text-sm text-zinc-900 font-semibold">
                    Familia Rivas Molina
                  </p>
                  <p className="text-[12px] text-zinc-600">4 lugares confirmados · Sin restricciones</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-sans font-semibold">
                  Mesa 1
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-[13px] font-sans">
                <div>
                  <p className="font-sans text-sm text-zinc-900 font-semibold">
                    Dr. Roberto Méndez &amp; Pareja
                  </p>
                  <p className="text-[12px] text-amber-800">2 lugares · 1 Menú Vegetariano</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-sans font-semibold">
                  Mesa 3
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-[13px] font-sans">
                <div>
                  <p className="font-sans text-sm text-zinc-900 font-semibold">
                    Lic. Sofía Alvarado
                  </p>
                  <p className="text-[12px] text-amber-800">1 lugar · Alergia severa a nueces</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-sans font-semibold">
                  Mesa 5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Texto Derecha */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[12px] font-sans font-semibold border border-[#DFC9A6]">
            <Utensils className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>02 · Confirmación Sin Estrés</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-[1.12] font-normal">
            Confirmaciones y mesas sin perseguir a nadie.
          </h2>

          <p className="text-zinc-700 text-base sm:text-lg leading-relaxed font-sans">
            Tus invitados confirman su asistencia con un toque desde su celular e indican alergias o
            restricciones para el banquete. La plataforma actualiza tus listas en tiempo real y te
            permite organizar el acomodo de mesas sin hojas de cálculo desactualizadas ni llamadas incómodas.
          </p>

          <div className="space-y-3 pt-2 text-[13px] sm:text-sm font-sans text-zinc-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Cero hojas de Excel desactualizadas ni mensajes repetidos</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Reporte detallado de dietas y alergias para tu catering y Wedding Planner</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Control estricto de cupos por mesa para que nadie quede apretado</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenHost}
              className="px-7 py-3.5 rounded-full bg-[#18181B] text-[#FAF7F2] hover:bg-[#27272A] text-[13px] font-sans font-semibold tracking-normal uppercase transition-all shadow-md flex items-center gap-2 group cursor-pointer"
            >
              <span>Abrir panel de anfitrión y planners</span>
              <ArrowRight className="w-4 h-4 text-[#DFC07D] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================== */}
      {/* ESCENA 3: BIENVENIDA SIN FILAS Y ÁLBUM VIVO                     */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
      >
        {/* Texto Izquierda */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-[12px] font-sans font-semibold border border-[#DFC9A6]">
            <QrCode className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>03 · El Día del Evento</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-[1.12] font-normal">
            Bienvenida sin filas y álbum vivo el día de la fiesta.
          </h2>

          <p className="text-zinc-700 text-base sm:text-lg leading-relaxed font-sans">
            El día de la fiesta, tus invitados tienen en su mano el itinerario minuto a minuto, la
            clave de Wi-Fi y su número de mesa. Al llegar a la puerta, muestran su Pase QR personal
            para una bienvenida cálida y fluida, y suben sus mejores fotos al álbum colaborativo de
            la noche.
          </p>

          <div className="space-y-3 pt-2 text-[13px] sm:text-sm font-sans text-zinc-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Escaneo veloz de pase QR desde cualquier celular de recepción</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Buscador instantáneo de mesa por apellido para los invitados</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#8F7138] shrink-0" />
              <span>Álbum colaborativo en vivo para recopilar las fotos de todos tus invitados</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenDayOf}
              className="px-7 py-3.5 rounded-full bg-[#18181B] text-[#FAF7F2] hover:bg-[#27272A] text-[13px] font-sans font-semibold tracking-normal uppercase transition-all shadow-md flex items-center gap-2 group cursor-pointer"
            >
              <span>Ver experiencia completa del Kit del Día</span>
              <ArrowRight className="w-4 h-4 text-[#DFC07D] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mockups Pase QR + Kit del Día Derecha */}
        <div className="lg:col-span-6 relative">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Pase QR Dorado (Col span 7) */}
            <div className="sm:col-span-7 rounded-3xl bg-[#1C1917] p-6 text-white shadow-2xl border border-[#C5A059]/40 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#DFC07D] font-sans font-bold">
                  PASE PERSONAL QR
                </span>
                <span className="text-[12px] font-sans text-stone-300 font-semibold">AUREA PASS</span>
              </div>

              <div className="text-center py-2">
                <p className="text-[11px] uppercase tracking-wider text-stone-400 font-sans font-medium">
                  Invitación de Honor
                </p>
                <h4 className="font-serif text-2xl text-white font-normal mt-0.5">
                  Familia Rivas Molina
                </h4>
                <p className="text-[13px] text-[#DFC07D] font-sans font-medium mt-0.5">
                  Mesa 1 · Claustro Capuchinas
                </p>
              </div>

              {/* QR Mockup */}
              <div className="w-36 h-36 mx-auto bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center border-2 border-[#DFC07D]">
                <QrCode className="w-full h-full text-stone-900" />
              </div>

              <div className="text-center pt-1 border-t border-white/10">
                <p className="text-[12px] text-stone-300 font-sans">
                  Presenta este código al llegar para tu bienvenida
                </p>
              </div>
            </div>

            {/* Tarjeta Kit del Día (Col span 5) */}
            <div className="sm:col-span-5 flex flex-col justify-between gap-3">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-md space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Wifi className="w-4 h-4 text-[#8F7138]" />
                  <span className="text-[13px] font-sans font-bold">Wi-Fi en 1 Toque</span>
                </div>
                <p className="text-[12px] text-zinc-600 font-sans">
                  Capuchinas_Eventos_5G · Clave automática
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-md space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Clock className="w-4 h-4 text-[#8F7138]" />
                  <span className="text-[13px] font-sans font-bold">Itinerario en Vivo</span>
                </div>
                <p className="text-[12px] text-zinc-600 font-sans">
                  18:00 Cóctel de Bienvenida en Claustro
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-md space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Camera className="w-4 h-4 text-[#8F7138]" />
                  <span className="text-[13px] font-sans font-bold">Álbum Vivo</span>
                </div>
                <p className="text-[12px] text-zinc-600 font-sans">
                  48 fotos capturadas por los invitados
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
