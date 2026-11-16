"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Mail,
  PartyPopper,
  Tv,
  Heart,
  Clock,
  QrCode,
  Users,
  Compass,
  Database,
  Building2,
  ChevronRight,
} from "lucide-react";
import { PhoneMockup } from "@/components/landing/PhoneMockup";

const STYLES = [
  {
    id: "bodas",
    name: "Bodas de Destino & Alta Gama",
    tagline: "El romance colonial de Antigua Guatemala, haciendas mexicanas y playas caribeñas.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    palette: ["#B89758", "#4A5D4E", "#8C6D46", "#FAF8F5"],
  },
  {
    id: "xv",
    name: "XV Años & Debutantes de Gala",
    tagline: "Elegancia editorial, pasarela, código de vestimenta y álbum social para la nueva generación.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    palette: ["#D4AF37", "#E2C4B8", "#1E1E24", "#F7F2E7"],
  },
  {
    id: "corp",
    name: "Galas Corporativas & Cumbres",
    tagline: "Control de acreditación estricto, salas VIP, traducción y credencial QR inviolable.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    palette: ["#1F2937", "#059669", "#D97706", "#F9FAFB"],
  },
  {
    id: "social",
    name: "Baby Showers & Aniversarios Privados",
    tagline: "La calidez de compartir con los más íntimos, listas de regalos curadas y fotos en tiempo real.",
    image: "https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    palette: ["#7F9E84", "#F3EFEA", "#BDB0A0", "#263028"],
  },
];

export default function HomePage() {
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-champagne-100/90 border border-champagne-300 text-champagne-900 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
              <span>Event-Tech &amp; Invitaciones Boutique de Lujo</span>
            </div>

            <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-carbon-900 leading-[0.95] tracking-tight">
              Invitaciones que se sienten como una <span className="gold-text-gradient font-normal">obra de arte</span>.
            </h1>

            <p className="text-base sm:text-xl text-carbon-600 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
              Sobre digital con lacre dorado, confirmación RSVP estrictamente limitada, Seating Chart dinámico, control de acceso QR anti-fraude y Kit del Día en vivo sobre arquitectura AWS Serverless.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/invitacion/rivas-molina"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 text-carbon-950 font-bold text-sm shadow-gold hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Abrir Invitación Demo (Rivas Molina)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-2xl bg-carbon-900 hover:bg-carbon-800 text-white font-semibold text-sm shadow-luxury transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-champagne-400" />
                <span>Explorar Dashboard Planner</span>
              </Link>
            </div>

            {/* Micro proof points */}
            <div className="pt-6 border-t border-champagne-300/40 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-carbon-900">100%</span>
                <p className="text-[11px] text-carbon-500 font-sans mt-0.5">Control de Lugares Asignados</p>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-champagne-700">0s</span>
                <p className="text-[11px] text-carbon-500 font-sans mt-0.5">Fricción al abrir en WhatsApp</p>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">AWS</span>
                <p className="text-[11px] text-carbon-500 font-sans mt-0.5">DynamoDB On-Demand Zero Waste</p>
              </div>
            </div>
          </div>

          {/* Right Interactive Mockup */}
          <div className="lg:col-span-5 relative">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* 2. Interactive Style Gallery */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">
            Colección Editorial
          </span>
          <h2 className="font-serif italic text-4xl sm:text-5xl text-carbon-900 mt-1">
            Diseñadas para los Eventos Más Exclusivos
          </h2>
          <p className="text-sm text-carbon-600 mt-2">
            Cada evento tiene su propia identidad, paleta tipográfica y protocolo de hospitalidad.
          </p>
        </div>

        {/* Style Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {STYLES.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStyle(st)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                selectedStyle.id === st.id
                  ? "bg-carbon-900 text-white shadow-md"
                  : "bg-white text-carbon-600 hover:bg-alabaster-200 border border-carbon-200"
              }`}
            >
              {st.name.split("&")[0]}
            </button>
          ))}
        </div>

        {/* Selected Style Showcase Card */}
        <div className="rounded-3xl bg-white border border-champagne-400/40 shadow-luxury overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-64 sm:h-96 lg:h-auto">
            <img
              src={selectedStyle.image}
              alt={selectedStyle.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-champagne-700">
                Experiencia Boutique
              </span>
              <h3 className="font-serif italic text-3xl sm:text-4xl text-carbon-900 font-bold mt-1">
                {selectedStyle.name}
              </h3>
              <p className="text-sm sm:text-base text-carbon-600 mt-3 leading-relaxed">
                {selectedStyle.tagline}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-carbon-500 uppercase tracking-wider block mb-2">
                Paleta de Color Curada:
              </span>
              <div className="flex items-center gap-2">
                {selectedStyle.palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full border border-carbon-200 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-carbon-100 flex items-center justify-between">
              <Link
                href="/invitacion/carlos-mendoza"
                className="text-xs font-bold text-champagne-700 hover:text-champagne-900 flex items-center gap-1.5"
              >
                <span>Probar esta plantilla interactiva</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Comparative Matrix: PDF/Plantilla vs. Plataforma Inteligente AUREA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">
            Comparativa de Innovación
          </span>
          <h2 className="font-serif italic text-4xl sm:text-5xl text-carbon-900 mt-1">
            PDF Tradicional vs. Plataforma Inteligente AUREA
          </h2>
          <p className="text-sm text-carbon-600 mt-2">
            La diferencia entre perder el control de tus invitados o tener una suite de hospitalidad digital en tiempo real.
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-champagne-400/40 shadow-luxury overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-alabaster-200/70 border-b border-carbon-200 text-carbon-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">Capacidad Operativa</th>
                <th className="py-4 px-4 sm:px-6 text-carbon-400">PDF / Plantilla Estática</th>
                <th className="py-4 px-4 sm:px-6 text-champagne-800 bg-champagne-50/70 font-bold">
                  Plataforma AUREA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-100">
              <tr>
                <td className="py-4 px-4 sm:px-6 font-semibold text-carbon-900">
                  Control estricto de pases asignados
                </td>
                <td className="py-4 px-4 sm:px-6 text-carbon-500">
                  <div className="flex items-center gap-1.5 text-red-700 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Nulo. El invitado reenvía el PDF o lleva acompañantes no invitados.</span>
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6 bg-champagne-50/40">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Estricto. Solo pueden confirmar hasta los lugares autorizados.</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 sm:px-6 font-semibold text-carbon-900">
                  Tracking de apertura del enlace
                </td>
                <td className="py-4 px-4 sm:px-6 text-carbon-500">
                  <div className="flex items-center gap-1.5 text-red-700 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Ciego. No sabes si abrieron o ignoraron el mensaje de WhatsApp.</span>
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6 bg-champagne-50/40">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Silencioso e instantáneo al romper el lacre con timestamp exacto.</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 sm:px-6 font-semibold text-carbon-900">
                  Control de Acceso Anti-Fraude
                </td>
                <td className="py-4 px-4 sm:px-6 text-carbon-500">
                  <div className="flex items-center gap-1.5 text-red-700 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Listas de papel lentas y filas interminables en la puerta.</span>
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6 bg-champagne-50/40">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Escaneo QR atómico con DynamoDB que rechaza pases duplicados.</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 sm:px-6 font-semibold text-carbon-900">
                  Kit del Día (Mesa, Wi-Fi, Cronograma)
                </td>
                <td className="py-4 px-4 sm:px-6 text-carbon-500">
                  <div className="flex items-center gap-1.5 text-red-700 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Invitados desorientados preguntando a los novios o meseros.</span>
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6 bg-champagne-50/40">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Buscador &quot;Encuentra tu mesa&quot;, Wi-Fi 1-toque y álbum en vivo.</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 sm:px-6 font-semibold text-carbon-900">
                  Costo de Infraestructura Serverless
                </td>
                <td className="py-4 px-4 sm:px-6 text-carbon-500">
                  <span className="text-carbon-600">Servidores tradicionales o suscripciones fijas caras.</span>
                </td>
                <td className="py-4 px-4 sm:px-6 bg-champagne-50/40">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>AWS Zero-Waste ($0 costo base en reposo por evento).</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Wedding Planner B2B & Agency Suite */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-carbon-900 to-carbon-950 text-white p-8 sm:p-14 border border-champagne-500/30 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne-500/20 text-champagne-300 text-xs font-semibold uppercase tracking-widest border border-champagne-500/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>Wedding Planners &amp; Agencias</span>
              </div>

              <h2 className="font-serif italic text-4xl sm:text-5xl text-white font-bold leading-tight">
                El Copiloto Digital que tu Equipo Operativo Merece
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Administra múltiples bodas simultáneas desde un solo panel. Envía invitaciones y recordatorios por WhatsApp con un solo clic, exporta reportes de alergias para el chef y mantén el seating chart sincronizado hasta el último minuto.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xl font-bold font-serif text-champagne-300">Multi-Evento</span>
                  <p className="text-xs text-zinc-400 mt-1">Cambia entre varias bodas sin cerrar sesión.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xl font-bold font-serif text-emerald-400">Modo TV</span>
                  <p className="text-xs text-zinc-400 mt-1">Proyección en vivo para pantallas gigantes.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-2xl bg-champagne-500 hover:bg-champagne-400 text-carbon-950 font-bold text-sm shadow-gold transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-carbon-950" />
                  <span>Ingresar al Panel de Wedding Planner</span>
                </Link>
              </div>
            </div>

            {/* Visual illustration */}
            <div className="relative rounded-3xl overflow-hidden border border-champagne-500/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Boda en Antigua Guatemala"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-carbon-950/40 to-transparent p-6 flex flex-col justify-end">
                <span className="font-serif italic text-2xl font-bold text-white">
                  Camila &amp; Andrés • Convento de las Capuchinas
                </span>
                <span className="text-xs text-champagne-300">
                  Antigua Guatemala • Evento de Demostración Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="px-4 border-t border-champagne-300/40 pt-12 max-w-7xl mx-auto text-center space-y-4">
        <div className="font-serif italic text-3xl font-bold text-carbon-900">
          AUREA
        </div>
        <p className="text-xs text-carbon-500 max-w-md mx-auto">
          Plataforma SaaS de Invitaciones Digitales Inteligentes, Seating Chart y Control de Acceso QR para bodas y eventos de alta gama en Latinoamérica.
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-carbon-400 pt-2 font-mono">
          <span>AWS DynamoDB + S3 Ready</span>
          <span>•</span>
          <span>Next.js App Router</span>
          <span>•</span>
          <span>TypeScript &amp; Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
