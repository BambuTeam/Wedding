"use client";

import React, { useState } from "react";
import {
  Heart,
  Save,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Utensils,
  Music,
  Camera,
  Church,
  GlassWater,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Hotel,
  Gift,
  Palette,
  FileText,
  Compass,
  CheckCircle2,
  Star,
  Eye,
  Box,
  RotateCcw,
  Layers,
} from "lucide-react";
import {
  EventMeta,
  ItineraryItem,
  EditorialPhoto,
  HotelRecommendation,
  Custom3dSlots,
  SculptureSlotKey,
  SculptureFinish,
} from "@/lib/types";
import {
  AVAILABLE_3D_MODELS,
  Available3DModel,
  resolveEventCategory,
  getEventCuratedSculptures,
} from "@/lib/3d/aurea3dCurator";

interface InvitationCustomizerProps {
  event: EventMeta;
  onSaved: (updatedEvent: EventMeta) => void;
}

type CustomizerTab =
  | "identidad"
  | "itinerario"
  | "dresscode"
  | "gastronomia"
  | "regalos"
  | "editorial"
  | "ornamentos3d";

export function InvitationCustomizer({ event, onSaved }: InvitationCustomizerProps) {
  const [activeSubTab, setActiveSubTab] = useState<CustomizerTab>("identidad");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // --- FORM STATE ---
  // 1. Identidad & Fechas
  const [title, setTitle] = useState(event.title || "");
  const [brideName, setBrideName] = useState(event.brideName || "");
  const [groomName, setGroomName] = useState(event.groomName || "");
  const [tagline, setTagline] = useState(event.tagline || "");
  const [ourStory, setOurStory] = useState(event.ourStory || "");
  const [eventDate, setEventDate] = useState(event.eventDate || "");
  const [eventDateFormatted, setEventDateFormatted] = useState(
    event.eventDateFormatted || ""
  );

  // Locaciones Ceremonia
  const [venueName, setVenueName] = useState(event.venueName || "");
  const [venueCity, setVenueCity] = useState(event.venueCity || "");
  const [venueAddress, setVenueAddress] = useState(event.venueAddress || "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(event.googleMapsUrl || "");
  const [wazeUrl, setWazeUrl] = useState(event.wazeUrl || "");

  // Locaciones Recepción
  const [receptionVenueName, setReceptionVenueName] = useState(
    event.receptionVenueName || ""
  );
  const [receptionVenueAddress, setReceptionVenueAddress] = useState(
    event.receptionVenueAddress || ""
  );
  const [receptionGoogleMapsUrl, setReceptionGoogleMapsUrl] = useState(
    event.receptionGoogleMapsUrl || ""
  );
  const [receptionWazeUrl, setReceptionWazeUrl] = useState(
    event.receptionWazeUrl || ""
  );

  // 2. Itinerario
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(
    event.itinerary ? [...event.itinerary] : []
  );

  // 3. Dress Code & Paleta
  const [dressCodeTitle, setDressCodeTitle] = useState(
    event.dressCodeTitle || "Rigurosa Etiqueta / Black Tie"
  );
  const [dressCodeDescription, setDressCodeDescription] = useState(
    event.dressCodeDescription || ""
  );
  const [paletteColors, setPaletteColors] = useState<string[]>(
    event.paletteColors && event.paletteColors.length > 0
      ? [...event.paletteColors]
      : ["#1B2B23", "#C5A059", "#A88444", "#EADBCC", "#FFFFFF"]
  );
  const [paletteColorNames, setPaletteColorNames] = useState<string[]>(
    event.paletteColorNames && event.paletteColorNames.length > 0
      ? [...event.paletteColorNames]
      : ["Verde Bosque", "Oro Imperial", "Dorado Antiguo", "Marfil Arena", "Blanco Puro"]
  );

  // 4. Gastronomía & Menú
  const [menu, setMenu] = useState(
    event.menu && event.menu.length > 0
      ? [...event.menu]
      : [
          {
            course: "Entrada",
            title: "Ceviche de Robalo al Limón Mandarina",
            description: "Aguacate criollo, crujiente de plátano y reducción de flor de jamaica.",
            dietaryFlag: "Libre de Gluten",
          },
          {
            course: "Plato Fuerte",
            title: "Lomito de Res en Reducción de Oporto",
            description: "Acompañado de puré trufado de papa ratte y espárragos caramelizados.",
            dietaryFlag: "Opción Vegetariana disponible",
          },
          {
            course: "Postre",
            title: "Pavlova de Frutos Rojos Silvestres",
            description: "Merengue crujiente francés con crema ligera de vainilla Bourbon.",
            dietaryFlag: "Dulce de Autor",
          },
        ]
  );

  // 5. Mesa de Regalos & Hoteles
  const [giftRegistries, setGiftRegistries] = useState(
    event.giftRegistries ? [...event.giftRegistries] : []
  );
  const [hotels, setHotels] = useState<HotelRecommendation[]>(
    event.hotels ? [...event.hotels] : []
  );

  // 6. Sesión Fotográfica Editorial
  const [editorialPhotos, setEditorialPhotos] = useState<EditorialPhoto[]>(
    event.editorialPhotos ? [...event.editorialPhotos] : []
  );
  const [coverImageUrl, setCoverImageUrl] = useState(event.coverImageUrl || "");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // 7. Ornamentos 3D Curados
  const [custom3dSlots, setCustom3dSlots] = useState<Custom3dSlots>(
    event.custom3dSlots ? { ...event.custom3dSlots } : {}
  );

  // Curaduría activa de modelos 3D y categoría de evento
  const activeSculptures = getEventCuratedSculptures({
    ...event,
    custom3dSlots,
  });

  const eventCategory = resolveEventCategory(event.category, event.title);

  const handleUpdateSlotModel = (slotKey: SculptureSlotKey, model: Available3DModel) => {
    const current = activeSculptures[slotKey];
    setCustom3dSlots((prev) => ({
      ...prev,
      [slotKey]: {
        ...current,
        modelUrl: model.modelUrl,
        name: model.name,
        finish: prev?.[slotKey]?.finish || model.defaultFinish || current.finish,
      },
    }));
  };

  const handleUpdateSlotFinish = (slotKey: SculptureSlotKey, finish: SculptureFinish) => {
    const current = activeSculptures[slotKey];
    setCustom3dSlots((prev) => ({
      ...prev,
      [slotKey]: {
        ...current,
        finish,
      },
    }));
  };

  const handleResetSlot = (slotKey: SculptureSlotKey) => {
    setCustom3dSlots((prev) => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const handleResetAllSlots = () => {
    setCustom3dSlots({});
  };

  // =========================================================================
  // MANEJADORES DE ITINERARIO
  // =========================================================================
  const handleAddItineraryItem = () => {
    setItinerary([
      ...itinerary,
      {
        time: "17:00",
        title: "Nuevo Momento",
        location: venueName || "Lugar del evento",
        description: "Descripción de la actividad",
        iconName: "sparkles",
      },
    ]);
  };

  const handleUpdateItinerary = (index: number, field: keyof ItineraryItem, value: any) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleDeleteItineraryItem = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const handleMoveItinerary = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === itinerary.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...itinerary];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setItinerary(updated);
  };

  // =========================================================================
  // MANEJADORES DE PALETA DE COLORES
  // =========================================================================
  const handleColorChange = (index: number, newHex: string) => {
    const newColors = [...paletteColors];
    newColors[index] = newHex;
    setPaletteColors(newColors);
  };

  const handleColorNameChange = (index: number, newName: string) => {
    const newNames = [...paletteColorNames];
    newNames[index] = newName;
    setPaletteColorNames(newNames);
  };

  const handleAddColor = () => {
    if (paletteColors.length >= 6) return;
    setPaletteColors([...paletteColors, "#C5A059"]);
    setPaletteColorNames([...paletteColorNames, `Tono ${paletteColors.length + 1}`]);
  };

  const handleRemoveColor = (index: number) => {
    if (paletteColors.length <= 1) return;
    setPaletteColors(paletteColors.filter((_, i) => i !== index));
    setPaletteColorNames(paletteColorNames.filter((_, i) => i !== index));
  };

  // =========================================================================
  // MANEJADORES DE MENÚ
  // =========================================================================
  const handleAddMenuItem = () => {
    setMenu([
      ...menu,
      {
        course: "Tiempo Extra",
        title: "Plato Especial",
        description: "Ingredientes y preparación",
        dietaryFlag: "A consultar",
      },
    ]);
  };

  const handleUpdateMenuItem = (index: number, field: string, value: string) => {
    const updated = [...menu];
    updated[index] = { ...updated[index], [field]: value };
    setMenu(updated);
  };

  const handleDeleteMenuItem = (index: number) => {
    setMenu(menu.filter((_, i) => i !== index));
  };

  // =========================================================================
  // MANEJADORES DE REGALOS & HOTELES
  // =========================================================================
  const handleAddGift = (type: "bank" | "store") => {
    if (type === "bank") {
      setGiftRegistries([
        ...giftRegistries,
        {
          name: "Banco Industrial",
          description: "Cuenta Monetaria en Quetzales",
          codeOrUrl: "001-234567-8",
          type: "bank",
          accountHolder: `${brideName} & ${groomName}`,
          accountNumber: "001-234567-8",
          bankName: "Banco Industrial",
          currency: "GTQ",
        },
      ]);
    } else {
      setGiftRegistries([
        ...giftRegistries,
        {
          name: "Mesa de Regalos en Línea",
          description: "Selección de artículos para nuestro nuevo hogar",
          codeOrUrl: "https://www.tienda.com/mesa-de-regalos",
          type: "store",
        },
      ]);
    }
  };

  const handleDeleteGift = (index: number) => {
    setGiftRegistries(giftRegistries.filter((_, i) => i !== index));
  };

  const handleAddHotel = () => {
    setHotels([
      ...hotels,
      {
        name: "Hotel de Lujo Sugerido",
        description: "Tarifa preferencial para nuestros invitados mencionando el código del evento.",
        address: venueCity || "Ciudad del evento",
        discountCode: "BODA2026",
        bookingUrl: "https://www.hotel.com",
      },
    ]);
  };

  const handleDeleteHotel = (index: number) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  // =========================================================================
  // MANEJADORES DE SESIÓN FOTOGRÁFICA EDITORIAL
  // =========================================================================
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    const newPhotos: EditorialPhoto[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await fetch(`/api/events/${event.eventId}/upload-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type || "image/jpeg",
              author: "Anfitrión",
              message: "Sesión Editorial",
            }),
          });

          const data = await res.json();
          const publicUrl = data.publicUrl || URL.createObjectURL(file);

          const photoObj: EditorialPhoto = {
            id: `photo_${Date.now()}_${i}`,
            url: publicUrl,
            caption: "Nuestra historia de amor",
            order: editorialPhotos.length + i + 1,
            aspect: i % 2 === 0 ? "portrait" : "landscape",
            isCover: editorialPhotos.length === 0 && i === 0,
          };
          newPhotos.push(photoObj);

          if (editorialPhotos.length === 0 && i === 0 && !coverImageUrl) {
            setCoverImageUrl(publicUrl);
          }
        } catch (subErr) {
          console.warn("Upload fallback local:", subErr);
          const fallbackUrl = URL.createObjectURL(file);
          newPhotos.push({
            id: `photo_local_${Date.now()}_${i}`,
            url: fallbackUrl,
            caption: "Nuestra historia de amor",
            order: editorialPhotos.length + i + 1,
            aspect: i % 2 === 0 ? "portrait" : "landscape",
            isCover: editorialPhotos.length === 0 && i === 0,
          });
        }
      }

      setEditorialPhotos([...editorialPhotos, ...newPhotos]);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSetCoverPhoto = (photo: EditorialPhoto) => {
    setCoverImageUrl(photo.url);
    const updated = editorialPhotos.map((p) => ({
      ...p,
      isCover: p.url === photo.url,
    }));
    setEditorialPhotos(updated);
  };

  const handleDeletePhoto = (index: number) => {
    const photoToDelete = editorialPhotos[index];
    const updated = editorialPhotos.filter((_, i) => i !== index);
    setEditorialPhotos(updated);
    if (photoToDelete.isCover && updated.length > 0) {
      updated[0].isCover = true;
      setCoverImageUrl(updated[0].url);
    }
  };

  const handleUpdatePhotoCaption = (index: number, caption: string) => {
    const updated = [...editorialPhotos];
    updated[index] = { ...updated[index], caption };
    setEditorialPhotos(updated);
  };

  const handleTogglePhotoAspect = (index: number) => {
    const updated = [...editorialPhotos];
    const current = updated[index].aspect || "portrait";
    updated[index] = { ...updated[index], aspect: current === "portrait" ? "landscape" : "portrait" };
    setEditorialPhotos(updated);
  };

  // =========================================================================
  // GUARDAR CAMBIOS EN DYNAMODB (PATCH /api/events/[eventId])
  // =========================================================================
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const payload = {
      eventUpdates: {
        title,
        brideName,
        groomName,
        tagline,
        ourStory,
        eventDate,
        eventDateFormatted,
        venueName,
        venueCity,
        venueAddress,
        googleMapsUrl,
        wazeUrl,
        receptionVenueName,
        receptionVenueAddress,
        receptionGoogleMapsUrl,
        receptionWazeUrl,
        itinerary,
        dressCodeTitle,
        dressCodeDescription,
        paletteColors,
        paletteColorNames,
        menu,
        giftRegistries,
        hotels,
        editorialPhotos,
        coverImageUrl,
        custom3dSlots,
      },
    };

    try {
      const res = await fetch(`/api/events/${event.eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar la personalización.");
      }

      setSaveSuccess(true);
      if (data.event) {
        onSaved(data.event);
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Error al conectar con DynamoDB.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header del Estudio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1E1C1A] to-[#2B2724] text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A88444]/30 text-[#DFC07D] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estudio Editorial del Anfitrión</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5]">
            Personalizar Invitación Digital
          </h2>
          <p className="text-xs text-zinc-300 max-w-xl">
            Edita en tiempo real cada detalle visual, locación, itinerario y fotografía que verán tus invitados al abrir su sobre interactivo.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`/invitacion/preview?eventId=${event.eventId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/15 transition-all"
          >
            <Eye className="w-4 h-4 text-[#DFC07D]" />
            <span>Ver Vista Previa</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C5A059] hover:bg-[#b5924d] text-zinc-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50 min-h-[44px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Guardando en DynamoDB...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>¡Cambios Guardados!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>¡Todos los cambios fueron actualizados y sincronizados con DynamoDB exitosamente!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Subnavegación del Estudio (7 Módulos) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E8DFC8]">
        {[
          { id: "identidad", label: "Identidad & Locaciones", icon: Compass },
          { id: "itinerario", label: "Itinerario Dinámico", icon: Clock },
          { id: "dresscode", label: "Código de Vestimenta", icon: Palette },
          { id: "gastronomia", label: "Menú & Gastronomía", icon: Utensils },
          { id: "regalos", label: "Regalos & Hospedaje", icon: Gift },
          { id: "editorial", label: "Sesión Fotográfica", icon: Camera },
          { id: "ornamentos3d", label: "Ornamentos 3D", icon: Box },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as CustomizerTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#1E1C1A] text-white shadow-md font-bold"
                  : "bg-white text-zinc-600 hover:bg-[#FAF7F2] border border-[#DFC9A6]/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#DFC07D]" : "text-zinc-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          MÓDULO 1: IDENTIDAD, FECHAS & LOCACIONES
          ========================================================================= */}
      {activeSubTab === "identidad" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
            <div className="border-b border-[#FAF3E8] pb-4">
              <h3 className="font-serif text-xl text-zinc-900 font-semibold">
                Identidad de la Celebración
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Títulos centrales, nombres de los protagonistas y la dedicatoria principal de la invitación.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Título Principal del Evento
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Camila & Andrés"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-serif text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Lema o Frase de Apertura
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ej. Un sí para siempre entre nuestros seres más amados"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm italic font-serif text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Nombre de la Novia / Anfitriona 1
                </label>
                <input
                  type="text"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="Camila"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Nombre del Novio / Anfitrión 2
                </label>
                <input
                  type="text"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="Andrés"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C1A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Nuestra Historia (Editorial)
                </label>
                <textarea
                  rows={4}
                  value={ourStory}
                  onChange={(e) => setOurStory(e.target.value)}
                  placeholder="Cuenta cómo se conocieron o qué significa este paso para ustedes..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-serif italic text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C1A]"
                />
              </div>
            </div>
          </div>

          {/* Fecha y Horario */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
            <div className="border-b border-[#FAF3E8] pb-4">
              <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#A88444]" />
                <span>Fecha & Horario de la Celebración</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Fecha ISO (Para Contador Regresivo)
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="2026-11-20T16:00:00"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C1A]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Formato: YYYY-MM-DDTHH:mm:ss (utilizado para el contador regresivo exacto).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Texto Elegante de la Fecha
                </label>
                <input
                  type="text"
                  value={eventDateFormatted}
                  onChange={(e) => setEventDateFormatted(e.target.value)}
                  placeholder="Sábado, 20 de Noviembre de 2026 · 16:00 hrs"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-serif italic text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C1A]"
                />
              </div>
            </div>
          </div>

          {/* Locaciones: Ceremonia & Recepción */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ceremonia */}
            <div className="p-6 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 border-b border-[#FAF3E8] pb-3">
                <Church className="w-5 h-5 text-[#A88444]" />
                <h4 className="font-serif text-lg font-semibold">1. Lugar de la Ceremonia</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre del Recinto</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="Iglesia San Francisco el Grande"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Ciudad / Región</label>
                  <input
                    type="text"
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    placeholder="Antigua Guatemala"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Dirección Exacta</label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="Calle de los Pasos, Antigua Guatemala"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Enlace Google Maps</label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Enlace Waze</label>
                  <input
                    type="url"
                    value={wazeUrl}
                    onChange={(e) => setWazeUrl(e.target.value)}
                    placeholder="https://waze.com/ul?q=..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Recepción */}
            <div className="p-6 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 border-b border-[#FAF3E8] pb-3">
                <GlassWater className="w-5 h-5 text-[#A88444]" />
                <h4 className="font-serif text-lg font-semibold">2. Lugar de la Recepción</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre del Recinto</label>
                  <input
                    type="text"
                    value={receptionVenueName}
                    onChange={(e) => setReceptionVenueName(e.target.value)}
                    placeholder="Hotel Museo Casa Santo Domingo"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Dirección Exacta</label>
                  <input
                    type="text"
                    value={receptionVenueAddress}
                    onChange={(e) => setReceptionVenueAddress(e.target.value)}
                    placeholder="3a Calle Oriente No. 28A, Antigua Guatemala"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Enlace Google Maps</label>
                  <input
                    type="url"
                    value={receptionGoogleMapsUrl}
                    onChange={(e) => setReceptionGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Enlace Waze</label>
                  <input
                    type="url"
                    value={receptionWazeUrl}
                    onChange={(e) => setReceptionWazeUrl(e.target.value)}
                    placeholder="https://waze.com/ul?q=..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO 2: CONSTRUCTOR DINÁMICO DE ITINERARIO
          ========================================================================= */}
      {activeSubTab === "itinerario" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF3E8] pb-4">
            <div>
              <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#A88444]" />
                <span>Constructor de Itinerario</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Agrega, reordena y edita cada hito de la cronología del día para tus invitados.
              </p>
            </div>

            <button
              onClick={handleAddItineraryItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1C1A] text-white text-xs font-semibold hover:bg-black transition-all shadow-sm self-start"
            >
              <Plus className="w-4 h-4 text-[#DFC07D]" />
              <span>Agregar Momento</span>
            </button>
          </div>

          <div className="space-y-4">
            {itinerary.map((item, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] flex flex-col md:flex-row items-start md:items-center gap-4 transition-all"
              >
                {/* Control de Orden */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveItinerary(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                    title="Subir"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveItinerary(index, "down")}
                    disabled={index === itinerary.length - 1}
                    className="p-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                    title="Bajar"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hora & Ícono */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleUpdateItinerary(index, "time", e.target.value)}
                    placeholder="16:00"
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-mono text-xs font-bold text-zinc-900 text-center"
                  />

                  <select
                    value={item.iconName}
                    onChange={(e) => handleUpdateItinerary(index, "iconName", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700"
                  >
                    <option value="church">⛪ Ceremonia</option>
                    <option value="cocktail">🍸 Cóctel</option>
                    <option value="utensils">🍴 Banquete</option>
                    <option value="music">🎵 Baile / Fiesta</option>
                    <option value="camera">📷 Fotografías</option>
                    <option value="sparkles">✨ Brindis / Sorpresa</option>
                  </select>
                </div>

                {/* Título & Ubicación */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateItinerary(index, "title", e.target.value)}
                    placeholder="Título del momento"
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-900"
                  />
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => handleUpdateItinerary(index, "location", e.target.value)}
                    placeholder="Lugar o salón"
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateItinerary(index, "description", e.target.value)}
                    placeholder="Descripción sutil para los invitados..."
                    className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600"
                  />
                </div>

                {/* Botón Eliminar */}
                <button
                  onClick={() => handleDeleteItineraryItem(index)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors shrink-0"
                  title="Eliminar hito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO 3: CÓDIGO DE VESTIMENTA & PALETA INTERACTIVA
          ========================================================================= */}
      {activeSubTab === "dresscode" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-8">
          <div className="border-b border-[#FAF3E8] pb-4">
            <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#A88444]" />
              <span>Código de Vestimenta & Paleta de Inspiración</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Orienta el estilo de tus invitados con tonos sugeridos y recomendaciones de vestuario.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Tipo de Código
              </label>
              <input
                type="text"
                value={dressCodeTitle}
                onChange={(e) => setDressCodeTitle(e.target.value)}
                placeholder="Rigurosa Etiqueta / Black Tie"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-900 focus:bg-white"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  "Formal / Etiqueta Rigurosa",
                  "Black Tie Tropical",
                  "Gala",
                  "Cóctel",
                  "Jardín Chic",
                  "Guayabera Formal",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDressCodeTitle(preset)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[11px] font-medium text-zinc-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Notas & Recomendaciones
              </label>
              <textarea
                rows={3}
                value={dressCodeDescription}
                onChange={(e) => setDressCodeDescription(e.target.value)}
                placeholder="Evitar blanco y tonos marfil. Aconsejamos vestidos largos para damas y traje oscuro para caballeros..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Paleta de Colores Táctiles */}
          <div className="space-y-4 pt-4 border-t border-[#FAF3E8]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  Paleta de Tonos Sugeridos (Hasta 5-6 colores)
                </h4>
                <p className="text-xs text-zinc-500">
                  Colores en muestra redonda interactiva que tus invitados podrán ver y explorar.
                </p>
              </div>

              {paletteColors.length < 6 && (
                <button
                  onClick={handleAddColor}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Tono</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {paletteColors.map((color, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(idx, e.target.value)}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleColorChange(idx, e.target.value)}
                      className="w-full px-2 py-1 rounded border border-zinc-200 bg-white font-mono text-xs uppercase"
                    />
                  </div>

                  <input
                    type="text"
                    value={paletteColorNames[idx] || `Tono ${idx + 1}`}
                    onChange={(e) => handleColorNameChange(idx, e.target.value)}
                    placeholder="Nombre del tono"
                    className="w-full px-2 py-1 rounded border border-zinc-200 bg-white text-xs font-semibold text-zinc-800"
                  />

                  {paletteColors.length > 1 && (
                    <button
                      onClick={() => handleRemoveColor(idx)}
                      className="w-full text-center text-[10px] text-rose-500 hover:underline pt-1"
                    >
                      Remover color
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO 4: GASTRONOMÍA & MENÚ
          ========================================================================= */}
      {activeSubTab === "gastronomia" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF3E8] pb-4">
            <div>
              <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#A88444]" />
                <span>Gastronomía & Banquete</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Detalla los tiempos del menú para deleitar a tus comensales y coordinar opciones dietéticas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setMenu([
                    ...menu,
                    {
                      course: "Menú Principal",
                      title: "Lomito de Res en Reducción de Oporto",
                      description: "Acompañado de puré trufado de papa y espárragos caramelizados.",
                      dietaryFlag: "Selección del Chef",
                    },
                  ]);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-800 transition-colors"
              >
                + Menú Principal
              </button>
              <button
                onClick={() => {
                  setMenu([
                    ...menu,
                    {
                      course: "Opción Vegetariana",
                      title: "Risotto de Hongos Silvestres & Trufa",
                      description: "Arroz arborio cremoso con portobello y queso parmesano añejo.",
                      dietaryFlag: "Vegetariano",
                    },
                  ]);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 transition-colors"
              >
                + Opción Vegetariana
              </button>
              <button
                onClick={() => {
                  setMenu([
                    ...menu,
                    {
                      course: "Menú Infantil / Teen",
                      title: "Fingers de Pollo Artesanales & Papas Rústicas",
                      description: "Con salsa tártara casera y mini hamburguesas gourmet.",
                      dietaryFlag: "Menú Kids",
                    },
                  ]);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold text-amber-800 transition-colors"
              >
                + Menú Infantil / Teen
              </button>
              <button
                onClick={handleAddMenuItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1C1A] text-white text-xs font-semibold hover:bg-black transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#DFC07D]" />
                <span>Personalizado</span>
              </button>
            </div>
          </div>

          {/* Cuidados de Cocina Callout */}
          <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#DFC9A6] text-xs text-[#7A5C30] flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Conexión Automática con &ldquo;Cuidados de Cocina&rdquo;</span>
              <p className="text-zinc-600 mt-0.5 leading-relaxed">
                Cada invitado que indique alergias, celiaquía o dietas especiales en su confirmación RSVP se contabiliza y visualiza en tiempo real en la tarjeta de &ldquo;Cuidados de Cocina&rdquo; del Dashboard para el equipo de catering.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {menu.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={item.course}
                    onChange={(e) => handleUpdateMenuItem(idx, "course", e.target.value)}
                    placeholder="Tiempo (ej. Entrada, Plato Fuerte, Postre)"
                    className="w-1/3 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold uppercase tracking-wider text-[#A88444]"
                  />
                  <button
                    onClick={() => handleDeleteMenuItem(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateMenuItem(idx, "title", e.target.value)}
                    placeholder="Título del platillo"
                    className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs font-serif font-bold text-zinc-900"
                  />
                  <input
                    type="text"
                    value={item.dietaryFlag || ""}
                    onChange={(e) => handleUpdateMenuItem(idx, "dietaryFlag", e.target.value)}
                    placeholder="Etiqueta (ej. Libre de Gluten, Vegano)"
                    className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-700"
                  />
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleUpdateMenuItem(idx, "description", e.target.value)}
                    placeholder="Descripción gastronómica de ingredientes y preparación..."
                    className="sm:col-span-2 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO 5: MESA DE REGALOS & HOSPEDAJE
          ========================================================================= */}
      {activeSubTab === "regalos" && (
        <div className="space-y-6">
          {/* Cuentas Bancarias & Enlaces */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF3E8] pb-4">
              <div>
                <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#A88444]" />
                  <span>Mesa de Regalos & Cuentas Bancarias</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Brinda a tus invitados transferencias directas en Quetzales o Dólares, o enlaces a tiendas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleAddGift("bank")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cuenta Bancaria (GTQ/USD)</span>
                </button>
                <button
                  onClick={() => {
                    setGiftRegistries([
                      ...giftRegistries,
                      {
                        name: "Mesa de Regalos en Siman",
                        description: "Código de evento disponible en tiendas o en línea",
                        codeOrUrl: "https://www.siman.com",
                        type: "store",
                      },
                    ]);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-700 transition-colors"
                >
                  + Siman
                </button>
                <button
                  onClick={() => {
                    setGiftRegistries([
                      ...giftRegistries,
                      {
                        name: "Mesa de Bodas en Cemaco",
                        description: "Selección de artículos para equipar nuestro hogar",
                        codeOrUrl: "https://www.cemaco.com",
                        type: "store",
                      },
                    ]);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-700 transition-colors"
                >
                  + Cemaco
                </button>
                <button
                  onClick={() => {
                    setGiftRegistries([
                      ...giftRegistries,
                      {
                        name: "Wishlist en Amazon",
                        description: "Artículos y detalles para nuestra nueva etapa",
                        codeOrUrl: "https://www.amazon.com/wedding",
                        type: "store",
                      },
                    ]);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-700 transition-colors"
                >
                  + Amazon
                </button>
                <button
                  onClick={() => {
                    setGiftRegistries([
                      ...giftRegistries,
                      {
                        name: "Fondo de Luna de Miel",
                        description: "Contribuciones para vivir experiencias inolvidables en nuestro viaje",
                        codeOrUrl: "https://www.lunademiel.com",
                        type: "store",
                      },
                    ]);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF0DC] hover:bg-[#F3E2C4] text-[11px] font-bold text-[#7A5C30] transition-colors"
                >
                  + Luna de Miel
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {giftRegistries.map((gift, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#A88444]">
                      {gift.type === "bank" ? "Transferencia Bancaria" : "Mesa de Tienda"}
                    </span>
                    <button
                      onClick={() => handleDeleteGift(idx)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={gift.name}
                      onChange={(e) => {
                        const updated = [...giftRegistries];
                        updated[idx].name = e.target.value;
                        setGiftRegistries(updated);
                      }}
                      placeholder="Nombre del banco o tienda"
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-900"
                    />
                    <input
                      type="text"
                      value={gift.codeOrUrl}
                      onChange={(e) => {
                        const updated = [...giftRegistries];
                        updated[idx].codeOrUrl = e.target.value;
                        setGiftRegistries(updated);
                      }}
                      placeholder="Número de cuenta o enlace URL"
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-mono text-zinc-900"
                    />
                    <input
                      type="text"
                      value={gift.description}
                      onChange={(e) => {
                        const updated = [...giftRegistries];
                        updated[idx].description = e.target.value;
                        setGiftRegistries(updated);
                      }}
                      placeholder="Detalles (Moneda, titular, etc.)"
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hoteles Recomendados */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF3E8] pb-4">
              <div>
                <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-[#A88444]" />
                  <span>Hospedaje & Hoteles Recomendados</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Facilita la estadía de invitados foráneos con códigos de descuento y opciones cercanas.
                </p>
              </div>

              <button
                onClick={handleAddHotel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1C1A] text-white text-xs font-semibold hover:bg-black transition-all shadow-sm self-start"
              >
                <Plus className="w-4 h-4 text-[#DFC07D]" />
                <span>Agregar Hotel</span>
              </button>
            </div>

            <div className="space-y-4">
              {hotels.map((hotel, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#A88444]">
                      Opción de Hospedaje #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteHotel(idx)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={hotel.name}
                      onChange={(e) => {
                        const updated = [...hotels];
                        updated[idx].name = e.target.value;
                        setHotels(updated);
                      }}
                      placeholder="Nombre del hotel"
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-900"
                    />
                    <input
                      type="text"
                      value={hotel.discountCode || ""}
                      onChange={(e) => {
                        const updated = [...hotels];
                        updated[idx].discountCode = e.target.value;
                        setHotels(updated);
                      }}
                      placeholder="Código de descuento (ej. BODA2026)"
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-mono font-bold text-[#A88444]"
                    />
                    <input
                      type="text"
                      value={hotel.address}
                      onChange={(e) => {
                        const updated = [...hotels];
                        updated[idx].address = e.target.value;
                        setHotels(updated);
                      }}
                      placeholder="Dirección o ubicación"
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600"
                    />
                    <input
                      type="url"
                      value={hotel.bookingUrl || ""}
                      onChange={(e) => {
                        const updated = [...hotels];
                        updated[idx].bookingUrl = e.target.value;
                        setHotels(updated);
                      }}
                      placeholder="Enlace web para reservar"
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO 6: SESIÓN FOTOGRÁFICA EDITORIAL (S3 & MESA DE LUZ)
          ========================================================================= */}
      {activeSubTab === "editorial" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF3E8] pb-4">
            <div>
              <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#A88444]" />
                <span>Sesión Fotográfica Editorial & Mesa de Luz</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Sube la sesión de fotos de alta costura, elige la portada del sobre y redacta los pies de página para la experiencia lookbook.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E1C1A] text-white text-xs font-semibold hover:bg-black transition-all shadow-md cursor-pointer self-start">
              {isUploadingPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#DFC07D]" />
                  <span>Subiendo a S3...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-[#DFC07D]" />
                  <span>Subir Fotografías</span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Galería de Láminas Editoriales */}
          {editorialPhotos.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFC9A6]">
              <ImageIcon className="w-10 h-10 text-zinc-400 mx-auto" />
              <p className="text-sm font-semibold text-zinc-700">
                Aún no has agregado fotos a la sesión editorial
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Sube imágenes en alta resolución. Podrás definir fotos verticales (aspecto 3:4) o apaisadas (16:10).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {editorialPhotos.map((photo, idx) => {
                const isCover = photo.isCover || photo.url === coverImageUrl;
                return (
                  <div
                    key={photo.id || idx}
                    className={`rounded-2xl border bg-white p-3 space-y-3 shadow-sm transition-all ${
                      isCover ? "border-[#C5A059] ring-2 ring-[#C5A059]/30" : "border-zinc-200"
                    }`}
                  >
                    {/* Contenedor de Imagen con Ratio */}
                    <div
                      className={`relative w-full rounded-xl overflow-hidden bg-zinc-100 ${
                        photo.aspect === "landscape" ? "aspect-[16/10]" : "aspect-[3/4]"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt="Foto Editorial"
                        className="w-full h-full object-cover"
                      />

                      {/* Badge de Portada */}
                      {isCover && (
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#1E1C1A]/90 text-[#DFC07D] text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#DFC07D]" />
                          <span>Portada Principal</span>
                        </div>
                      )}

                      {/* Badge de Formato */}
                      <button
                        onClick={() => handleTogglePhotoAspect(idx)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-mono backdrop-blur-sm hover:bg-black transition-colors"
                        title="Cambiar relación de aspecto"
                      >
                        {photo.aspect === "landscape" ? "16:10 Horizontal" : "3:4 Vertical"}
                      </button>
                    </div>

                    {/* Pie de Foto Editorial */}
                    <div>
                      <input
                        type="text"
                        value={photo.caption || ""}
                        onChange={(e) => handleUpdatePhotoCaption(idx, e.target.value)}
                        placeholder="Pie de foto en Garamond..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-serif italic text-zinc-900 focus:bg-white"
                      />
                    </div>

                    {/* Botonera de Gestión */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      {!isCover ? (
                        <button
                          onClick={() => handleSetCoverPhoto(photo)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C6D46] hover:text-[#181715]"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Hacer Portada</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-[#A88444]">
                          ★ Portada Activa
                        </span>
                      )}

                      <button
                        onClick={() => handleDeletePhoto(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MÓDULO 7: ORNAMENTOS & ESCULTURAS 3D (13 MODELOS .GLB)
          ========================================================================= */}
      {activeSubTab === "ornamentos3d" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DFC9A6] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF3E8] pb-4">
              <div>
                <h3 className="font-serif text-xl text-zinc-900 font-semibold flex items-center gap-2">
                  <Box className="w-5 h-5 text-[#C5A059]" />
                  <span>Ornamentos Escultóricos 3D de la Invitación</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Distribución viva en 4 ranuras a lo largo del scroll con renderizado PBR de joyería (Oro, Oro Rosa, Cristal Swarovski y Perla Nácar).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#1B2B23] text-[#DFC07D] text-[10px] font-bold uppercase tracking-wider">
                  Preset: {eventCategory}
                </span>
                {Object.keys(custom3dSlots).length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAllSlots}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors"
                    title="Restaurar preset editorial por defecto"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Restaurar Presets</span>
                  </button>
                )}
              </div>
            </div>

            {/* Ranuras de Composición Editorial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  {
                    key: "slot_1" as SculptureSlotKey,
                    title: "Ranura 1 · Hero / Nuestra Historia",
                    placement: "Margen Superior Derecho (Destacada en Móvil)",
                  },
                  {
                    key: "slot_2" as SculptureSlotKey,
                    title: "Ranura 2 · Itinerario Dinámico",
                    placement: "Margen Lateral Izquierdo (Desktop)",
                  },
                  {
                    key: "slot_3" as SculptureSlotKey,
                    title: "Ranura 3 · Código de Vestimenta & Lookbook",
                    placement: "Margen Lateral Derecho (Desktop)",
                  },
                  {
                    key: "slot_4" as SculptureSlotKey,
                    title: "Ranura 4 · Mesa de Regalos / RSVP",
                    placement: "Margen Lateral Izquierdo (Destacada en Móvil)",
                  },
                ]
              ).map((slotInfo) => {
                const currentPiece = activeSculptures[slotInfo.key];
                const isCustomized = Boolean(custom3dSlots[slotInfo.key]);

                const finishColorMap: Record<SculptureFinish, { bg: string; border: string; text: string; label: string }> = {
                  gold: { bg: "bg-[#FDF9F0]", border: "border-[#D4AF37]", text: "text-[#8A6D1C]", label: "Oro Champán" },
                  rose_gold: { bg: "bg-[#FFF5F2]", border: "border-[#E2B4A6]", text: "text-[#9E5D4B]", label: "Oro Rosa" },
                  silver_crystal: { bg: "bg-[#F0F7FC]", border: "border-[#A0C4E2]", text: "text-[#285A84]", label: "Cristal Swarovski" },
                  pearl_gold: { bg: "bg-[#FAF7F2]", border: "border-[#D6C4AA]", text: "text-[#735E42]", label: "Perla Nácar & Oro" },
                };

                return (
                  <div
                    key={slotInfo.key}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCustomized
                        ? "bg-[#FCFAF7] border-[#C5A059] shadow-sm"
                        : "bg-[#FAF8F5]/60 border-[#E8DFC8]"
                    } space-y-4`}
                  >
                    {/* Encabezado de Ranura */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-semibold text-zinc-900">
                            {slotInfo.title}
                          </h4>
                          {isCustomized && (
                            <span className="px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#8A6D1C] text-[9px] font-bold uppercase tracking-wider">
                              Personalizado
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {slotInfo.placement}
                        </p>
                      </div>

                      {isCustomized && (
                        <button
                          type="button"
                          onClick={() => handleResetSlot(slotInfo.key)}
                          className="text-[10px] text-zinc-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                          title="Restaurar a valor predeterminado del preset"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurar</span>
                        </button>
                      )}
                    </div>

                    {/* Selector de Modelo .GLB (13 Opciones Reales) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                        Modelo Escultórico
                      </label>
                      <select
                        value={currentPiece.modelUrl}
                        onChange={(e) => {
                          const selected = AVAILABLE_3D_MODELS.find((m) => m.modelUrl === e.target.value);
                          if (selected) handleUpdateSlotModel(slotInfo.key, selected);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                      >
                        {AVAILABLE_3D_MODELS.map((model) => (
                          <option key={model.id} value={model.modelUrl}>
                            {model.name} ({model.categoryTag})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-zinc-400 italic">
                        Archivo: {currentPiece.modelUrl.replace("/models/", "")}
                      </p>
                    </div>

                    {/* Selector de Acabado de Joyería PBR */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                        Acabado de Material PBR
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["gold", "rose_gold", "silver_crystal", "pearl_gold"] as SculptureFinish[]).map((finishKey) => {
                          const meta = finishColorMap[finishKey];
                          const isSelected = currentPiece.finish === finishKey;
                          return (
                            <button
                              key={finishKey}
                              type="button"
                              onClick={() => handleUpdateSlotFinish(slotInfo.key, finishKey)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border flex items-center gap-2 transition-all ${
                                isSelected
                                  ? `${meta.bg} ${meta.border} ${meta.text} ring-2 ring-[#C5A059]/40 font-bold shadow-sm`
                                  : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                                style={{
                                  backgroundColor:
                                    finishKey === "gold"
                                      ? "#DFC38C"
                                      : finishKey === "rose_gold"
                                      ? "#E2B4A6"
                                      : finishKey === "silver_crystal"
                                      ? "#D0E5F5"
                                      : "#F4EFE6",
                                }}
                              />
                              <span className="truncate">{meta.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar Bottom */}
      <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-[#1E1C1A]/95 text-white backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <Sparkles className="w-4 h-4 text-[#DFC07D]" />
          <span>Sincronización instantánea con la vista del invitado</span>
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b5924d] text-zinc-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50 min-h-[44px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              <span>Guardando en DynamoDB...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
