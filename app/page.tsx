"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Compass,
  ArrowUpRight,
  ChevronRight,
  Mail,
  Wine,
  Camera,
} from "lucide-react";
import { PhoneMockup } from "@/components/landing/PhoneMockup";

const WEDDING_STORIES = [
  {
    id: "antigua",
    title: "Camila & Andrés",
    venue: "Convento de las Capuchinas • Antigua Guatemala",
    description: "Una celebración colonial entre muros de cantera del siglo XVIII, velas aromáticas y buganvilias fucsia.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    palette: ["#C5A059", "#4A5D4E", "#8C6D46", "#FAF7F2"],
    token: "rivas-molina",
  },
  {
    id: "tulum",
    title: "Valentina & Mateo",
    venue: "Casa Malca • Tulum, México",
    description: "Un atardecer frente al mar caribeño, brisa de salitre, lino blanco y coctelería de autor.",
    image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80",
    palette: ["#DFBA73", "#2D4030", "#C19A6B", "#FDFBF7"],
    token: "carlos-mendoza",
  },
  {
    id: "valle",
    title: "Sofía & Sebastián",
    venue: "Bodegas Monte Xanic • Valle de Guadalupe",
    description: "Cena bajo las estrellas entre viñedos centenarios, copas de tinto reserva y violines en vivo.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    palette: ["#6B1724", "#C5A059", "#243323", "#F5EFE6"],
    token: "hernandez-diaz",
  },
];

export default function HomePage() {
  const [selectedStory, setSelectedStory] = useState(WEDDING_STORIES[0]);

  return (
    <div className="space-y-28 pb-28">
      {/* 1. Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EBDD] border border-[#DFC9A6] text-[#78592C] text-xs font-serif italic tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Papelería nupcial con sensibilidad humana</span>
            </div>

            <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-[5.2rem] text-carbon-900 leading-[1.02] tracking-tight">
              Una invitación con alma, diseñada para <span className="gold-text-gradient font-normal">emocionar</span> desde el primer segundo.
            </h1>

            <p className="text-base sm:text-xl text-carbon-600 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
              Creamos la carta digital de tu boda desde cero, con su historia, sus fotos y el nombre de cada familia. Tus invitados confirman con un toque, y tú organizas mesas, alergias y la bienvenida sin estrés.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/invitacion/rivas-molina"
                className="px-7 py-4 rounded-full bg-[#1E1C1A] text-[#FAF7F2] hover:bg-carbon-800 font-semibold text-xs uppercase tracking-widest transition-all shadow-luxury hover:scale-[1.02] flex items-center gap-2 group"
              >
                <span>Abrir invitación de ejemplo</span>
                <ArrowRight className="w-4 h-4 text-[#DFC07D] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard"
                className="px-6 py-4 rounded-full bg-white hover:bg-[#F5EFE6] border border-[#E0D4BE] text-carbon-800 font-semibold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
              >
                <span>Acceso Novios &amp; Planner</span>
              </Link>
            </div>

            {/* Human Pillars under Hero */}
            <div className="pt-8 border-t border-[#E8DFC8]/70 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
              <div className="space-y-1">
                <span className="font-serif italic text-2xl font-bold text-carbon-900 block">
                  A la medida
                </span>
                <p className="text-xs text-carbon-500 font-sans leading-relaxed">
                  Cada detalle pensado con su historia, paleta y música.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-serif italic text-2xl font-bold text-[#8C6D46] block">
                  Personalizada
                </span>
                <p className="text-xs text-carbon-500 font-sans leading-relaxed">
                  Cada familia recibe su sobre con su propio nombre.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-serif italic text-2xl font-bold text-[#4A5D4E] block">
                  Sin estrés
                </span>
                <p className="text-xs text-carbon-500 font-sans leading-relaxed">
                  Confirmaciones, mesas y recepción en calma absoluta.
                </p>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="lg:col-span-5 relative">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* 2. Interactive Stories Gallery */}
      <section id="galeria" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-serif italic text-[#8C6D46] tracking-widest uppercase">
            Inspiración Real
          </span>
          <h2 className="font-serif italic text-4xl sm:text-5xl text-carbon-900">
            Historias que cobran vida en cada sobre
          </h2>
          <p className="text-sm sm:text-base text-carbon-600">
            Cada pareja tiene una atmósfera única. Toca cualquiera para ver cómo se siente su invitación real.
          </p>
        </div>

        {/* Story Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {WEDDING_STORIES.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStory(st)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-serif italic transition-all ${
                selectedStory.id === st.id
                  ? "bg-[#1E1C1A] text-[#FAF7F2] shadow-md"
                  : "bg-white text-carbon-700 hover:bg-[#F3EFEA] border border-[#E0D4BE]"
              }`}
            >
              {st.title}
            </button>
          ))}
        </div>

        {/* Featured Wedding Card */}
        <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-luxury overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-72 sm:h-96 lg:h-auto min-h-[380px]">
            <img
              src={selectedStory.image}
              alt={selectedStory.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <span className="font-serif italic text-2xl sm:text-3xl font-bold block">
                {selectedStory.title}
              </span>
              <span className="text-xs text-zinc-200">
                {selectedStory.venue}
              </span>
            </div>
          </div>

          <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#F3EBDD] text-[#7A5C30] text-xs font-serif italic border border-[#DFC9A6]">
                Boda de Destino
              </div>
              <h3 className="font-serif italic text-3xl sm:text-4xl text-carbon-900 font-bold leading-tight">
                {selectedStory.title}
              </h3>
              <p className="text-sm sm:text-base text-carbon-600 leading-relaxed font-sans">
                {selectedStory.description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-serif italic text-carbon-500 block">
                Paleta de la celebración:
              </span>
              <div className="flex items-center gap-3">
                {selectedStory.palette.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8DFC8]/60 flex items-center justify-between">
              <Link
                href={`/invitacion/${selectedStory.token}`}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7A5C30] hover:text-carbon-900 transition-colors group"
              >
                <span>Abrir la carta de {selectedStory.title.split("&")[0].trim()}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/kit-del-dia"
                className="text-xs text-carbon-500 hover:underline"
              >
                Ver qué ven en la fiesta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Emotional Comparison: Lo que una invitación impresa o PDF no puede hacer por ti */}
      <section id="como-funciona" className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-serif italic text-[#8C6D46] tracking-widest uppercase">
            Paz Mental para los Novios
          </span>
          <h2 className="font-serif italic text-4xl sm:text-5xl text-carbon-900">
            Lo que una invitación impresa o PDF no puede hacer por ti
          </h2>
          <p className="text-sm sm:text-base text-carbon-600">
            Organizar una boda debe ser una etapa de emoción compartida, no de perseguir mensajes ni de resolver imprevistos en la puerta.
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-[#E8DFC8] shadow-luxury divide-y divide-[#E8DFC8]/70 overflow-hidden">
          {/* Item 1 */}
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF7F2]/60 transition-colors">
            <div className="md:w-1/2 space-y-1">
              <span className="text-xs font-serif italic text-red-700/80 uppercase tracking-wider">
                El dolor de siempre
              </span>
              <p className="text-sm font-sans text-carbon-700">
                Perseguir confirmaciones por WhatsApp una por una durante semanas, anotando cambios en libretas o notas sueltas.
              </p>
            </div>
            <div className="md:w-1/2 p-4 rounded-2xl bg-[#F4EFE6] border border-[#DFC9A6] space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif italic font-bold text-[#7A5C30]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46]" />
                <span>Con AUREA:</span>
              </div>
              <p className="text-xs text-carbon-700 leading-relaxed font-sans">
                Las respuestas llegan solas con un toque, con sus nombres confirmados, notas de alergias para cocina y dedicatorias de cariño.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF7F2]/60 transition-colors">
            <div className="md:w-1/2 space-y-1">
              <span className="text-xs font-serif italic text-red-700/80 uppercase tracking-wider">
                El dolor de siempre
              </span>
              <p className="text-sm font-sans text-carbon-700">
                Invitados que llevan acompañantes de más sin avisar, generando sobrecupo y situaciones incómodas de presupuesto.
              </p>
            </div>
            <div className="md:w-1/2 p-4 rounded-2xl bg-[#F4EFE6] border border-[#DFC9A6] space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif italic font-bold text-[#7A5C30]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46]" />
                <span>Con AUREA:</span>
              </div>
              <p className="text-xs text-carbon-700 leading-relaxed font-sans">
                Cada sobre tiene asignados exactamente los lugares que reservaste con cariño para ellos, sin malentendidos.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF7F2]/60 transition-colors">
            <div className="md:w-1/2 space-y-1">
              <span className="text-xs font-serif italic text-red-700/80 uppercase tracking-wider">
                El dolor de siempre
              </span>
              <p className="text-sm font-sans text-carbon-700">
                Filas y confusión en la entrada con hojas de papel impresas, buscando nombres y mesas con la gente de pie.
              </p>
            </div>
            <div className="md:w-1/2 p-4 rounded-2xl bg-[#F4EFE6] border border-[#DFC9A6] space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif italic font-bold text-[#7A5C30]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46]" />
                <span>Con AUREA:</span>
              </div>
              <p className="text-xs text-carbon-700 leading-relaxed font-sans">
                Un pase cálido en su celular con su mesa asignada y su clave de Wi-Fi para que su única tarea sea disfrutar y abrazarte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Atelier for Wedding Planners */}
      <section id="planners" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-28">
        <div className="rounded-3xl bg-[#1E1C1A] text-white p-8 sm:p-14 border border-[#C5A059]/30 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A059]/20 text-[#DFC07D] text-xs font-serif italic border border-[#C5A059]/30">
                <Heart className="w-3.5 h-3.5 fill-[#DFC07D]" />
                <span>Atelier para Wedding Planners</span>
              </div>

              <h2 className="font-serif italic text-4xl sm:text-5xl text-white font-normal leading-tight">
                Para Wedding Planners: cada celebración en perfecta armonía
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
                Diseñado para quienes entienden que la magia de una boda reside en los pequeños detalles. Gestiona todas tus parejas con la calma y la elegancia que tu firma representa: listas de alergias para el chef, acomodo de mesas en tiempo real y recepción con calidez.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 font-serif italic">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xl text-[#DFC07D] block">Varias bodas a la vez</span>
                  <p className="text-xs font-sans text-zinc-400 mt-1">Cambia entre celebraciones con un solo toque.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xl text-emerald-400 block">Pantalla de fiesta</span>
                  <p className="text-xs font-sans text-zinc-400 mt-1">Proyección de recuerdos en vivo para la recepción.</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C5A059] hover:bg-[#B88E3E] text-carbon-950 font-bold text-xs uppercase tracking-widest shadow-gold transition-all"
                >
                  <span>Abrir el panel de novios &amp; planners</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Atelier Mockup */}
            <div className="relative rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Convento de las Capuchinas"
                className="w-full h-88 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1C1A] via-[#1E1C1A]/40 to-transparent p-6 flex flex-col justify-end">
                <span className="font-serif italic text-2xl text-white font-bold">
                  Boda de Camila &amp; Andrés
                </span>
                <span className="text-xs text-[#DFC07D] font-sans">
                  Convento de las Capuchinas • En curso
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Editorial Footer */}
      <footer className="px-4 border-t border-[#E8DFC8] pt-14 max-w-7xl mx-auto text-center space-y-6">
        <Link href="/" className="font-serif italic text-4xl text-carbon-900 inline-block">
          AUREA
        </Link>
        <p className="font-serif italic text-sm text-carbon-600 max-w-md mx-auto leading-relaxed">
          &ldquo;El amor se celebra con calma, con los que amamos y con los detalles que tocan el corazón.&rdquo;
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-carbon-500 font-sans uppercase tracking-widest pt-2">
          <Link href="/invitacion/rivas-molina" className="hover:text-carbon-900 transition-colors">
            Invitación Ejemplo
          </Link>
          <span>•</span>
          <Link href="/kit-del-dia" className="hover:text-carbon-900 transition-colors">
            Kit de la Fiesta
          </Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:text-carbon-900 transition-colors">
            Acceso Novios
          </Link>
        </div>

        <div className="text-[11px] text-carbon-400 font-sans pt-4">
          AUREA &copy; 2026 • Papelería digital con alma para bodas inolvidables.
        </div>
      </footer>
    </div>
  );
}
