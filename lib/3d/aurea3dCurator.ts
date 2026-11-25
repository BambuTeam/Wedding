import {
  EventMeta,
  SculptureSlotKey,
  SculptureFinish,
  SculpturePosition,
  SculptureSlotConfig,
} from "@/lib/types";

// =========================================================================
// 1. CATÁLOGO MAESTRO DE LOS 13 MODELOS .GLB REALES EN public/models/
// =========================================================================
export interface Available3DModel {
  id: string;
  name: string;
  filename: string;
  modelUrl: string;
  defaultFinish: SculptureFinish;
  categoryTag: string;
  description: string;
}

export const AVAILABLE_3D_MODELS: Available3DModel[] = [
  {
    id: "tiara",
    name: "Tiara Imperial",
    filename: "tiara-xva.glb",
    modelUrl: "/models/tiara-xva.glb",
    defaultFinish: "gold",
    categoryTag: "Quince Años",
    description: "Tiara imperial con corona en oro champán y engarces en cristales Swarovski.",
  },
  {
    id: "carruaje",
    name: "Carruaje Real",
    filename: "CarruajeReal.glb",
    modelUrl: "/models/CarruajeReal.glb",
    defaultFinish: "gold",
    categoryTag: "Cuentos de Hadas & XV Años",
    description: "Carroza de gala de realeza con filigrana dorada y faroles ornamentales.",
  },
  {
    id: "abanico",
    name: "Abanico de Gala",
    filename: "abanico.glb",
    modelUrl: "/models/abanico.glb",
    defaultFinish: "rose_gold",
    categoryTag: "Gala & Época",
    description: "Abanico de encaje y varillas metálicas de alta costura.",
  },
  {
    id: "mariposa",
    name: "Mariposa de Metamorfosis",
    filename: "mariposa.glb",
    modelUrl: "/models/mariposa.glb",
    defaultFinish: "gold",
    categoryTag: "Naturaleza & Bodas",
    description: "Mariposa con alas cinceladas en oro pulido y gemas reflectivas.",
  },
  {
    id: "rosa",
    name: "Rosa Eterna",
    filename: "rosaglb.glb",
    modelUrl: "/models/rosaglb.glb",
    defaultFinish: "rose_gold",
    categoryTag: "Romance & Bodas",
    description: "Rosa escultórica con pétalos satinados y tallo en oro noble.",
  },
  {
    id: "cisne",
    name: "Cisne Majestuoso",
    filename: "cisne.glb",
    modelUrl: "/models/cisne.glb",
    defaultFinish: "pearl_gold",
    categoryTag: "Elegancia & Bodas",
    description: "Cisne de agua en acabado nacarado satinado con detalles en oro.",
  },
  {
    id: "copas",
    name: "Dúo de Copas de Brindis",
    filename: "copas.glb",
    modelUrl: "/models/copas.glb",
    defaultFinish: "silver_crystal",
    categoryTag: "Brindis & Celebración",
    description: "Pareja de copas de champán con cristal refractivo y base en plata/oro.",
  },
  {
    id: "copa",
    name: "Copa de Gala",
    filename: "Copa.glb",
    modelUrl: "/models/Copa.glb",
    defaultFinish: "silver_crystal",
    categoryTag: "Brindis Individual",
    description: "Copa de cristal tallado con efervescencia dorada interior.",
  },
  {
    id: "cruz",
    name: "Cruz de Bendición",
    filename: "cruz.glb",
    modelUrl: "/models/cruz.glb",
    defaultFinish: "gold",
    categoryTag: "Bautizo & Fe",
    description: "Cruz sacra con ornamentos en oro champán y engastes nacarados.",
  },
  {
    id: "globos",
    name: "Ramillete de Globos",
    filename: "globos.glb",
    modelUrl: "/models/globos.glb",
    defaultFinish: "pearl_gold",
    categoryTag: "Cumpleaños & Fiestas",
    description: "Ramillete de globos festivos en acabado perla metálico y destellos.",
  },
  {
    id: "disco",
    name: "Esfera Disco Party",
    filename: "disco.glb",
    modelUrl: "/models/disco.glb",
    defaultFinish: "silver_crystal",
    categoryTag: "Fiesta & Pista",
    description: "Esfera de espejos pulidos reflectivos para ambientación de baile.",
  },
  {
    id: "frasco",
    name: "Frasco de Elixir / Perfume",
    filename: "frasco.glb",
    modelUrl: "/models/frasco.glb",
    defaultFinish: "silver_crystal",
    categoryTag: "Lujo & Esencia",
    description: "Frasco de cristal labrado de perfumería fina con tapón en oro.",
  },
  {
    id: "sobre",
    name: "Sobre Real Áurea",
    filename: "sobre-invitacion.glb",
    modelUrl: "/models/sobre-invitacion.glb",
    defaultFinish: "gold",
    categoryTag: "Papelería & Sello",
    description: "Sobre de papelería física con forro bosque y sello de lacre dorado.",
  },
];

// =========================================================================
// 2. PRESETS CURADOS POR TIPO DE CELEBRACIÓN (4 RANURAS ALTERNADAS)
// =========================================================================
export type EventCategoryKey = "XV_ANOS" | "BODA" | "BAUTIZO" | "CUMPLES" | "CORPORATIVO";

export const AUREA_3D_PRESETS: Record<EventCategoryKey, Record<SculptureSlotKey, SculptureSlotConfig>> = {
  XV_ANOS: {
    slot_1: {
      id: "xv_tiara",
      slotKey: "slot_1",
      position: "top-right",
      modelUrl: "/models/tiara-xva.glb",
      name: "Tiara Imperial",
      finish: "gold",
      rotation: [0.22, -0.4, 0.08],
      scaleMultiplier: 1.0,
      badge: "Realeza de Quince Años",
      sectionTarget: "Hero / Nuestra Historia",
    },
    slot_2: {
      id: "xv_carruaje",
      slotKey: "slot_2",
      position: "mid-left",
      modelUrl: "/models/CarruajeReal.glb",
      name: "Carruaje Real",
      finish: "gold",
      rotation: [0.12, 0.45, -0.05],
      scaleMultiplier: 1.0,
      badge: "Llegada de Cuento",
      sectionTarget: "Itinerario del Día",
    },
    slot_3: {
      id: "xv_abanico",
      slotKey: "slot_3",
      position: "mid-right",
      modelUrl: "/models/abanico.glb",
      name: "Abanico de Época",
      finish: "rose_gold",
      rotation: [0.25, -0.35, 0.1],
      scaleMultiplier: 1.05,
      badge: "Elegancia y Gala",
      sectionTarget: "Dress Code & Galería",
    },
    slot_4: {
      id: "xv_disco",
      slotKey: "slot_4",
      position: "bottom-left",
      modelUrl: "/models/disco.glb",
      name: "Esfera Disco",
      finish: "silver_crystal",
      rotation: [0.1, 0.3, 0],
      scaleMultiplier: 0.95,
      badge: "Fiesta y Baile",
      sectionTarget: "Mesa de Regalos & RSVP",
    },
  },

  BODA: {
    slot_1: {
      id: "boda_rosa",
      slotKey: "slot_1",
      position: "top-right",
      modelUrl: "/models/rosaglb.glb",
      name: "Rosa Eterna de Amor",
      finish: "rose_gold",
      rotation: [0.2, -0.4, 0.08],
      scaleMultiplier: 1.0,
      badge: "Amor Eterno",
      sectionTarget: "Hero / Nuestra Historia",
    },
    slot_2: {
      id: "boda_cisne",
      slotKey: "slot_2",
      position: "mid-left",
      modelUrl: "/models/cisne.glb",
      name: "Cisne Majestuoso",
      finish: "pearl_gold",
      rotation: [0.1, 0.5, -0.05],
      scaleMultiplier: 1.05,
      badge: "Fidelidad y Gracia",
      sectionTarget: "Itinerario del Día",
    },
    slot_3: {
      id: "boda_copas",
      slotKey: "slot_3",
      position: "mid-right",
      modelUrl: "/models/copas.glb",
      name: "Dúo de Copas de Brindis",
      finish: "silver_crystal",
      rotation: [0.15, -0.3, 0.05],
      scaleMultiplier: 1.0,
      badge: "Brindis Nupcial",
      sectionTarget: "Dress Code & Galería",
    },
    slot_4: {
      id: "boda_mariposa",
      slotKey: "slot_4",
      position: "bottom-left",
      modelUrl: "/models/mariposa.glb",
      name: "Mariposa de Bendición",
      finish: "gold",
      rotation: [0.18, 0.45, -0.08],
      scaleMultiplier: 0.95,
      badge: "Promesa de Vida",
      sectionTarget: "Mesa de Regalos & RSVP",
    },
  },

  BAUTIZO: {
    slot_1: {
      id: "bautizo_cruz",
      slotKey: "slot_1",
      position: "top-right",
      modelUrl: "/models/cruz.glb",
      name: "Cruz de Bendición",
      finish: "gold",
      rotation: [0.15, -0.35, 0.05],
      scaleMultiplier: 1.0,
      badge: "Fe y Protección",
      sectionTarget: "Hero / Ceremonia",
    },
    slot_2: {
      id: "bautizo_mariposa",
      slotKey: "slot_2",
      position: "mid-left",
      modelUrl: "/models/mariposa.glb",
      name: "Mariposa de Gracia",
      finish: "pearl_gold",
      rotation: [0.12, 0.4, -0.05],
      scaleMultiplier: 0.95,
      badge: "Pureza",
      sectionTarget: "Itinerario del Día",
    },
    slot_3: {
      id: "bautizo_rosa",
      slotKey: "slot_3",
      position: "mid-right",
      modelUrl: "/models/rosaglb.glb",
      name: "Rosa Sacra",
      finish: "pearl_gold",
      rotation: [0.2, -0.4, 0.08],
      scaleMultiplier: 0.95,
      badge: "Amor Divino",
      sectionTarget: "Dress Code & Galería",
    },
    slot_4: {
      id: "bautizo_globos",
      slotKey: "slot_4",
      position: "bottom-left",
      modelUrl: "/models/globos.glb",
      name: "Globos de Celebración",
      finish: "pearl_gold",
      rotation: [0.1, 0.35, 0],
      scaleMultiplier: 0.95,
      badge: "Alegría Sagrada",
      sectionTarget: "Recepción & RSVP",
    },
  },

  CUMPLES: {
    slot_1: {
      id: "cumple_globos",
      slotKey: "slot_1",
      position: "top-right",
      modelUrl: "/models/globos.glb",
      name: "Ramillete de Globos",
      finish: "gold",
      rotation: [0.1, -0.3, 0.05],
      scaleMultiplier: 1.0,
      badge: "Feliz Cumpleaños",
      sectionTarget: "Hero / Historia",
    },
    slot_2: {
      id: "cumple_frasco",
      slotKey: "slot_2",
      position: "mid-left",
      modelUrl: "/models/frasco.glb",
      name: "Frasco de Deseos",
      finish: "silver_crystal",
      rotation: [0.15, 0.4, -0.05],
      scaleMultiplier: 1.0,
      badge: "Elixir de Alegría",
      sectionTarget: "Itinerario del Día",
    },
    slot_3: {
      id: "cumple_disco",
      slotKey: "slot_3",
      position: "mid-right",
      modelUrl: "/models/disco.glb",
      name: "Esfera Disco",
      finish: "silver_crystal",
      rotation: [0.12, -0.35, 0],
      scaleMultiplier: 0.95,
      badge: "Noche de Fiesta",
      sectionTarget: "Dress Code & Pista",
    },
    slot_4: {
      id: "cumple_copa",
      slotKey: "slot_4",
      position: "bottom-left",
      modelUrl: "/models/Copa.glb",
      name: "Copa de Brindis",
      finish: "gold",
      rotation: [0.15, 0.45, -0.06],
      scaleMultiplier: 0.95,
      badge: "Por un Gran Año",
      sectionTarget: "Brindis & RSVP",
    },
  },

  CORPORATIVO: {
    slot_1: {
      id: "corp_copa",
      slotKey: "slot_1",
      position: "top-right",
      modelUrl: "/models/Copa.glb",
      name: "Copa de Gala",
      finish: "silver_crystal",
      rotation: [0.12, -0.35, 0.05],
      scaleMultiplier: 1.0,
      badge: "Gala de Honor",
      sectionTarget: "Hero / Programa",
    },
    slot_2: {
      id: "corp_abanico",
      slotKey: "slot_2",
      position: "mid-left",
      modelUrl: "/models/abanico.glb",
      name: "Abanico de Distinción",
      finish: "gold",
      rotation: [0.2, 0.4, -0.05],
      scaleMultiplier: 1.0,
      badge: "Prestigio",
      sectionTarget: "Itinerario",
    },
    slot_3: {
      id: "corp_copas",
      slotKey: "slot_3",
      position: "mid-right",
      modelUrl: "/models/copas.glb",
      name: "Copas de Alianza",
      finish: "silver_crystal",
      rotation: [0.15, -0.3, 0.05],
      scaleMultiplier: 0.95,
      badge: "Éxito Compartido",
      sectionTarget: "Gala & Brindis",
    },
    slot_4: {
      id: "corp_frasco",
      slotKey: "slot_4",
      position: "bottom-left",
      modelUrl: "/models/frasco.glb",
      name: "Insignia de Excelencia",
      finish: "gold",
      rotation: [0.15, 0.35, -0.05],
      scaleMultiplier: 0.95,
      badge: "Reconocimiento",
      sectionTarget: "Cierre & Registro",
    },
  },
};

// =========================================================================
// 3. MOTOR INTELIGENTE DE RESOLUCIÓN Y CURADURÍA
// =========================================================================
export function resolveEventCategory(category?: string, title?: string): EventCategoryKey {
  const cat = (category || "").toUpperCase();
  const tit = (title || "").toUpperCase();

  if (
    cat.includes("XV") ||
    cat.includes("QUINCE") ||
    tit.includes("XV") ||
    tit.includes("QUINCE")
  ) {
    return "XV_ANOS";
  }

  if (cat.includes("CUMPLE") || tit.includes("CUMPLE")) {
    return "CUMPLES";
  }

  if (cat.includes("BAUTIZO") || tit.includes("BAUTIZO") || cat.includes("COMUNION")) {
    return "BAUTIZO";
  }

  if (cat.includes("CORP") || tit.includes("CORP") || cat.includes("GALA")) {
    return "CORPORATIVO";
  }

  // Por defecto, Boda
  return "BODA";
}

/**
 * Obtiene la composición curada de las 4 ranuras escultóricas,
 * fusionando el preset según festividad con las personalizaciones del anfitrión.
 */
export function getEventCuratedSculptures(event: EventMeta): Record<SculptureSlotKey, SculptureSlotConfig> {
  const categoryKey = resolveEventCategory(event.category, event.title);
  const basePreset = AUREA_3D_PRESETS[categoryKey] || AUREA_3D_PRESETS.BODA;

  // Clonar preset base
  const result: Record<SculptureSlotKey, SculptureSlotConfig> = {
    slot_1: { ...basePreset.slot_1 },
    slot_2: { ...basePreset.slot_2 },
    slot_3: { ...basePreset.slot_3 },
    slot_4: { ...basePreset.slot_4 },
  };

  // Sobrescribir con personalizaciones guardadas en DynamoDB si existen
  if (event.custom3dSlots) {
    (["slot_1", "slot_2", "slot_3", "slot_4"] as SculptureSlotKey[]).forEach((slotKey) => {
      const custom = event.custom3dSlots?.[slotKey];
      if (custom && custom.modelUrl) {
        // Encontrar datos del modelo en el catálogo
        const modelInfo = AVAILABLE_3D_MODELS.find((m) => m.modelUrl === custom.modelUrl);
        result[slotKey] = {
          ...result[slotKey],
          modelUrl: custom.modelUrl,
          finish: (custom.finish as SculptureFinish) || modelInfo?.defaultFinish || result[slotKey].finish,
          name: custom.name || modelInfo?.name || result[slotKey].name,
          scaleMultiplier: custom.scaleMultiplier || result[slotKey].scaleMultiplier || 1.0,
        };
      }
    });
  }

  return result;
}
