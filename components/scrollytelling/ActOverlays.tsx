"use client";

import React from "react";
import {
  ChevronDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
  Heart,
  MessageCircle,
  QrCode,
  Users,
  Utensils,
  Camera,
} from "lucide-react";
import { MOCK_EVENTS } from "@/lib/db/mock-data";

export interface CelebrationCategory {
  id: string;
  label: string;
  eventId: string;
  token: string;
  title: string;
  subtitle: string;
  recipient: string;
  venue: string;
  date: string;
  accentColor: string;
  tagline: string;
}

export const CELEBRATION_CATEGORIES: CelebrationCategory[] = [
  {
    id: "Bodas",
    label: "Bodas",
    eventId: "camila-andres-2025",
    token: "rivas-molina",
    title: "Camila & Andrés",
    subtitle: "Nuestra Boda",
    recipient: "Familia Rivas Molina",
    venue: "Convento de las Capuchinas · Antigua Guatemala",
    date: "Sábado, 28 de Noviembre de 2026",
    accentColor: "#C5A059",
    tagline: "El romance colonial de Antigua Guatemala entre cantera del siglo XVIII y azahares.",
  },
  {
    id: "XV Años",
    label: "Mis XV Años",
    eventId: "sofia-xv-2026",
    token: "familia-garcia",
    title: "Mis XV Años · Sofía",
    subtitle: "Mis XV Años",
    recipient: "Familia García Valenzuela",
    venue: "Hacienda de los Morales · Polanco, CDMX",
    date: "Sábado, 17 de Octubre de 2026",
    accentColor: "#D4AF37",
    tagline: "Elegancia editorial, vals de honor, pista de baile iluminada y álbum en vivo.",
  },
  {
    id: "Bautizos",
    label: "Bautizos & Baby Shower",
    eventId: "mateo-bautizo-2026",
    token: "padrinos-alvarez",
    title: "Bautizo de Mateo",
    subtitle: "Bautizo & Bendición",
    recipient: "Padrinos de Bautizo (Carlos & Elena)",
    venue: "Jardines del Molino · San Miguel de Allende",
    date: "Domingo, 14 de Junio de 2026",
    accentColor: "#8FA382",
    tagline: "Celebraciones íntimas en jardín, comida campestre y bendición familiar.",
  },
  {
    id: "Cumpleaños",
    label: "Cumpleaños",
    eventId: "roberto-50-2026",
    token: "amigos-roberto",
    title: "50 Años · Roberto Treviño",
    subtitle: "Celebración de Aniversario",
    recipient: "Ing. Mauricio Treviño & Pareja",
    venue: "The Oak Room · San Pedro Garza García",
    date: "Viernes, 21 de Agosto de 2026",
    accentColor: "#C2A676",
    tagline: "Aniversarios y cumpleaños memorables entre amigos entrañables, coctelería y jazz.",
  },
  {
    id: "Corporativo",
    label: "Corporativo & Galas",
    eventId: "cumbre-ibero-2026",
    token: "delegacion-mexico",
    title: "Gala Anual de Liderazgo",
    subtitle: "Gala Anual",
    recipient: "Delegación Directiva México",
    venue: "Gran Salón Bellas Artes · Bogotá",
    date: "Jueves, 3 de Diciembre de 2026",
    accentColor: "#4A7C59",
    tagline: "Cumbres y galas benéficas con protocolo impecable y bienvenida fluida con pase QR.",
  },
];

interface ActOverlaysProps {
  progress: number;
  activeCategory: CelebrationCategory;
  onSelectCategory: (cat: CelebrationCategory) => void;
  onOpenInvitation: (token: string, eventId: string) => void;
  onOpenDayOf: () => void;
  onOpenHost: () => void;
  onOpenContact: () => void;
  onScrollToAct: (targetProgress: number) => void;
}

export function ActOverlays({
  progress,
  activeCategory,
  onSelectCategory,
  onOpenInvitation,
  onOpenDayOf,
  onOpenHost,
  onOpenContact,
  onScrollToAct,
}: ActOverlaysProps) {
  // Helper to compute smooth opacity and translateY based on progress window
  const getActStyle = (start: number, peakStart: number, peakEnd: number, end: number) => {
    let opacity = 0;
    let translateY = 20;

    if (progress >= start && progress < peakStart) {
      const t = (progress - start) / (peakStart - start);
      opacity = t;
      translateY = 20 * (1 - t);
    } else if (progress >= peakStart && progress <= peakEnd) {
      opacity = 1;
      translateY = 0;
    } else if (progress > peakEnd && progress <= end) {
      const t = (progress - peakEnd) / (end - peakEnd);
      opacity = 1 - t;
      translateY = -20 * t;
    }

    const isVisible = opacity > 0.01;
    return {
      opacity,
      transform: `translateY(${translateY}px)`,
      pointerEvents: isVisible && opacity > 0.6 ? ("auto" as const) : ("none" as const),
      display: isVisible ? "flex" : "none",
    };
  };

  const act1Style = getActStyle(0.0, 0.02, 0.16, 0.22);
  const act2Style = getActStyle(0.2, 0.26, 0.38, 0.44);
  const act3Style = getActStyle(0.42, 0.48, 0.62, 0.67);
  const act4Style = getActStyle(0.65, 0.7, 0.82, 0.87);
  const act5Style = getActStyle(0.85, 0.9, 1.0, 1.05);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* ============================================================== */}
      {/* ACTO 1: EL ENCUENTRO (0% - 20%)                                */}
      {/* ============================================================== */}
      <div
        style={act1Style}
        className="absolute inset-0 items-center justify-start px-6 md:px-20 lg:px-28 transition-opacity duration-150"
      >
        <div className="max-w-xl text-left space-y-6 pt-12">
          <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-stone-900 leading-[1.05] tracking-tight font-normal">
            Cada gran historia merece ser anunciada con alma.
          </h1>

          <p className="text-[#27272A] text-base md:text-lg leading-relaxed font-sans max-w-lg opacity-100">
            Diseñamos cartas digitales a la medida para bodas, XV años, bautizos y momentos
            únicos. Cada familia recibe su sobre personal, confirma con un toque y tú organizas
            todo en perfecta calma.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenInvitation("rivas-molina", "camila-andres-2025")}
              className="pointer-events-auto px-7 py-3.5 rounded-full bg-stone-900 text-stone-50 hover:bg-[#8F7138] text-xs font-semibold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 group cursor-pointer"
            >
              <span>Abrir carta de muestra</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onScrollToAct(0.28)}
              className="pointer-events-auto px-5 py-3.5 rounded-full bg-white/80 hover:bg-white text-stone-700 text-xs font-medium border border-stone-300/80 transition-all shadow-sm"
            >
              Cómo se vive
            </button>
          </div>

          <div className="pt-8 flex items-center gap-2 text-stone-600 text-xs font-serif italic">
            <ChevronDown className="w-4 h-4 animate-bounce text-[#8F7138]" />
            <span>Desliza para abrir la carta</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ACTO 2: LA APERTURA (20% - 42%)                                */}
      {/* ============================================================== */}
      <div
        style={act2Style}
        className="absolute inset-0 items-center justify-start px-6 md:px-20 lg:px-28 transition-opacity duration-150"
      >
        <div className="max-w-xl text-left space-y-6 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EBDD] border border-[#DECDB3] text-[#7A5C30] text-xs font-serif italic">
            <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
            <span>La Emoción de Abrirla</span>
          </div>

          <h2 className="font-serif italic text-3xl sm:text-5xl lg:text-6xl text-stone-900 leading-[1.08] tracking-tight font-normal">
            No es un archivo frío. Es una carta hecha para ellos.
          </h2>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed font-sans">
            Tus invitados reciben un enlace personal por WhatsApp. Al tocarlo, el sobre se desliza
            y su propio sello de lacre se desprende, revelando el nombre de su familia, su historia,
            música y los pases reservados con cariño.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3 text-stone-700 text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#8F7138] shrink-0 mt-0.5" />
              <span>
                <strong>Pases asignados sin malentendidos:</strong> cada familia sabe cuántos
                lugares tiene reservados.
              </span>
            </div>
            <div className="flex items-start gap-3 text-stone-700 text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#8F7138] shrink-0 mt-0.5" />
              <span>
                <strong>Música, itinerario y mapa:</strong> todo lo necesario en la palma de su
                mano, sin descargar nada.
              </span>
            </div>
            <div className="flex items-start gap-3 text-stone-700 text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#8F7138] shrink-0 mt-0.5" />
              <span>
                <strong>Confirmación en un toque:</strong> con notas de alergias y mensajes de
                felicitación directos.
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onScrollToAct(0.52)}
              className="pointer-events-auto inline-flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-[#7A5C30] hover:text-stone-900 transition-colors"
            >
              <span>Ver todas las celebraciones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ACTO 3: CELEBRACIONES MULTI-EVENTO (42% - 65%)                 */}
      {/* ============================================================== */}
      <div
        style={act3Style}
        className="absolute inset-0 items-center justify-start px-6 md:px-20 lg:px-28 transition-opacity duration-150"
      >
        <div className="max-w-xl text-left space-y-6 pt-8">
          <p className="font-serif italic text-[#8F7138] text-lg">
            Atmósferas a la medida
          </p>

          <h2 className="font-serif italic text-3xl sm:text-5xl text-stone-900 leading-[1.1] tracking-tight font-normal">
            Para cada momento que marca la vida
          </h2>

          <p className="text-stone-600 text-sm md:text-base leading-relaxed">
            Una boda colonial, unos quince años de ensueño, el bautizo de un hijo o una gala
            institucional. Cada carta adopta la paleta, tipografía y espíritu de tu fecha.
          </p>

          {/* Interactive Category Selector (Pointer Events Auto) */}
          <div className="pointer-events-auto flex flex-wrap gap-2 pt-2">
            {CELEBRATION_CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeCategory.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-serif tracking-wider transition-all duration-300 ${
                    isSelected
                      ? "bg-stone-900 text-stone-50 shadow-md scale-105"
                      : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Active Event Preview Summary Card */}
          <div className="pointer-events-auto p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-lg space-y-3 max-w-md">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#8F7138] font-serif font-medium">
                {activeCategory.subtitle}
              </span>
              <h3 className="font-serif italic text-2xl text-stone-900 font-semibold mt-0.5">
                {activeCategory.title}
              </h3>
            </div>

            <p className="text-xs text-stone-600 italic">
              {activeCategory.tagline}
            </p>

            <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8F7138]" />
                {activeCategory.date.split("·")[0]}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8F7138]" />
                {activeCategory.venue.split("·")[0]}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  onOpenInvitation(activeCategory.token, activeCategory.eventId)
                }
                className="w-full py-3 rounded-full bg-stone-900 hover:bg-[#8F7138] text-stone-50 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow"
              >
                <span>Abrir esta invitación completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ACTO 4: EL DÍA DE LA FIESTA (65% - 85%)                        */}
      {/* ============================================================== */}
      <div
        style={act4Style}
        className="absolute inset-0 items-center justify-start px-6 md:px-20 lg:px-28 transition-opacity duration-150"
      >
        <div className="max-w-xl text-left space-y-6 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EBDD] border border-[#DECDB3] text-[#7A5C30] text-xs font-serif italic">
            <QrCode className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>El Día de la Celebración</span>
          </div>

          <h2 className="font-serif italic text-3xl sm:text-5xl lg:text-6xl text-stone-900 leading-[1.08] tracking-tight font-normal">
            La calma de recibir a todos en armonía
          </h2>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed font-sans">
            Tus invitados confirman con un toque, acomodas tus mesas sin estrés y la bienvenida
            en recepción fluye con código QR, clave de Wi-Fi y álbum colaborativo en vivo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-sm space-y-1">
              <QrCode className="w-5 h-5 text-[#8F7138]" />
              <p className="font-serif text-sm font-semibold text-stone-900">Pase QR</p>
              <p className="text-xs text-stone-500">Recepción fluida sin listas en papel</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-sm space-y-1">
              <Utensils className="w-5 h-5 text-[#8F7138]" />
              <p className="font-serif text-sm font-semibold text-stone-900">Tu Mesa</p>
              <p className="text-xs text-stone-500">Buscador instantáneo por apellido</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-sm space-y-1">
              <Camera className="w-5 h-5 text-[#8F7138]" />
              <p className="font-serif text-sm font-semibold text-stone-900">Álbum Vivo</p>
              <p className="text-xs text-stone-500">Fotos de todos en la noche</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenDayOf}
              className="pointer-events-auto px-7 py-3.5 rounded-full bg-stone-900 text-stone-50 hover:bg-[#8F7138] text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 group cursor-pointer"
            >
              <span>Ver experiencia el día de la fiesta</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ACTO 5: PARA ORGANIZADORES & CIERRE (85% - 100%)               */}
      {/* ============================================================== */}
      <div
        style={act5Style}
        className="absolute inset-0 items-center justify-center px-6 md:px-12 text-center transition-opacity duration-150"
      >
        <div className="max-w-3xl mx-auto space-y-6 pt-10">
          <p className="font-serif italic text-[#8F7138] text-xl">
            Para Anfitriones y Wedding Planners
          </p>

          <h2 className="font-serif italic text-3xl sm:text-5xl lg:text-6xl text-stone-900 font-normal leading-tight">
            Cada celebración en perfecta armonía
          </h2>

          <p className="text-stone-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Un espacio sereno donde conviven confirmaciones en tiempo real, menús especiales,
            acomodo de mesas y control de ingreso. Todo listo para que disfrutes tu día.
          </p>

          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenHost}
              className="px-7 py-4 rounded-full bg-stone-900 text-stone-50 hover:bg-[#8F7138] text-xs font-semibold uppercase tracking-wider transition-all shadow-xl flex items-center gap-2"
            >
              <span>Espacio de Anfitriones &amp; Planners</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/5215500000000?text=Hola%20AUREA,%20me%20gustar%C3%ADa%20dise%C3%B1ar%20una%20invitaci%C3%B3n%20para%20mi%20pr%C3%B3xima%20celebraci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-4 rounded-full bg-[#B89758] text-stone-950 font-semibold text-xs uppercase tracking-wider hover:bg-[#C8A96C] transition-all shadow-md flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Platicar por WhatsApp</span>
            </a>

            <button
              onClick={onOpenContact}
              className="px-6 py-4 rounded-full bg-white border border-stone-300 text-stone-700 hover:text-stone-900 hover:border-stone-500 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Solicitar muestra
            </button>
          </div>

          <p className="text-xs text-stone-600 pt-6 font-serif italic">
            AUREA Atelier · Diseñando recuerdos memorables
          </p>
        </div>
      </div>
    </div>
  );
}
