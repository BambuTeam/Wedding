import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME, dynamoClient } from "../aws/dynamodb";
import {
  Tenant,
  EventMeta,
  EventDirectoryItem,
  EventStatus,
  TenantStatus,
  TenantRole,
  PlanType,
  PaymentStatus,
  Guest,
  Table,
  LivePhoto,
  PlatformKpis,
  EventMusicConfig,
  EventCategoryKey,
  ThemePresetKey,
} from "../types";
import { FESTIVITY_PRESETS, THEME_PRESETS } from "../eventPresets";
import {
  MOCK_EVENTS,
  MOCK_GUESTS,
  MOCK_TABLES,
  MOCK_PHOTOS,
  MOCK_TENANTS,
  DEFAULT_EVENT_ID,
} from "./mock-data";

// Fallback en memoria si DynamoDB no tiene credenciales configuradas
declare global {
  // eslint-disable-next-line no-var
  var __aurea_in_memory_tenants: Record<string, Tenant> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_events: Record<string, EventMeta> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_guests: Record<string, Guest[]> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_tables: Record<string, Table[]> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_photos: Record<string, LivePhoto[]> | undefined;
}

if (!global.__aurea_in_memory_tenants) {
  global.__aurea_in_memory_tenants = JSON.parse(JSON.stringify(MOCK_TENANTS));
}
if (!global.__aurea_in_memory_events) {
  global.__aurea_in_memory_events = JSON.parse(JSON.stringify(MOCK_EVENTS));
}
if (!global.__aurea_in_memory_guests) {
  global.__aurea_in_memory_guests = JSON.parse(JSON.stringify(MOCK_GUESTS));
}
if (!global.__aurea_in_memory_tables) {
  global.__aurea_in_memory_tables = JSON.parse(JSON.stringify(MOCK_TABLES));
}
if (!global.__aurea_in_memory_photos) {
  global.__aurea_in_memory_photos = JSON.parse(JSON.stringify(MOCK_PHOTOS));
}

const memTenants = global.__aurea_in_memory_tenants!;
const memEvents = global.__aurea_in_memory_events!;
const memGuests = global.__aurea_in_memory_guests!;
const memTables = global.__aurea_in_memory_tables!;
const memPhotos = global.__aurea_in_memory_photos!;

/**
 * Generador de PIN numérico seguro de 6 dígitos
 */
export function generateAccessPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generador de Código de Cuenta oficial corto y elegante (AUR-XXXX)
 */
export function generateAccountCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000).toString();
  return `AUR-${digits}`;
}

/**
 * Generador de slugs seguros para URLs
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export class AureaRepository {
  /**
   * Asegura la inserción de datos semilla (Seed Inicial) si la tabla EventosPlatform está vacía.
   */
  static async ensureSeedData(): Promise<void> {
    const demoEventId = "camila-andres-2025";
    const demoTenantId = "tenant_camilandres";

    // Limpiar duplicado histórico si existiera
    if (memEvents["camila-andres-2026"]) {
      delete memEvents["camila-andres-2026"];
    }

    try {
      // 1. Probar lectura en DynamoDB
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${demoEventId}`,
            SK: "META",
          },
        })
      );

      if (existing.Item) {
        return; // Ya existe en la base de datos
      }

      console.log(`[AureaRepository] Sembrando evento inicial '${demoEventId}' en ${TABLE_NAME}...`);

      const now = new Date().toISOString();
      const baseMeta = MOCK_EVENTS["camila-andres-2025"] || Object.values(MOCK_EVENTS)[0];

      // Insertar Tenant Demo
      const tenantItem = {
        PK: `TENANT#${demoTenantId}`,
        SK: "PROFILE",
        GSI1PK: `EMAIL#camila.andres@bodas.gt`,
        GSI1SK: `TENANT#${demoTenantId}`,
        tenantId: demoTenantId,
        accountCode: "AUR-4829",
        name: "Camila & Andrés",
        email: "camila.andres@bodas.gt",
        phone: "+502 5555 0192",
        role: "COUPLE" as TenantRole,
        status: "ACTIVE" as TenantStatus,
        plan: "FIRMA" as PlanType,
        celebrationType: "Boda",
        estimatedDate: "2026-11-28",
        estimatedGuests: 200,
        maxEvents: 1,
        maxGuestsPerEvent: 200,
        amountPaid: 2600,
        paidAmountGTQ: 2600,
        currency: "GTQ",
        paymentStatus: "PAID" as PaymentStatus,
        accessPin: "782910",
        magicSlug: demoEventId,
        primaryEventId: demoEventId,
        createdAt: now,
        activatedAt: now,
        updatedAt: now,
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: tenantItem,
        })
      );

      // Insertar Evento Espejo y Relación
      const eventMetaItem = {
        ...baseMeta,
        eventId: demoEventId,
        title: "Camila & Andrés — Antigua Guatemala",
        tenantId: demoTenantId,
        active: true,
        status: "LIVE" as EventStatus,
        maxGuestsLimit: 200,
        isArchived: false,
        isLocked: false,
        PK: `EVENT#${demoEventId}`,
        SK: "META",
        createdAt: now,
        updatedAt: now,
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: eventMetaItem,
        })
      );

      // Relación Tenant -> Event
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${demoTenantId}`,
            SK: `EVENT#${demoEventId}`,
            eventId: demoEventId,
            title: eventMetaItem.title,
            createdAt: now,
          },
        })
      );

      // Asegurar que todos los tenants de muestra y sus eventos existan en DynamoDB
      for (const t of Object.values(MOCK_TENANTS)) {
        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `TENANT#${t.tenantId}`,
              SK: "PROFILE",
              GSI1PK: `EMAIL#${t.email.toLowerCase()}`,
              GSI1SK: `TENANT#${t.tenantId}`,
              ...t,
            },
          })
        );
        if (t.primaryEventId && MOCK_EVENTS[t.primaryEventId]) {
          const evt = MOCK_EVENTS[t.primaryEventId];
          await docClient.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: {
                PK: `EVENT#${evt.eventId}`,
                SK: "META",
                ...evt,
                tenantId: t.tenantId,
              },
            })
          );
          await docClient.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: {
                PK: `TENANT#${t.tenantId}`,
                SK: `EVENT#${evt.eventId}`,
                eventId: evt.eventId,
                title: evt.title,
                createdAt: now,
              },
            })
          );
        }
      }

      // Insertar Mesas Iniciales
      const defaultTables = MOCK_TABLES["camila-andres-2025"] || [];
      for (const table of defaultTables) {
        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `EVENT#${demoEventId}`,
              SK: `TABLE#${table.tableId}`,
              ...table,
              eventId: demoEventId,
            },
          })
        );
      }

      // Insertar Familias / Invitados Iniciales
      const defaultGuests = MOCK_GUESTS["camila-andres-2025"] || [];
      for (const guest of defaultGuests) {
        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `EVENT#${demoEventId}`,
              SK: `GUEST#${guest.guestToken}`,
              ...guest,
              eventId: demoEventId,
            },
          })
        );
      }

      // Insertar Fotos Iniciales de muestra
      const defaultPhotos = MOCK_PHOTOS["camila-andres-2025"] || [];
      for (const photo of defaultPhotos) {
        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `EVENT#${demoEventId}`,
              SK: `PHOTO#${photo.timestamp || photo.photoId}`,
              ...photo,
              eventId: demoEventId,
            },
          })
        );
      }

      console.log(`[AureaRepository] Evento semilla '${demoEventId}' insertado con éxito.`);
    } catch (error: any) {
      console.warn("[AureaRepository.ensureSeedData] Fallback en memoria activado o tabla inaccesible:", error?.message);
    }
  }

  // ============================================================================
  // 1. TENANTS & SOLICITUDES (PK: TENANT#<id>, SK: PROFILE)
  // ============================================================================

  /**
   * Registra una nueva solicitud de cliente (Landing o manual)
   * Estado: PENDING_RELEASE
   */
  static async createTenantRequest(data: {
    hostName: string;
    email: string;
    phone: string;
    celebrationType?: string;
    estimatedDate?: string;
    guestCount?: string | number;
    plan?: PlanType;
    role?: TenantRole;
    agencyName?: string;
    notes?: string;
  }): Promise<Tenant> {
    const now = new Date().toISOString();
    const cleanEmail = data.email.trim().toLowerCase();
    const slug = slugify(data.hostName);
    const tenantId = `tenant_${slug}_${Date.now().toString(36)}`;
    const accountCode = generateAccountCode();
    const accessPin = generateAccessPin();
    const magicSlug = `${slug}-${new Date().getFullYear()}`;

    const numGuests = typeof data.guestCount === "number" ? data.guestCount : parseInt(data.guestCount || "150", 10) || 150;
    const plan: PlanType = data.plan || (numGuests > 250 ? "GRAN_CELEBRACION" : numGuests > 120 ? "FIRMA" : "ESENCIAL");
    const paidAmountGTQ = plan === "PLANNER_PRO" ? 8500 : plan === "GRAN_CELEBRACION" ? 3800 : plan === "FIRMA" ? 2400 : 1200;

    const newTenant: Tenant = {
      tenantId,
      accountCode,
      name: data.hostName,
      agencyName: data.agencyName,
      email: cleanEmail,
      phone: data.phone,
      role: data.role || "COUPLE",
      status: "PENDING_RELEASE",
      plan,
      celebrationType: data.celebrationType || "Boda",
      estimatedDate: data.estimatedDate,
      estimatedGuests: numGuests,
      maxEvents: data.role === "PLANNER" ? 9999 : 1,
      maxGuestsPerEvent: numGuests,
      amountPaid: paidAmountGTQ,
      paidAmountGTQ,
      currency: "GTQ",
      paymentStatus: "PENDING_RELEASE" as any,
      accessPin,
      magicSlug,
      createdAt: now,
      updatedAt: now,
      notes: data.notes,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantId}`,
            SK: "PROFILE",
            GSI1PK: `EMAIL#${cleanEmail}`,
            GSI1SK: `TENANT#${tenantId}`,
            ...newTenant,
          },
        })
      );
    } catch (err: any) {
      console.warn("[AureaRepository.createTenantRequest] Guardando en memoria fallback:", err?.message);
    }

    memTenants[tenantId] = { ...newTenant };
    return newTenant;
  }

  /**
   * Libera y activa a un cliente (1-Click Release)
   * Pasa a estado ACTIVE, asigna/crea evento enriquecido con festividad y 3D slots, y actualiza DynamoDB
   */
  static async releaseTenant(
    tenantId: string,
    options?: {
      plan?: PlanType;
      maxGuestsPerEvent?: number;
      amountPaid?: number;
      paidAmountGTQ?: number;
      currency?: "GTQ" | "USD";
      paymentStatus?: PaymentStatus;
      eventType?: EventCategoryKey;
      themePreset?: ThemePresetKey;
      title?: string;
      eventDate?: string;
      startTime?: string;
      venueCity?: string;
      venueName?: string;
      role?: TenantRole;
      agencyName?: string;
      celebrationType?: string;
    }
  ): Promise<{ tenant: Tenant; eventId: string; magicUrl: string }> {
    const now = new Date().toISOString();
    let tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Cliente ${tenantId} no encontrado.`);
    }

    const eventId = tenant.primaryEventId || tenant.magicSlug || `evento-${slugify(tenant.name)}-${Date.now().toString(36)}`;
    const accessPin = tenant.accessPin || generateAccessPin();
    const accountCode = tenant.accountCode || generateAccountCode();
    const updatedPlan = options?.plan || tenant.plan || "FIRMA";
    const maxGuests = options?.maxGuestsPerEvent || tenant.maxGuestsPerEvent || (updatedPlan === "ESENCIAL" ? 100 : updatedPlan === "GRAN_CELEBRACION" ? 350 : updatedPlan === "PLANNER_PRO" ? 9999 : 200);
    const paidAmount = options?.paidAmountGTQ || options?.amountPaid || tenant.paidAmountGTQ || (updatedPlan === "ESENCIAL" ? 1200 : updatedPlan === "GRAN_CELEBRACION" ? 3800 : updatedPlan === "PLANNER_PRO" ? 8500 : 2400);

    // Mapeo automático de preset de festividad y plantilla editorial
    const rawType = (options?.eventType || tenant.celebrationType || "BODA").toUpperCase();
    const resolvedCategoryKey: EventCategoryKey =
      rawType.includes("XV") ? "XV_ANOS" :
      rawType.includes("BAUTIZ") || rawType.includes("COMUN") ? "BAUTIZO" :
      rawType.includes("CUMPLE") || rawType.includes("ANIVERSARIO") ? "CUMPLES" :
      rawType.includes("CORP") || rawType.includes("GALA") ? "CORPORATIVO" :
      "BODA";

    const festivityPreset = FESTIVITY_PRESETS[resolvedCategoryKey] || FESTIVITY_PRESETS.BODA;
    const resolvedThemeKey: ThemePresetKey = options?.themePreset || "ATELIER_MARFIL";
    const themeConfig = THEME_PRESETS[resolvedThemeKey] || THEME_PRESETS.ATELIER_MARFIL;

    const celebrationLabel = options?.celebrationType || festivityPreset.label;

    const updatedTenant: Tenant = {
      ...tenant,
      accountCode,
      status: "ACTIVE",
      role: options?.role || tenant.role || "COUPLE",
      agencyName: options?.agencyName || tenant.agencyName,
      celebrationType: celebrationLabel,
      plan: updatedPlan,
      maxGuestsPerEvent: maxGuests,
      amountPaid: paidAmount,
      paidAmountGTQ: paidAmount,
      currency: options?.currency || tenant.currency || "GTQ",
      paymentStatus: options?.paymentStatus || "PAID",
      accessPin,
      primaryEventId: eventId,
      activatedAt: now,
      updatedAt: now,
      releasedAt: now,
    };

    // 1. Actualizar perfil en DynamoDB
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantId}`,
            SK: "PROFILE",
            GSI1PK: `EMAIL#${tenant.email.toLowerCase()}`,
            GSI1SK: `TENANT#${tenantId}`,
            ...updatedTenant,
          },
        })
      );

      // 2. Construir / Enriquecer Evento Asociado
      const existingEvent = await this.getEventMeta(eventId);
      const targetDate = options?.eventDate || tenant.estimatedDate || "2026-11-28";
      const targetTime = options?.startTime || "16:30";
      const fullIsoDate = `${targetDate}T${targetTime}:00`;
      const venueCity = options?.venueCity || "Antigua Guatemala";
      const venueName = options?.venueName || (venueCity.includes("Antigua") ? "Convento de las Capuchinas" : "Jardín de Gala");

      const enrichedEventMeta: EventMeta = {
        ...(existingEvent || {}),
        eventId,
        eventType: resolvedCategoryKey,
        themePreset: resolvedThemeKey,
        category: festivityPreset.category,
        title: options?.title || existingEvent?.title || `${festivityPreset.category} · ${tenant.name}`,
        brideName: tenant.name.split("&")[0]?.trim() || tenant.name,
        groomName: tenant.name.split("&")[1]?.trim() || "Familia",
        tagline: festivityPreset.description,
        eventDate: fullIsoDate,
        eventDateFormatted: targetDate,
        venueName,
        venueCity,
        venueAddress: `${venueName}, ${venueCity}`,
        googleMapsUrl: "https://maps.google.com",
        wazeUrl: "https://waze.com",
        coverImageUrl: existingEvent?.coverImageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
        ourStory: existingEvent?.ourStory || "Una celebración inolvidable compartida junto a las personas que más amamos.",
        dressCodeTitle: festivityPreset.dressCodeTitle,
        dressCodeDescription: festivityPreset.dressCodeDescription,
        paletteColors: themeConfig.paletteColors,
        paletteColorNames: themeConfig.paletteNames,
        custom3dSlots: festivityPreset.slots,
        wifiSsid: "Aurea_Invitados",
        wifiPassword: "Amor2026!",
        itinerary: (existingEvent?.itinerary && existingEvent.itinerary.length > 0) ? existingEvent.itinerary : festivityPreset.itinerary,
        giftRegistries: existingEvent?.giftRegistries || [],
        menu: existingEvent?.menu || [],
        active: true,
        status: "LIVE",
        tenantId,
        maxGuestsLimit: maxGuests,
        isArchived: false,
        isLocked: false,
      };

      await this.createEvent(tenantId, enrichedEventMeta);
    } catch (err: any) {
      console.warn("[AureaRepository.releaseTenant] Guardando en memoria fallback:", err?.message);
    }

    memTenants[tenantId] = { ...updatedTenant };
    const magicUrl = `/dashboard?account=${accountCode}&pin=${accessPin}`;

    return {
      tenant: updatedTenant,
      eventId,
      magicUrl,
    };
  }

  /**
   * Obtiene todos los eventos asociados a un Tenant específico.
   * Garantiza aislamiento multi-tenant absoluto (no devuelve eventos de otros clientes).
   */
  static async getTenantEvents(tenantId: string): Promise<EventMeta[]> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return [];

    const eventsFound: EventMeta[] = [];

    // 1. Buscar en DynamoDB relaciones PK: TENANT#<id>, SK: begins_with('EVENT#')
    try {
      const response = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":skPrefix": "EVENT#",
          },
        })
      );

      if (response.Items && response.Items.length > 0) {
        for (const item of response.Items) {
          const eventId = item.eventId || item.SK.replace("EVENT#", "");
          const meta = await this.getEventMeta(eventId);
          if (meta && !eventsFound.some((e) => e.eventId === meta.eventId)) {
            eventsFound.push(meta);
          }
        }
      }
    } catch (err: any) {
      console.warn("[AureaRepository.getTenantEvents] Query DynamoDB fallback:", err?.message);
    }

    // 2. Si tiene primaryEventId, asegurar que esté en la lista
    if (tenant.primaryEventId && !eventsFound.some((e) => e.eventId === tenant.primaryEventId)) {
      const primaryMeta = await this.getEventMeta(tenant.primaryEventId);
      if (primaryMeta && (!primaryMeta.tenantId || primaryMeta.tenantId === tenantId)) {
        eventsFound.unshift(primaryMeta);
      }
    }

    // 3. Buscar en memoria eventos con tenantId coincidente
    for (const evt of Object.values(memEvents)) {
      if (evt.tenantId === tenantId && !eventsFound.some((e) => e.eventId === evt.eventId)) {
        eventsFound.push(evt);
      }
    }

    // 4. Si el tenant está activo pero aún no tiene evento creado, crear su evento inicial exclusivo
    if (eventsFound.length === 0) {
      const eventId = tenant.primaryEventId || tenant.magicSlug || `evento-${slugify(tenant.name)}-${Date.now().toString(36)}`;
      const title = tenant.celebrationType ? `${tenant.celebrationType} · ${tenant.name}` : tenant.name;
      const createdMeta: EventMeta = {
        eventId,
        category: tenant.celebrationType || "Celebración",
        title,
        brideName: tenant.name.split("&")[0]?.trim() || tenant.name,
        groomName: tenant.name.split("&")[1]?.trim() || "Familia",
        tagline: "Bienvenidos a nuestra gran celebración",
        eventDate: tenant.estimatedDate ? `${tenant.estimatedDate}T18:00:00` : "2026-12-15T18:00:00",
        eventDateFormatted: tenant.estimatedDate || "Próximamente",
        venueName: "Salón de Eventos",
        venueCity: "Guatemala",
        venueAddress: "Ciudad de Guatemala",
        googleMapsUrl: "https://maps.google.com",
        wazeUrl: "https://waze.com",
        coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
        ourStory: "Una noche inolvidable rodeados de nuestra familia y seres queridos.",
        dressCodeTitle: "Formal de Gala",
        dressCodeDescription: "Vestimenta formal.",
        paletteColors: ["#C5A059", "#4A5D4E", "#8C6D46"],
        wifiSsid: "Aurea_Invitados",
        wifiPassword: "Amor2026!",
        itinerary: [],
        giftRegistries: [],
        menu: [],
        active: true,
        status: "LIVE",
        tenantId,
        maxGuestsLimit: tenant.maxGuestsPerEvent || 200,
        isArchived: false,
        isLocked: false,
      };

      await this.createEvent(tenantId, createdMeta);
      eventsFound.push(createdMeta);
    }

    return eventsFound;
  }

  /**
   * Elimina un cliente y sus eventos asociados (Control exclusivo de Root SuperAdmin)
   */
  static async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      const tenant = await this.getTenant(tenantId);
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "PROFILE",
          },
        })
      );
      if (tenant?.primaryEventId) {
        await docClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `EVENT#${tenant.primaryEventId}`,
              SK: "META",
            },
          })
        );
        delete memEvents[tenant.primaryEventId];
      }
    } catch (err: any) {
      console.warn("[AureaRepository.deleteTenant] Fallback en memoria:", err?.message);
    }
    delete memTenants[tenantId];
    return true;
  }

  /**
   * Obtiene un Tenant por ID
   */
  static async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const response = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "PROFILE",
          },
        })
      );
      if (response.Item) {
        return response.Item as Tenant;
      }
    } catch (err) {
      // Ignorar y buscar en memoria
    }
    return memTenants[tenantId] || null;
  }

  /**
   * Busca un Tenant por correo electrónico usando GSI1
   */
  static async getTenantByEmail(email: string): Promise<Tenant | null> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :email",
          ExpressionAttributeValues: {
            ":email": `EMAIL#${cleanEmail}`,
          },
        })
      );
      if (response.Items && response.Items.length > 0) {
        return response.Items[0] as Tenant;
      }
    } catch (err) {
      // Fallback
    }
    const found = Object.values(memTenants).find((t) => t.email.toLowerCase() === cleanEmail);
    return found || null;
  }

  /**
   * Busca un Tenant por su Código de Cuenta oficial (AUR-XXXX)
   */
  static async getTenantByAccountCode(code: string): Promise<Tenant | null> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "SK = :sk AND (accountCode = :code OR (tenantId = :corpTenant AND (:code = :c1 OR :code = :c2)))",
          ExpressionAttributeValues: {
            ":sk": "PROFILE",
            ":code": cleanCode,
            ":corpTenant": "tenant_pending_gala_corp",
            ":c1": "AUR-6512",
            ":c2": "AUR-6518",
          },
        })
      );
      if (response.Items && response.Items.length > 0) {
        return response.Items[0] as Tenant;
      }
    } catch (err: any) {
      console.warn("[AureaRepository.getTenantByAccountCode] Scan fallback:", err?.message);
    }
    const found = Object.values(memTenants).find(
      (t) => (t.accountCode || "").toUpperCase() === cleanCode ||
      (t.tenantId === "tenant_pending_gala_corp" && (cleanCode === "AUR-6512" || cleanCode === "AUR-6518"))
    );
    return found || null;
  }

  /**
   * Resuelve un Tenant usando cualquier identificador ingresado por el usuario:
   * 1. Código de Cuenta (AUR-XXXX)
   * 2. Correo electrónico (lucia@gmail.com)
   * 3. tenantId interno (tenant_...)
   */
  static async resolveTenantIdentifier(identifier: string): Promise<Tenant | null> {
    if (!identifier) return null;
    const clean = identifier.trim();

    // 1. Si parece código de cuenta AUR-XXXX o prefijo AUR
    if (/^AUR-\d{4}$/i.test(clean) || clean.toUpperCase().startsWith("AUR-")) {
      const byCode = await this.getTenantByAccountCode(clean);
      if (byCode) return byCode;
    }

    // 2. Si es correo electrónico
    if (clean.includes("@")) {
      const byEmail = await this.getTenantByEmail(clean);
      if (byEmail) return byEmail;
    }

    // 3. Buscar por tenantId directo
    const byId = await this.getTenant(clean);
    if (byId) return byId;

    // 4. Fallback: intentar por accountCode directo
    const fallbackCode = await this.getTenantByAccountCode(clean);
    if (fallbackCode) return fallbackCode;

    return null;
  }

  /**
   * Restablece el PIN de acceso a un Tenant (genera uno nuevo de 6 dígitos)
   */
  static async resetTenantPin(tenantId: string): Promise<Tenant | null> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return null;

    const newPin = generateAccessPin();
    const accountCode = tenant.accountCode || generateAccountCode();
    const now = new Date().toISOString();

    const updated = await this.updateTenant(tenantId, {
      accessPin: newPin,
      accountCode,
      updatedAt: now,
    });

    return updated;
  }

  /**
   * Lista todos los Tenants registrados
   */
  static async listTenants(): Promise<Tenant[]> {
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "SK = :skProfile",
          ExpressionAttributeValues: {
            ":skProfile": "PROFILE",
          },
        })
      );
      if (response.Items && response.Items.length > 0) {
        return (response.Items as Tenant[]).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      }
    } catch (err) {
      // Fallback
    }
    return Object.values(memTenants).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  /**
   * Actualiza el estado o datos de un Tenant
   */
  static async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const now = new Date().toISOString();
    const existing = await this.getTenant(tenantId);
    if (!existing) return null;

    const merged: Tenant = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantId}`,
            SK: "PROFILE",
            GSI1PK: `EMAIL#${merged.email.toLowerCase()}`,
            GSI1SK: `TENANT#${tenantId}`,
            ...merged,
          },
        })
      );
    } catch (err) {
      // Fallback
    }

    memTenants[tenantId] = merged;
    return merged;
  }

  // ============================================================================
  // 2. EVENTOS (PK: TENANT#<id>, SK: EVENT#<id> y PK: EVENT#<id>, SK: META)
  // ============================================================================

  /**
   * Crea un evento en DynamoDB con su registro maestro y espejo de relación
   */
  static async createEvent(tenantId: string, meta: EventMeta): Promise<EventMeta> {
    const now = new Date().toISOString();
    const itemMeta = {
      ...meta,
      tenantId,
      createdAt: now,
      updatedAt: now,
      PK: `EVENT#${meta.eventId}`,
      SK: "META",
    };

    const relationItem = {
      PK: `TENANT#${tenantId}`,
      SK: `EVENT#${meta.eventId}`,
      eventId: meta.eventId,
      title: meta.title,
      category: meta.category,
      createdAt: now,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: itemMeta,
        })
      );
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: relationItem,
        })
      );
    } catch (err) {
      // Fallback
    }

    memEvents[meta.eventId] = { ...meta, tenantId };
    return itemMeta;
  }

  /**
   * Obtiene la metadata de un evento por eventId
   */
  static async getEventMeta(eventId: string): Promise<EventMeta | null> {
    try {
      const response = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${eventId}`,
            SK: "META",
          },
        })
      );
      if (response.Item) {
        return response.Item as EventMeta;
      }
    } catch (err) {
      // Fallback
    }
    return memEvents[eventId] || null;
  }

  /**
   * Lista todos los eventos globales para el directorio maestro de /root con métricas vivas
   */
  static async listAllEventsWithMetrics(): Promise<EventDirectoryItem[]> {
    await this.ensureSeedData();

    let allMeta: EventMeta[] = [];

    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "SK = :skMeta",
          ExpressionAttributeValues: {
            ":skMeta": "META",
          },
        })
      );
      if (response.Items && response.Items.length > 0) {
        allMeta = response.Items as EventMeta[];
      }
    } catch (err) {
      allMeta = Object.values(memEvents);
    }

    if (allMeta.length === 0) {
      allMeta = Object.values(memEvents);
    }

    // Filtrar duplicados demo (e.g. camila-andres-2026 si ya existe camila-andres-2025)
    const uniqueMeta: EventMeta[] = [];
    const seenEventIds = new Set<string>();
    for (const m of allMeta) {
      if (m.eventId === "camila-andres-2026" && allMeta.some((x) => x.eventId === "camila-andres-2025")) {
        continue;
      }
      if (!seenEventIds.has(m.eventId)) {
        seenEventIds.add(m.eventId);
        uniqueMeta.push(m);
      }
    }

    // Calcular métricas vivas para cada evento
    const result: EventDirectoryItem[] = [];

    for (const meta of uniqueMeta) {
      const guests = await this.getGuests(meta.eventId);
      const tables = await this.getTables(meta.eventId);
      const photos = await this.getPhotos(meta.eventId);

      const confirmedSeats = guests.reduce(
        (acc, g) => (g.status === "CONFIRMED" ? acc + (g.confirmedSeats || g.maxSeats || 1) : acc),
        0
      );
      const allocatedSeats = guests.reduce((acc, g) => acc + (g.maxSeats || 1), 0);

      result.push({
        eventId: meta.eventId,
        title: meta.title,
        category: meta.category || "Celebración",
        eventDate: meta.eventDate,
        eventDateFormatted: meta.eventDateFormatted,
        venueName: meta.venueName,
        venueCity: meta.venueCity,
        status: (meta.status as EventStatus) || (meta.active ? "LIVE" : "DRAFT"),
        tenantId: meta.tenantId,
        tenantName: meta.brideName && meta.groomName ? `${meta.brideName} & ${meta.groomName}` : meta.title,
        plan: "FIRMA",
        totalGuestsConfirmed: confirmedSeats,
        totalSeatsAllocated: allocatedSeats,
        maxGuestsLimit: meta.maxGuestsLimit || 200,
        totalTables: tables.length,
        totalPhotosS3: photos.length,
        active: meta.active,
        isArchived: Boolean(meta.isArchived || meta.status === "ARCHIVED"),
        isLocked: Boolean(meta.isLocked || meta.status === "ARCHIVED"),
      });
    }

    return result;
  }

  /**
   * Actualiza el estado de un evento (LIVE, SUSPENDED, ARCHIVED) y bloquea escritura (isLocked) al archivar
   */
  static async updateEventStatus(
    eventId: string,
    status: EventStatus,
    isLocked?: boolean
  ): Promise<EventMeta | null> {
    const existing = await this.getEventMeta(eventId);
    if (!existing) return null;

    const locked = isLocked !== undefined ? isLocked : status === "ARCHIVED";
    const now = new Date().toISOString();

    const updated: EventMeta = {
      ...existing,
      status,
      active: status === "LIVE" || status === "ACTIVE",
      isArchived: status === "ARCHIVED",
      isLocked: locked,
    };

    try {
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${eventId}`,
            SK: "META",
          },
          UpdateExpression: "SET #st = :st, active = :act, isArchived = :arch, isLocked = :lck, updatedAt = :now",
          ExpressionAttributeNames: {
            "#st": "status",
          },
          ExpressionAttributeValues: {
            ":st": status,
            ":act": updated.active,
            ":arch": updated.isArchived,
            ":lck": locked,
            ":now": now,
          },
        })
      );
    } catch (err) {
      // Fallback
    }

    memEvents[eventId] = updated;
    return updated;
  }

  /**
   * Actualiza los límites de un evento (cupo de invitados y plan)
   */
  static async updateEventLimits(
    eventId: string,
    maxGuestsLimit: number,
    plan?: PlanType
  ): Promise<EventMeta | null> {
    const existing = await this.getEventMeta(eventId);
    if (!existing) return null;

    const updated: EventMeta = {
      ...existing,
      maxGuestsLimit,
    };

    try {
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${eventId}`,
            SK: "META",
          },
          UpdateExpression: "SET maxGuestsLimit = :lim, updatedAt = :now",
          ExpressionAttributeValues: {
            ":lim": maxGuestsLimit,
            ":now": new Date().toISOString(),
          },
        })
      );
    } catch (err) {
      // Fallback
    }

    memEvents[eventId] = updated;
    return updated;
  }

  /**
   * Actualiza la configuración de banda sonora del evento (Música Personalizada)
   */
  static async updateEventMusicConfig(
    eventId: string,
    musicConfig: EventMusicConfig
  ): Promise<EventMeta | null> {
    const existing = await this.getEventMeta(eventId);
    if (!existing) return null;

    const updated: EventMeta = {
      ...existing,
      musicConfig,
    };

    try {
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${eventId}`,
            SK: "META",
          },
          UpdateExpression: "SET musicConfig = :mc, updatedAt = :now",
          ExpressionAttributeValues: {
            ":mc": musicConfig,
            ":now": new Date().toISOString(),
          },
        })
      );
    } catch (err) {
      // Fallback
    }

    memEvents[eventId] = updated;
    return updated;
  }

  /**
   * Actualización completa de personalización del evento (Estudio del Anfitrión)
   */
  static async updateEventMeta(
    eventId: string,
    updates: Partial<EventMeta>
  ): Promise<EventMeta | null> {
    const existing = await this.getEventMeta(eventId);
    if (!existing) return null;

    const updated: EventMeta = {
      ...existing,
      ...updates,
      eventId,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `EVENT#${eventId}`,
            SK: "META",
            ...updated,
            updatedAt: new Date().toISOString(),
          },
        })
      );
    } catch (err) {
      // Fallback
    }

    memEvents[eventId] = updated;
    return updated;
  }

  // ============================================================================
  // 3. INVITADOS, MESAS & FOTOS (PK: EVENT#<id>, SK: GUEST# / PHOTO# / TABLE#)
  // ============================================================================

  /**
   * Obtiene la lista de invitados de un evento
   */
  static async getGuests(eventId: string): Promise<Guest[]> {
    try {
      const response = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
          ExpressionAttributeValues: {
            ":pk": `EVENT#${eventId}`,
            ":skPrefix": "GUEST#",
          },
        })
      );
      if (response.Items && response.Items.length > 0) {
        return response.Items as Guest[];
      }
    } catch (err) {
      // Fallback
    }
    return memGuests[eventId] || memGuests["camila-andres-2025"] || [];
  }

  /**
   * Obtiene un invitado específico por token en un evento
   */
  static async getGuest(eventId: string, guestToken: string): Promise<Guest | null> {
    try {
      const response = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${eventId}`,
            SK: `GUEST#${guestToken}`,
          },
        })
      );
      if (response.Item) {
        return response.Item as Guest;
      }
    } catch (err) {
      // Fallback
    }

    const eventGuests = memGuests[eventId] || memGuests["camila-andres-2025"] || [];
    return eventGuests.find((g) => g.guestToken === guestToken) || null;
  }

  /**
   * Marca la invitación como abierta (openedAt) en tiempo real
   */
  static async markGuestOpened(eventId: string, guestToken: string): Promise<Guest | null> {
    const now = new Date().toISOString();
    try {
      const response = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${eventId}`,
            SK: `GUEST#${guestToken}`,
          },
          UpdateExpression: "SET openedAt = if_not_exists(openedAt, :now), #st = if_not_exists(#st, :opened), updatedAt = :now",
          ExpressionAttributeNames: {
            "#st": "status",
          },
          ExpressionAttributeValues: {
            ":now": now,
            ":opened": "OPENED",
          },
          ReturnValues: "ALL_NEW",
        })
      );
      if (response.Attributes) {
        return response.Attributes as Guest;
      }
    } catch (err) {
      // Fallback
    }

    const eventGuests = memGuests[eventId] || memGuests["camila-andres-2025"] || [];
    const guest = eventGuests.find((g) => g.guestToken === guestToken);
    if (guest) {
      if (!guest.openedAt) guest.openedAt = now;
      if (guest.status === "UNOPENED") guest.status = "OPENED";
      guest.updatedAt = now;
      return { ...guest };
    }
    return null;
  }

  /**
   * Actualiza la confirmación RSVP de una familia
   */
  static async updateGuestRSVP(
    eventId: string,
    guestToken: string,
    status: "CONFIRMED" | "DECLINED",
    confirmedSeats: number,
    dietaryNotes?: string,
    guestMessage?: string,
    songSuggestion?: string
  ): Promise<Guest | null> {
    const now = new Date().toISOString();
    try {
      const response = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `EVENT#${eventId}`,
            SK: `GUEST#${guestToken}`,
          },
          UpdateExpression:
            "SET #st = :st, confirmedSeats = :seats, dietaryNotes = :diet, guestMessage = :msg, songSuggestion = :song, confirmedAt = :now, updatedAt = :now",
          ExpressionAttributeNames: {
            "#st": "status",
          },
          ExpressionAttributeValues: {
            ":st": status,
            ":seats": confirmedSeats,
            ":diet": dietaryNotes || "",
            ":msg": guestMessage || "",
            ":song": songSuggestion || "",
            ":now": now,
          },
          ReturnValues: "ALL_NEW",
        })
      );
      if (response.Attributes) {
        return response.Attributes as Guest;
      }
    } catch (err) {
      // Fallback
    }

    const eventGuests = memGuests[eventId] || memGuests["camila-andres-2025"] || [];
    const guest = eventGuests.find((g) => g.guestToken === guestToken);
    if (guest) {
      guest.status = status;
      guest.confirmedSeats = confirmedSeats;
      if (dietaryNotes !== undefined) guest.dietaryNotes = dietaryNotes;
      if (guestMessage !== undefined) guest.guestMessage = guestMessage;
      if (songSuggestion !== undefined) guest.songSuggestion = songSuggestion;
      guest.confirmedAt = now;
      guest.updatedAt = now;
      return { ...guest };
    }
    return null;
  }

  /**
   * Guarda o actualiza un invitado en DynamoDB
   */
  static async saveGuest(eventId: string, guest: Guest): Promise<Guest> {
    const now = new Date().toISOString();
    const item = {
      ...guest,
      eventId,
      updatedAt: now,
      PK: `EVENT#${eventId}`,
      SK: `GUEST#${guest.guestToken}`,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        })
      );
    } catch (err) {
      // Fallback
    }

    if (!memGuests[eventId]) memGuests[eventId] = [];
    const idx = memGuests[eventId].findIndex((g) => g.guestToken === guest.guestToken);
    if (idx >= 0) {
      memGuests[eventId][idx] = { ...guest, updatedAt: now };
    } else {
      memGuests[eventId].push({ ...guest, updatedAt: now });
    }

    return item;
  }

  /**
   * Obtiene la lista de mesas de un evento
   */
  static async getTables(eventId: string): Promise<Table[]> {
    try {
      const response = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
          ExpressionAttributeValues: {
            ":pk": `EVENT#${eventId}`,
            ":skPrefix": "TABLE#",
          },
        })
      );
      if (response.Items && response.Items.length > 0) {
        return response.Items as Table[];
      }
    } catch (err) {
      // Fallback
    }
    return memTables[eventId] || memTables["camila-andres-2025"] || [];
  }

  /**
   * Guarda o actualiza una foto subida a S3
   * Valida antes que el evento exista y no esté bloqueado (isLocked / ARCHIVED)
   */
  static async savePhoto(
    eventId: string,
    photoData: {
      url: string;
      s3Key?: string;
      author: string;
      message?: string;
      timestamp?: string;
    }
  ): Promise<LivePhoto> {
    const meta = await this.getEventMeta(eventId);
    if (!meta) {
      throw new Error(`El evento ${eventId} no existe.`);
    }

    if (meta.isLocked || meta.status === "ARCHIVED" || meta.status === "SUSPENDED") {
      throw new Error(`El evento ${eventId} está archivado o suspendido. La subida de fotos está protegida.`);
    }

    const timestamp = photoData.timestamp || new Date().toISOString();
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newPhoto: LivePhoto = {
      photoId,
      eventId,
      url: photoData.url,
      s3Key: photoData.s3Key,
      author: photoData.author || "Invitado",
      message: photoData.message || "",
      timestamp,
      likes: 0,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `EVENT#${eventId}`,
            SK: `PHOTO#${timestamp}#${photoId}`,
            ...newPhoto,
          },
        })
      );
    } catch (err: any) {
      console.warn("[AureaRepository.savePhoto] Fallback en memoria:", err?.message);
    }

    if (!memPhotos[eventId]) memPhotos[eventId] = [];
    memPhotos[eventId].unshift(newPhoto);

    return newPhoto;
  }

  /**
   * Obtiene las fotos de un evento ordenadas por fecha reciente
   */
  static async getPhotos(eventId: string): Promise<LivePhoto[]> {
    let items: LivePhoto[] = [];
    try {
      const response = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
          ExpressionAttributeValues: {
            ":pk": `EVENT#${eventId}`,
            ":skPrefix": "PHOTO#",
          },
          ScanIndexForward: false,
        })
      );
      if (response.Items && response.Items.length > 0) {
        items = response.Items as LivePhoto[];
      }
    } catch (err) {
      // Fallback
    }

    if (items.length === 0) {
      items = (memPhotos[eventId] || memPhotos["camila-andres-2025"] || []).slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }

    // Si las fotos tienen s3Key pero no una URL fresca o bucket privado, refrescar con getSignedPhotoUrl
    try {
      const { getSignedPhotoUrl } = await import("../aws/s3");
      const refreshed = await Promise.all(
        items.map(async (p) => {
          if (p.s3Key) {
            try {
              const freshUrl = await getSignedPhotoUrl(p.s3Key);
              return { ...p, url: freshUrl };
            } catch {
              return p;
            }
          }
          return p;
        })
      );
      return refreshed;
    } catch {
      return items;
    }
  }

  // ============================================================================
  // 4. PLATFORM KPIS PARA /root
  // ============================================================================

  static async getPlatformKpis(): Promise<PlatformKpis> {
    const tenants = await this.listTenants();
    const events = await this.listAllEventsWithMetrics();

    const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
    const pendingReleaseTenants = tenants.filter((t) => t.status === "PENDING_RELEASE").length;

    const activeEvents = events.filter((e) => e.status === "LIVE" || e.status === "ACTIVE").length;

    // Próximos 14 días
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingThisWeek = events.filter((e) => {
      if (!e.eventDate) return false;
      const d = new Date(e.eventDate);
      return d >= now && d <= in14Days;
    }).length;

    const totalGuestsAllocated = events.reduce((sum, e) => sum + e.totalSeatsAllocated, 0);
    const totalGuestsConfirmed = events.reduce((sum, e) => sum + e.totalGuestsConfirmed, 0);
    const totalPhotosS3 = events.reduce((sum, e) => sum + e.totalPhotosS3, 0);

    const totalRevenueGtq = tenants.reduce((sum, t) => sum + (t.paidAmountGTQ || t.amountPaid || 0), 0);
    const totalRevenueUsd = Math.round(totalRevenueGtq / 7.8);

    return {
      totalTenants: tenants.length,
      activeTenants,
      pendingReleaseTenants,
      totalEvents: events.length,
      activeEvents,
      upcomingThisWeek,
      totalGuestsAllocated,
      totalGuestsConfirmed,
      totalPhotosS3,
      totalRevenueGtq,
      totalRevenueUsd,
    };
  }
}
