"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Heart, Sparkles } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/db/mock-data";

interface CelebrationsShowcaseProps {
  onOpenInvitation: (token: string, eventId: string) => void;
}

const CATEGORIES = [
  {
    id: "Bodas",
    label: "Bodas",
    eventId: "camila-andres-2025",
    token: "rivas-molina",
    recipient: "Familia Rivas Molina",
    tagline: "El romance colonial de Antigua Guatemala, haciendas y playas privadas.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
    themeName: "Atelier Colonial & Lacre Oro",
  },
  {
    id: "XV Años",
    label: "XV Años",
    eventId: "sofia-xv-2026",
    token: "familia-garcia",
    recipient: "Familia García Valenzuela",
    tagline: "Elegancia editorial, vals de honor, pista de baile y álbum en vivo.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80",
    themeName: "Noche de Gala & Esmeralda",
  },
  {
    id: "Bautizos",
    label: "Bautizos & Baby Shower",
    eventId: "mateo-bautizo-2026",
    token: "padrinos-alvarez",
    recipient: "Padrinos de Bautizo (Carlos & Elena)",
    tagline: "Celebraciones íntimas en jardín, comida campestre y bendición familiar.",
    image: "https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
    themeName: "Lino Blanco & Olivo",
  },
  {
    id: "Cumpleaños",
    label: "Cumpleaños",
    eventId: "roberto-50-2026",
    token: "amigos-roberto",
    recipient: "Ing. Mauricio Treviño & Pareja",
    tagline: "Aniversarios y cumpleaños memorables entre amigos entrañables y buena música.",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80",
    themeName: "Club Privado & Noche de Jazz",
  },
  {
    id: "Corporativo",
    label: "Corporativo",
    eventId: "cumbre-ibero-2026",
    token: "delegacion-mexico",
    recipient: "Delegación Directiva México",
    tagline: "Cumbres, galas benéficas y homenajes con protocolo impecable de bienvenida.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
    themeName: "Black Tie & Rigurosa Etiqueta",
  },
];

export function CelebrationsShowcase({ onOpenInvitation }: CelebrationsShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const activeEvent = MOCK_EVENTS[activeCategory.eventId] || MOCK_EVENTS["camila-andres-2025"];

  return (
    <section id="celebraciones" className="pt-8 pb-20 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <h2 className="font-serif italic text-4xl sm:text-6xl text-carbon-900 leading-tight">
          Diseñadas para los momentos que marcan la vida.
        </h2>
        <p className="text-base sm:text-lg text-carbon-600 font-sans leading-relaxed">
          Cada tipo de evento tiene su propia atmósfera, protocolo y lenguaje. Explora cómo adaptamos la carta, la paleta y los detalles a tu celebración.
        </p>

        {/* Clean Spacious Category Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4">
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === activeCategory.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-sans tracking-wider uppercase transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1E1C1A] text-[#FAF7F2] font-semibold shadow-md"
                    : "bg-white text-carbon-700 hover:bg-[#F3EFEA] border border-[#E0D4BE]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Event Showcase Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white border border-[#E8DFC8] shadow-luxury overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left: Atmospheric Photography with subtle zoom parallax */}
          <div className="lg:col-span-7 relative h-80 sm:h-96 lg:h-auto min-h-[440px] overflow-hidden group">
            <img
              src={activeCategory.image}
              alt={activeEvent.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#DFC07D] font-sans font-semibold">
                {activeCategory.label}
              </span>
              <p className="font-serif text-3xl sm:text-4xl font-normal">
                {activeEvent.title}
              </p>
              <p className="text-[13px] text-zinc-200 font-sans font-medium">
                {activeEvent.venueName} • {activeEvent.venueCity}
              </p>
            </div>
          </div>

          {/* Right: Invitation Detail & Action */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-[#FAF7F2]/60">
            <div className="space-y-4">
              <span className="text-[12px] font-sans uppercase tracking-[0.2em] text-[#7A5C30] font-bold block">
                {activeCategory.themeName}
              </span>

              <h3 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900 leading-tight">
                {activeEvent.title}
              </h3>

              <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
                {activeCategory.tagline}
              </p>

              {/* Envelope preview card */}
              <div className="p-4 rounded-2xl bg-white border border-[#E0D4BE] space-y-1 shadow-sm">
                <span className="text-[12px] uppercase tracking-wider text-zinc-500 font-sans block font-medium">
                  Sobre rotulado para
                </span>
                <p className="font-sans text-xl font-bold text-zinc-900">
                  {activeCategory.recipient}
                </p>
                <span className="text-[13px] text-[#7A5C30] font-sans font-medium block">
                  Pase familiar personalizado con confirmación
                </span>
              </div>
            </div>

            {/* Palette swatch */}
            <div className="space-y-2">
              <span className="text-[12px] font-sans text-zinc-600 uppercase tracking-wider block font-semibold">
                Paleta curada:
              </span>
              <div className="flex items-center gap-2.5">
                {activeEvent.paletteColors.map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Action Button: Opens full immersive viewer */}
            <div className="pt-4 border-t border-[#E8DFC8]">
              <button
                onClick={() => onOpenInvitation(activeCategory.token, activeCategory.eventId)}
                className="w-full py-4 rounded-full bg-[#18181B] text-[#FAF7F2] hover:bg-zinc-800 text-[13px] font-sans font-semibold tracking-normal uppercase transition-all shadow-md hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Abrir esta invitación completa</span>
                <ArrowRight className="w-4 h-4 text-[#DFC07D] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
