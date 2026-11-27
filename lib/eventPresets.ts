import { EventCategoryKey, ThemePresetKey, Custom3dSlots, ItineraryItem } from "./types";

export interface FestivityPreset {
  key: EventCategoryKey;
  label: string;
  category: string;
  iconTag: string;
  description: string;
  defaultTitle: string;
  dressCodeTitle: string;
  dressCodeDescription: string;
  itinerary: ItineraryItem[];
  slots: Custom3dSlots;
  sample3dNames: string[];
}

export const FESTIVITY_PRESETS: Record<EventCategoryKey, FestivityPreset> = {
  BODA: {
    key: "BODA",
    label: "Boda",
    category: "Bodas",
    iconTag: "💍",
    description: "Romance imperial, vals nupcial y cena colonial",
    defaultTitle: "Nuestra Boda",
    dressCodeTitle: "Etiqueta / Formal",
    dressCodeDescription:
      "Damas: Vestido largo formal en tonos cálidos o joya (evitar blanco). Caballeros: Traje formal o Guayabera de gala.",
    itinerary: [
      {
        time: "16:30",
        title: "Ceremonia Religiosa / Simbólica",
        location: "Ruinas del Templo Principal",
        description: "Las puertas del templo cerrarán 10 minutos antes del inicio.",
        iconName: "church",
      },
      {
        time: "18:00",
        title: "Cóctel de Bienvenida",
        location: "Claustro Redondo",
        description: "Música en vivo de arpa y violines con mixología de autor.",
        iconName: "cocktail",
      },
      {
        time: "19:30",
        title: "Banquete Imperial & Brindis",
        location: "Jardín de los Naranjos",
        description: "Cena gourmet de cuatro tiempos maridada con vinos reserva.",
        iconName: "utensils",
      },
      {
        time: "21:30",
        title: "Primer Baile & Gran Fiesta",
        location: "Plaza Central",
        description: "Banda en vivo, DJ y coctelería hasta el amanecer.",
        iconName: "music",
      },
    ],
    slots: {
      slot_1: { modelUrl: "/models/rosaglb.glb", finish: "rose_gold", name: "Rosa Eterna de Amor" },
      slot_2: { modelUrl: "/models/cisne.glb", finish: "pearl_gold", name: "Cisne Majestuoso" },
      slot_3: { modelUrl: "/models/copas.glb", finish: "silver_crystal", name: "Dúo de Copas de Brindis" },
      slot_4: { modelUrl: "/models/mariposa.glb", finish: "gold", name: "Mariposa de Bendición" },
    },
    sample3dNames: ["Rosa Eterna", "Cisne Majestuoso", "Copas de Brindis", "Mariposa de Oro"],
  },
  XV_ANOS: {
    key: "XV_ANOS",
    label: "XV Años",
    category: "XV Años",
    iconTag: "👑",
    description: "Cuento de hadas, tiara real, vals y alfombra roja",
    defaultTitle: "Mis XV Años",
    dressCodeTitle: "Gala",
    dressCodeDescription:
      "Damas: Vestido de noche formal (reservar tonos de la quinceañera). Caballeros: Traje formal oscuro.",
    itinerary: [
      {
        time: "18:00",
        title: "Misa de Acción de Gracias",
        location: "Capilla Principal",
        description: "Agradecimiento solemne con familiares, chambelanes y padrinos.",
        iconName: "church",
      },
      {
        time: "19:30",
        title: "Recepción & Alfombra de Bienvenida",
        location: "Jardín de Recepción",
        description: "Cóctel sin alcohol de autor, canapés gourmet y sesión de fotos.",
        iconName: "cocktail",
      },
      {
        time: "20:45",
        title: "Vals de Honor & Brindis Familiar",
        location: "Salón de Gala",
        description: "Tradicional cambio de zapatilla, vals con papá y brindis de honor.",
        iconName: "music",
      },
      {
        time: "22:00",
        title: "Fiesta con DJ & Sorpresas",
        location: "Pista Principal",
        description: "Pista iluminada, cabina de fotos instantánea y show de luces.",
        iconName: "sparkles",
      },
    ],
    slots: {
      slot_1: { modelUrl: "/models/tiara-xva.glb", finish: "gold", name: "Tiara Imperial" },
      slot_2: { modelUrl: "/models/CarruajeReal.glb", finish: "gold", name: "Carruaje Real" },
      slot_3: { modelUrl: "/models/abanico.glb", finish: "rose_gold", name: "Abanico de Época" },
      slot_4: { modelUrl: "/models/disco.glb", finish: "silver_crystal", name: "Esfera Disco" },
    },
    sample3dNames: ["Tiara Imperial", "Carruaje Real", "Abanico de Gala", "Esfera Disco"],
  },
  BAUTIZO: {
    key: "BAUTIZO",
    label: "Bautizo / 1ra Comunión",
    category: "Bautizos",
    iconTag: "🕊️",
    description: "Ceremonia sacra, bendición familiar y almuerzo en jardín",
    defaultTitle: "Bautizo",
    dressCodeTitle: "Jardín Chic",
    dressCodeDescription:
      "Tonos lino, blanco, pastel o florales suaves. Calzado cómodo apto para césped.",
    itinerary: [
      {
        time: "11:30",
        title: "Ceremonia Religiosa",
        location: "Parroquia San Francisco",
        description: "Sacramento del Santo Bautismo y bendición solemne de los padrinos.",
        iconName: "church",
      },
      {
        time: "13:00",
        title: "Almuerzo Familiar & Brindis",
        location: "Jardín Las Bugambilias",
        description: "Comida campestre de autor, música acústica en vivo y brindis.",
        iconName: "utensils",
      },
      {
        time: "15:00",
        title: "Sobremesa, Dulces & Fotografías",
        location: "Pérgola Central",
        description: "Barra de postres artesanales, recuerdos del bautizo y fotos de familia.",
        iconName: "sparkles",
      },
    ],
    slots: {
      slot_1: { modelUrl: "/models/cruz.glb", finish: "gold", name: "Cruz de Bendición" },
      slot_2: { modelUrl: "/models/mariposa.glb", finish: "pearl_gold", name: "Mariposa de Gracia" },
      slot_3: { modelUrl: "/models/rosaglb.glb", finish: "pearl_gold", name: "Rosa Sacra" },
      slot_4: { modelUrl: "/models/globos.glb", finish: "pearl_gold", name: "Globos de Celebración" },
    },
    sample3dNames: ["Cruz de Bendición", "Mariposa de Gracia", "Rosa Sacra", "Globos de Fiesta"],
  },
  CUMPLES: {
    key: "CUMPLES",
    label: "Cumpleaños / Aniversario",
    category: "Cumpleaños",
    iconTag: "🥂",
    description: "Homenaje de vida, coctelería fina, cena y pista abierta",
    defaultTitle: "Celebración de Cumpleaños",
    dressCodeTitle: "Cóctel",
    dressCodeDescription:
      "Caballeros: Saco sport formal o traje sin corbata. Damas: Vestido de cóctel elegante.",
    itinerary: [
      {
        time: "19:00",
        title: "Bienvenida & Coctelería de Autor",
        location: "Terraza Lounge",
        description: "Recepción con cócteles insignia y barra de canapés de bienvenida.",
        iconName: "cocktail",
      },
      {
        time: "20:30",
        title: "Cena Gourmet de Celebración",
        location: "Salón Principal",
        description: "Menú especial maridado seleccionado para homenajear al festejado.",
        iconName: "utensils",
      },
      {
        time: "22:00",
        title: "Brindis, Pastel & Palabras",
        location: "Área de Gala",
        description: "Brindis con champagne, corte de pastel de aniversario y palabras de amigos.",
        iconName: "utensils",
      },
      {
        time: "22:45",
        title: "Música en Vivo & Pista Abierta",
        location: "Pista Central",
        description: "Celebración y baile con los mejores amigos y familia.",
        iconName: "music",
      },
    ],
    slots: {
      slot_1: { modelUrl: "/models/globos.glb", finish: "gold", name: "Ramillete de Globos" },
      slot_2: { modelUrl: "/models/frasco.glb", finish: "silver_crystal", name: "Frasco de Deseos" },
      slot_3: { modelUrl: "/models/disco.glb", finish: "silver_crystal", name: "Esfera Disco" },
      slot_4: { modelUrl: "/models/Copa.glb", finish: "gold", name: "Copa de Brindis" },
    },
    sample3dNames: ["Ramillete de Globos", "Frasco de Elixir", "Esfera Disco", "Copa de Brindis"],
  },
  CORPORATIVO: {
    key: "CORPORATIVO",
    label: "Corporativo / Gala",
    category: "Corporativo",
    iconTag: "🏛️",
    description: "Alta distinción empresarial, keynote, premios y networking",
    defaultTitle: "Gala Anual Corporativa",
    dressCodeTitle: "Business Formal / Rigurosa Etiqueta",
    dressCodeDescription:
      "Caballeros: Traje formal oscuro o esmoquin. Damas: Vestido formal de noche o sastre de gala.",
    itinerary: [
      {
        time: "18:30",
        title: "Registro & Cóctel de Bienvenida",
        location: "Foyer Principal",
        description: "Acreditación de invitados y cóctel de bienvenida para networking.",
        iconName: "cocktail",
      },
      {
        time: "19:30",
        title: "Keynote / Presentación & Cena",
        location: "Gran Salón",
        description: "Palabras de apertura, memoria de logros institucionales y cena ejecutiva.",
        iconName: "utensils",
      },
      {
        time: "21:15",
        title: "Brindis Institucional & Premiación",
        location: "Estrado de Honor",
        description: "Entrega de galardones a la excelencia y brindis con la junta directiva.",
        iconName: "sparkles",
      },
      {
        time: "22:00",
        title: "Networking & Música Ambiental",
        location: "Lounge Ejecutivo",
        description: "Espacio libre para alianzas, networking y música de cámara en vivo.",
        iconName: "music",
      },
    ],
    slots: {
      slot_1: { modelUrl: "/models/Copa.glb", finish: "silver_crystal", name: "Copa de Gala" },
      slot_2: { modelUrl: "/models/abanico.glb", finish: "gold", name: "Abanico de Distinción" },
      slot_3: { modelUrl: "/models/copas.glb", finish: "silver_crystal", name: "Dúo de Copas" },
      slot_4: { modelUrl: "/models/frasco.glb", finish: "gold", name: "Frasco de Honor" },
    },
    sample3dNames: ["Copa de Gala", "Abanico de Distinción", "Dúo de Copas", "Frasco de Honor"],
  },
};

export interface ThemePresetConfig {
  key: ThemePresetKey;
  name: string;
  subtitle: string;
  bgHex: string;
  inkHex: string;
  accentHex: string;
  liningHex: string;
  paletteColors: string[];
  paletteNames: string[];
}

export const THEME_PRESETS: Record<ThemePresetKey, ThemePresetConfig> = {
  ATELIER_MARFIL: {
    key: "ATELIER_MARFIL",
    name: "Atelier Marfil",
    subtitle: "Clásico Papel Algodón & Oro Viejo",
    bgHex: "#F7F4EE",
    inkHex: "#181715",
    accentHex: "#A88444",
    liningHex: "#1B2B23",
    paletteColors: ["#F7F4EE", "#181715", "#A88444", "#1B2B23", "#D9C8A9"],
    paletteNames: ["Papel Algodón", "Tinta Negra", "Oro Viejo", "Verde Bosque", "Arena Nácar"],
  },
  NOCHE_ESMERALDA: {
    key: "NOCHE_ESMERALDA",
    name: "Noche Esmeralda",
    subtitle: "Gala Nocturna & Champán",
    bgHex: "#16241D",
    inkHex: "#FBF9F4",
    accentHex: "#DFC38C",
    liningHex: "#0F1A14",
    paletteColors: ["#16241D", "#FBF9F4", "#DFC38C", "#0F1A14", "#4A5D4E"],
    paletteNames: ["Verde Bosque Profundo", "Blanco Seda", "Champán Dorado", "Terciopelo Oscuro", "Pino Nórdico"],
  },
  ROSA_ANTIGUA: {
    key: "ROSA_ANTIGUA",
    name: "Rosa Antigua",
    subtitle: "Romántico Perlado & Oro Rosa",
    bgHex: "#FAF5F2",
    inkHex: "#2A2224",
    accentHex: "#C98E82",
    liningHex: "#4A3538",
    paletteColors: ["#FAF5F2", "#2A2224", "#C98E82", "#4A3538", "#EBDCD7"],
    paletteNames: ["Crema Cálido", "Cereza Tinta", "Oro Rosa", "Burdeos Antiguo", "Nácar Rosado"],
  },
};

export const PLAN_CONFIGS = {
  ESENCIAL: {
    plan: "ESENCIAL" as const,
    name: "Plan Esencial",
    guestsLimit: 100,
    priceGTQ: 1200,
    description: "Hasta 100 invitados · 1 Celebración",
  },
  FIRMA: {
    plan: "FIRMA" as const,
    name: "Plan Firma",
    guestsLimit: 200,
    priceGTQ: 2400,
    description: "Hasta 200 invitados · Experiencia completa",
  },
  GRAN_CELEBRACION: {
    plan: "GRAN_CELEBRACION" as const,
    name: "Gran Celebración",
    guestsLimit: 350,
    priceGTQ: 3800,
    description: "Hasta 350 invitados · Modo TV & Kit del Día",
  },
  PLANNER_PRO: {
    plan: "PLANNER_PRO" as const,
    name: "Planner Pro",
    guestsLimit: 9999,
    priceGTQ: 8500,
    description: "Eventos Ilimitados · Marca Blanca",
  },
};
