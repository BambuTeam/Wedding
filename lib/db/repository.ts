import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  isDynamoConfigured,
  getDynamoClient,
  DYNAMO_TABLE_NAME,
} from "./dynamo";
import {
  EventMeta,
  Guest,
  Table,
  LivePhoto,
  CheckInResult,
  EventDashboardStats,
  GuestStatus,
  Tenant,
  TenantRole,
  TenantStatus,
  PlanType,
  PaymentStatus,
  EventStatus,
  PlatformKpis,
  EventDirectoryItem,
  CreateTenantRequestPayload,
  ReleaseTenantPayload,
  EventMusicConfig,
} from "../types";
import {
  MOCK_EVENTS,
  MOCK_GUESTS,
  MOCK_TABLES,
  MOCK_PHOTOS,
  MOCK_TENANTS,
  DEFAULT_EVENT_ID,
} from "./mock-data";

// ---------------------------------------------------------------------------
// In-Memory Global State (Preserved across Route Handler invocations in dev)
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var __aurea_in_memory_events: Record<string, EventMeta> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_guests: Record<string, Guest[]> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_tables: Record<string, Table[]> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_photos: Record<string, LivePhoto[]> | undefined;
  // eslint-disable-next-line no-var
  var __aurea_in_memory_tenants: Record<string, Tenant> | undefined;
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
if (!global.__aurea_in_memory_tenants) {
  global.__aurea_in_memory_tenants = JSON.parse(JSON.stringify(MOCK_TENANTS));
}

const memoryEvents = global.__aurea_in_memory_events!;
const memoryGuests = global.__aurea_in_memory_guests!;
const memoryTables = global.__aurea_in_memory_tables!;
const memoryPhotos = global.__aurea_in_memory_photos!;
const memoryTenants = global.__aurea_in_memory_tenants!;

// ===========================================================================
// REPOSITORY IMPLEMENTATION
// ===========================================================================

export class EventsRepository {
  /**
   * Obtiene la metadata del evento
   */
  static async getEvent(eventId: string = DEFAULT_EVENT_ID): Promise<EventMeta | null> {
    if (!isDynamoConfigured()) {
      return memoryEvents[eventId] || memoryEvents[DEFAULT_EVENT_ID] || null;
    }

    try {
      const client = getDynamoClient()!;
      const command = new GetCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: "META",
        },
      });

      const response = await client.send(command);
      if (response.Item) {
        return response.Item as EventMeta;
      }
      return memoryEvents[eventId] || memoryEvents[DEFAULT_EVENT_ID] || null;
    } catch (error) {
      console.error("[Repository.getEvent] DynamoDB error, falling back to mock:", error);
      return memoryEvents[eventId] || memoryEvents[DEFAULT_EVENT_ID] || null;
    }
  }

  /**
   * Obtiene la lista de todos los eventos disponibles
   */
  static async listEvents(): Promise<EventMeta[]> {
    return Object.values(memoryEvents);
  }

  /**
   * Actualiza la configuración de música personalizada del evento
   */
  static async updateEventMusicConfig(
    eventId: string,
    musicConfig: EventMusicConfig
  ): Promise<EventMeta | null> {
    const event = await this.getEvent(eventId);
    if (!event) return null;

    event.musicConfig = musicConfig;
    memoryEvents[eventId] = event;

    if (isDynamoConfigured()) {
      try {
        const client = getDynamoClient()!;
        await client.send(
          new UpdateCommand({
            TableName: DYNAMO_TABLE_NAME,
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
        console.error("[EventsRepository.updateEventMusicConfig] DynamoDB update failed:", err);
      }
    }

    return event;
  }

  /**
   * Actualización completa de personalización del evento
   */
  static async updateEventMeta(
    eventId: string,
    updates: Partial<EventMeta>
  ): Promise<EventMeta | null> {
    const event = await this.getEvent(eventId);
    if (!event) return null;

    const updated: EventMeta = {
      ...event,
      ...updates,
      eventId,
    };
    memoryEvents[eventId] = updated;

    if (isDynamoConfigured()) {
      try {
        const client = getDynamoClient()!;
        await client.send(
          new PutCommand({
            TableName: DYNAMO_TABLE_NAME,
            Item: {
              PK: `EVENT#${eventId}`,
              SK: "META",
              ...updated,
              updatedAt: new Date().toISOString(),
            },
          })
        );
      } catch (err) {
        console.error("[EventsRepository.updateEventMeta] DynamoDB error:", err);
      }
    }

    return updated;
  }

  /**
   * Obtiene un invitado por su token único
   */
  static async getGuest(eventId: string, guestToken: string): Promise<Guest | null> {
    if (!isDynamoConfigured()) {
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase());
      return guest || null;
    }

    try {
      const client = getDynamoClient()!;
      const command = new GetCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `GUEST#${guestToken}`,
        },
      });

      const response = await client.send(command);
      if (response.Item) {
        return response.Item as Guest;
      }
      // Fallback a memoria si no se encuentra en Dynamo
      const list = memoryGuests[eventId] || [];
      return list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase()) || null;
    } catch (error) {
      console.error("[Repository.getGuest] DynamoDB error:", error);
      const list = memoryGuests[eventId] || [];
      return list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase()) || null;
    }
  }

  /**
   * Lista todos los invitados de un evento
   */
  static async getAllGuests(eventId: string = DEFAULT_EVENT_ID): Promise<Guest[]> {
    if (!isDynamoConfigured()) {
      return memoryGuests[eventId] || [];
    }

    try {
      const client = getDynamoClient()!;
      const command = new QueryCommand({
        TableName: DYNAMO_TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `EVENT#${eventId}`,
          ":skPrefix": "GUEST#",
        },
      });

      const response = await client.send(command);
      if (response.Items && response.Items.length > 0) {
        return response.Items as Guest[];
      }
      return memoryGuests[eventId] || [];
    } catch (error) {
      console.error("[Repository.getAllGuests] DynamoDB query error:", error);
      return memoryGuests[eventId] || [];
    }
  }

  /**
   * Registra la apertura silenciosa del sobre
   */
  static async trackGuestOpened(eventId: string, guestToken: string): Promise<Guest | null> {
    const now = new Date().toISOString();

    if (!isDynamoConfigured()) {
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase());
      if (guest) {
        if (guest.status === "UNOPENED") {
          guest.status = "OPENED";
          guest.openedAt = now;
          guest.updatedAt = now;
        }
        return { ...guest };
      }
      return null;
    }

    try {
      const client = getDynamoClient()!;
      const command = new UpdateCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `GUEST#${guestToken}`,
        },
        UpdateExpression: "SET #st = if_not_exists(#st, :opened), openedAt = if_not_exists(openedAt, :now), updatedAt = :now",
        ExpressionAttributeNames: {
          "#st": "status",
        },
        ExpressionAttributeValues: {
          ":opened": "OPENED",
          ":now": now,
        },
        ReturnValues: "ALL_NEW",
      });

      const response = await client.send(command);
      return response.Attributes as Guest;
    } catch (error) {
      console.error("[Repository.trackGuestOpened] DynamoDB error:", error);
      // Fallback
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase());
      if (guest && guest.status === "UNOPENED") {
        guest.status = "OPENED";
        guest.openedAt = now;
        guest.updatedAt = now;
      }
      return guest ? { ...guest } : null;
    }
  }

  /**
   * Procesa la confirmación RSVP del invitado
   */
  static async rsvpGuest(
    eventId: string,
    guestToken: string,
    data: {
      status: "CONFIRMED" | "DECLINED";
      confirmedSeats: number;
      dietaryNotes?: string;
      guestMessage?: string;
    }
  ): Promise<Guest | null> {
    const now = new Date().toISOString();

    if (!isDynamoConfigured()) {
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase());
      if (guest) {
        guest.status = data.status;
        guest.confirmedSeats = data.status === "CONFIRMED" ? Math.min(data.confirmedSeats, guest.maxSeats) : 0;
        guest.confirmedAt = now;
        guest.dietaryNotes = data.dietaryNotes || guest.dietaryNotes;
        guest.guestMessage = data.guestMessage || guest.guestMessage;
        guest.updatedAt = now;
        return { ...guest };
      }
      return null;
    }

    try {
      const client = getDynamoClient()!;
      const command = new UpdateCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `GUEST#${guestToken}`,
        },
        UpdateExpression:
          "SET #status = :st, confirmedSeats = :seats, confirmedAt = :now, dietaryNotes = :diet, guestMessage = :msg, updatedAt = :now",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":st": data.status,
          ":seats": data.status === "CONFIRMED" ? data.confirmedSeats : 0,
          ":diet": data.dietaryNotes || "",
          ":msg": data.guestMessage || "",
          ":now": now,
        },
        ReturnValues: "ALL_NEW",
      });

      const response = await client.send(command);
      return response.Attributes as Guest;
    } catch (error) {
      console.error("[Repository.rsvpGuest] DynamoDB error:", error);
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase());
      if (guest) {
        guest.status = data.status;
        guest.confirmedSeats = data.status === "CONFIRMED" ? Math.min(data.confirmedSeats, guest.maxSeats) : 0;
        guest.confirmedAt = now;
        guest.dietaryNotes = data.dietaryNotes || guest.dietaryNotes;
        guest.guestMessage = data.guestMessage || guest.guestMessage;
        guest.updatedAt = now;
        return { ...guest };
      }
      return null;
    }
  }

  /**
   * Control Anti-Fraude Atómico en Check-In (Recepción / Puerta)
   * Utiliza ConditionExpression: "attribute_not_exists(checkedInAt)"
   * Si dos tablets intentan registrar el mismo QR al unísono, la segunda falla atómicamente.
   */
  static async atomicCheckIn(
    eventId: string,
    guestToken: string,
    checkedInBy: string = "Recepción Principal"
  ): Promise<CheckInResult> {
    const now = new Date().toISOString();

    if (!isDynamoConfigured()) {
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken.toLowerCase() === guestToken.toLowerCase());

      if (!guest) {
        return {
          success: false,
          message: "Pase no encontrado. Verifique el código QR o el nombre del titular.",
        };
      }

      // Check atómico en memoria
      if (guest.checkedInAt) {
        return {
          success: false,
          alreadyCheckedIn: true,
          checkedInAt: guest.checkedInAt,
          checkedInBy: guest.checkedInBy || "Recepción",
          guest: { ...guest },
          message: `ALERTA DE SEGURIDAD: Este pase ya fue utilizado previamente a las ${new Date(
            guest.checkedInAt
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} por ${
            guest.checkedInBy || "Personal de Puerta"
          }.`,
        };
      }

      guest.checkedInAt = now;
      guest.checkedInBy = checkedInBy;
      guest.updatedAt = now;

      return {
        success: true,
        checkedInAt: now,
        checkedInBy,
        guest: { ...guest },
        message: `Acceso concedido exitosamente a ${guest.familyName} (${guest.confirmedSeats || guest.maxSeats} personas).`,
      };
    }

    try {
      const client = getDynamoClient()!;
      const command = new UpdateCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `GUEST#${guestToken}`,
        },
        UpdateExpression: "SET checkedInAt = :now, checkedInBy = :operator, updatedAt = :now",
        ConditionExpression: "attribute_not_exists(checkedInAt)",
        ExpressionAttributeValues: {
          ":now": now,
          ":operator": checkedInBy,
        },
        ReturnValues: "ALL_NEW",
      });

      const response = await client.send(command);
      return {
        success: true,
        checkedInAt: now,
        checkedInBy,
        guest: response.Attributes as Guest,
        message: "Acceso concedido y validado atómicamente en DynamoDB.",
      };
    } catch (error: any) {
      // DynamoDB rechaza con ConditionalCheckFailedException si checkedInAt ya existe
      if (error?.name === "ConditionalCheckFailedException") {
        // Consultar el registro para retornar la hora exacta del ingreso fraudulento
        const existing = await this.getGuest(eventId, guestToken);
        return {
          success: false,
          alreadyCheckedIn: true,
          checkedInAt: existing?.checkedInAt,
          checkedInBy: existing?.checkedInBy,
          guest: existing || undefined,
          message: `ALERTA DE SEGURIDAD ATÓMICA: Este pase ya ingresó a las ${
            existing?.checkedInAt ? new Date(existing.checkedInAt).toLocaleTimeString() : "previamente"
          }.`,
        };
      }

      console.error("[Repository.atomicCheckIn] Unexpected DynamoDB error:", error);
      return {
        success: false,
        message: "Error de comunicación con la infraestructura de AWS.",
      };
    }
  }

  /**
   * Crea o actualiza un invitado/familia
   */
  static async saveGuest(eventId: string, guestData: Partial<Guest>): Promise<Guest> {
    const now = new Date().toISOString();
    const token =
      guestData.guestToken ||
      guestData.familyName
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `guest-${Date.now()}`;

    const guest: Guest = {
      guestToken: token,
      eventId,
      familyName: guestData.familyName || "Invitado Especial",
      primaryContactName: guestData.primaryContactName || guestData.familyName || "Titular",
      phone: guestData.phone || "",
      maxSeats: guestData.maxSeats || 2,
      confirmedSeats: guestData.confirmedSeats || 0,
      status: guestData.status || "UNOPENED",
      tableId: guestData.tableId,
      dietaryNotes: guestData.dietaryNotes || "",
      guestMessage: guestData.guestMessage || "",
      createdAt: guestData.createdAt || now,
      updatedAt: now,
    };

    if (!isDynamoConfigured()) {
      if (!memoryGuests[eventId]) {
        memoryGuests[eventId] = [];
      }
      const existingIdx = memoryGuests[eventId].findIndex((g) => g.guestToken === token);
      if (existingIdx >= 0) {
        memoryGuests[eventId][existingIdx] = { ...memoryGuests[eventId][existingIdx], ...guest };
      } else {
        memoryGuests[eventId].push(guest);
      }
      return guest;
    }

    try {
      const client = getDynamoClient()!;
      const command = new PutCommand({
        TableName: DYNAMO_TABLE_NAME,
        Item: {
          PK: `EVENT#${eventId}`,
          SK: `GUEST#${token}`,
          ...guest,
        },
      });

      await client.send(command);
      return guest;
    } catch (error) {
      console.error("[Repository.saveGuest] DynamoDB error:", error);
      if (!memoryGuests[eventId]) memoryGuests[eventId] = [];
      memoryGuests[eventId].push(guest);
      return guest;
    }
  }

  /**
   * Obtiene la lista de mesas para el Seating Chart
   */
  static async getTables(eventId: string = DEFAULT_EVENT_ID): Promise<Table[]> {
    if (!isDynamoConfigured()) {
      return memoryTables[eventId] || [];
    }

    try {
      const client = getDynamoClient()!;
      const command = new QueryCommand({
        TableName: DYNAMO_TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `EVENT#${eventId}`,
          ":skPrefix": "TABLE#",
        },
      });

      const response = await client.send(command);
      if (response.Items && response.Items.length > 0) {
        return response.Items as Table[];
      }
      return memoryTables[eventId] || [];
    } catch (error) {
      console.error("[Repository.getTables] DynamoDB query error:", error);
      return memoryTables[eventId] || [];
    }
  }

  /**
   * Asigna una familia/invitado a una mesa
   */
  static async assignGuestToTable(
    eventId: string,
    guestToken: string,
    tableId: string | null
  ): Promise<Guest | null> {
    const now = new Date().toISOString();

    if (!isDynamoConfigured()) {
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken === guestToken);
      if (guest) {
        guest.tableId = tableId || undefined;
        guest.updatedAt = now;
        return { ...guest };
      }
      return null;
    }

    try {
      const client = getDynamoClient()!;
      const command = new UpdateCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `GUEST#${guestToken}`,
        },
        UpdateExpression: tableId ? "SET tableId = :table, updatedAt = :now" : "REMOVE tableId SET updatedAt = :now",
        ExpressionAttributeValues: tableId
          ? {
              ":table": tableId,
              ":now": now,
            }
          : {
              ":now": now,
            },
        ReturnValues: "ALL_NEW",
      });

      const response = await client.send(command);
      return response.Attributes as Guest;
    } catch (error) {
      console.error("[Repository.assignGuestToTable] DynamoDB error:", error);
      const list = memoryGuests[eventId] || [];
      const guest = list.find((g) => g.guestToken === guestToken);
      if (guest) {
        guest.tableId = tableId || undefined;
        guest.updatedAt = now;
      }
      return guest ? { ...guest } : null;
    }
  }

  /**
   * Obtiene las fotos del Álbum Colaborativo en Vivo
   */
  static async getPhotos(eventId: string = DEFAULT_EVENT_ID): Promise<LivePhoto[]> {
    if (!isDynamoConfigured()) {
      return (memoryPhotos[eventId] || []).slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }

    try {
      const client = getDynamoClient()!;
      const command = new QueryCommand({
        TableName: DYNAMO_TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `EVENT#${eventId}`,
          ":skPrefix": "PHOTO#",
        },
        ScanIndexForward: false, // Más recientes primero
      });

      const response = await client.send(command);
      if (response.Items && response.Items.length > 0) {
        return response.Items as LivePhoto[];
      }
      return (memoryPhotos[eventId] || []).slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      console.error("[Repository.getPhotos] DynamoDB error:", error);
      return (memoryPhotos[eventId] || []).slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
  }

  /**
   * Agrega una foto al álbum en vivo
   */
  static async addPhoto(eventId: string, photo: Omit<LivePhoto, "photoId" | "timestamp" | "eventId">): Promise<LivePhoto> {
    const timestamp = new Date().toISOString();
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newPhoto: LivePhoto = {
      photoId,
      eventId,
      url: photo.url,
      author: photo.author || "Invitado AUREA",
      message: photo.message || "",
      timestamp,
      likes: 1,
    };

    if (!isDynamoConfigured()) {
      if (!memoryPhotos[eventId]) {
        memoryPhotos[eventId] = [];
      }
      memoryPhotos[eventId].unshift(newPhoto);
      return newPhoto;
    }

    try {
      const client = getDynamoClient()!;
      const command = new PutCommand({
        TableName: DYNAMO_TABLE_NAME,
        Item: {
          PK: `EVENT#${eventId}`,
          SK: `PHOTO#${timestamp}#${photoId}`,
          ...newPhoto,
        },
      });

      await client.send(command);
      return newPhoto;
    } catch (error) {
      console.error("[Repository.addPhoto] DynamoDB error:", error);
      if (!memoryPhotos[eventId]) memoryPhotos[eventId] = [];
      memoryPhotos[eventId].unshift(newPhoto);
      return newPhoto;
    }
  }

  /**
   * Calcula los KPIs en tiempo real para el Dashboard de Wedding Planners y Novios
   */
  static async getDashboardStats(eventId: string = DEFAULT_EVENT_ID): Promise<EventDashboardStats> {
    const guests = await this.getAllGuests(eventId);

    let totalSeatsAllocated = 0;
    let totalSeatsConfirmed = 0;
    let totalSeatsDeclined = 0;
    let totalGuestsPending = 0;
    let openedCount = 0;
    let unopenedCount = 0;
    let checkedInSeats = 0;
    const dietaryNotesList: { guestName: string; notes: string }[] = [];

    for (const g of guests) {
      totalSeatsAllocated += g.maxSeats;

      if (g.status === "CONFIRMED") {
        totalSeatsConfirmed += g.confirmedSeats || g.maxSeats;
      } else if (g.status === "DECLINED") {
        totalSeatsDeclined += g.maxSeats;
      } else {
        totalGuestsPending += g.maxSeats;
      }

      if (g.status === "UNOPENED") {
        unopenedCount++;
      } else {
        openedCount++;
      }

      if (g.checkedInAt) {
        checkedInSeats += g.confirmedSeats || g.maxSeats;
      }

      if (g.dietaryNotes && g.dietaryNotes.trim().length > 0) {
        dietaryNotesList.push({
          guestName: g.familyName,
          notes: g.dietaryNotes.trim(),
        });
      }
    }

    const totalFamilies = guests.length;
    const openRatePercentage =
      totalFamilies > 0 ? Math.round((openedCount / totalFamilies) * 100) : 0;

    return {
      totalFamilies,
      totalSeatsAllocated,
      totalSeatsConfirmed,
      totalSeatsDeclined,
      totalGuestsPending,
      openedInvitationsCount: openedCount,
      unopenedInvitationsCount: unopenedCount,
      openRatePercentage,
      totalCheckedInSeats: checkedInSeats,
      dietaryRestrictionsCount: dietaryNotesList.length,
      dietaryNotesList,
    };
  }

  /**
   * Resetea los datos en memoria a los valores iniciales para pruebas
   */
  static resetDemoData() {
    global.__aurea_in_memory_events = JSON.parse(JSON.stringify(MOCK_EVENTS));
    global.__aurea_in_memory_guests = JSON.parse(JSON.stringify(MOCK_GUESTS));
    global.__aurea_in_memory_tables = JSON.parse(JSON.stringify(MOCK_TABLES));
    global.__aurea_in_memory_photos = JSON.parse(JSON.stringify(MOCK_PHOTOS));
    global.__aurea_in_memory_tenants = JSON.parse(JSON.stringify(MOCK_TENANTS));
  }
}

// ===========================================================================
// TENANTS REPOSITORY (DYNAMODB SINGLE-TABLE + IN-MEMORY FALLBACK)
// ===========================================================================

export class TenantsRepository {
  static generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async listTenants(filterStatus?: TenantStatus): Promise<Tenant[]> {
    if (!isDynamoConfigured()) {
      let list = Object.values(memoryTenants);
      if (filterStatus) {
        list = list.filter((t) => t.status === filterStatus);
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      const client = getDynamoClient()!;
      // En DynamoDB Single-Table consultamos items con PK con prefijo TENANT# y SK = PROFILE
      const command = new QueryCommand({
        TableName: DYNAMO_TABLE_NAME,
        KeyConditionExpression: "begins_with(PK, :prefix) AND SK = :profile",
        ExpressionAttributeValues: {
          ":prefix": "TENANT#",
          ":profile": "PROFILE",
        },
      });

      const response = await client.send(command);
      if (response.Items && response.Items.length > 0) {
        let items = response.Items as Tenant[];
        if (filterStatus) items = items.filter((t) => t.status === filterStatus);
        return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return Object.values(memoryTenants);
    } catch (err) {
      console.error("[TenantsRepository.listTenants] DynamoDB query failed, fallback to memory:", err);
      return Object.values(memoryTenants);
    }
  }

  static async getTenant(tenantId: string): Promise<Tenant | null> {
    if (!isDynamoConfigured()) {
      return memoryTenants[tenantId] || null;
    }

    try {
      const client = getDynamoClient()!;
      const command = new GetCommand({
        TableName: DYNAMO_TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: "PROFILE",
        },
      });
      const response = await client.send(command);
      if (response.Item) return response.Item as Tenant;
      return memoryTenants[tenantId] || null;
    } catch (err) {
      return memoryTenants[tenantId] || null;
    }
  }

  /**
   * Crea una solicitud de cliente desde la Landing Page con estado PENDING_RELEASE
   */
  static async createTenantRequest(data: CreateTenantRequestPayload): Promise<Tenant> {
    const tenantId = `tenant_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const pin = this.generatePin();

    const planPrices: Record<string, number> = {
      ESENCIAL: 1400,
      FIRMA: 2600,
      GRAN_CELEBRACION: 3800,
      PLANNER_PRO: 7500,
    };

    const normalizedPlan = (data.plan?.toUpperCase().replace(/\s+/g, "_") || "FIRMA") as PlanType;
    const amount = planPrices[normalizedPlan] || 2600;

    const guestLimit =
      normalizedPlan === "ESENCIAL" ? 100 : normalizedPlan === "FIRMA" ? 200 : normalizedPlan === "GRAN_CELEBRACION" ? 350 : 9999;

    const newTenant: Tenant = {
      tenantId,
      name: data.hostName,
      email: data.email,
      phone: data.phone,
      role: "HOST",
      status: "PENDING_RELEASE",
      plan: normalizedPlan,
      celebrationType: data.celebrationType || "Boda",
      estimatedDate: data.estimatedDate,
      estimatedGuests: data.guestCount,
      maxEvents: 1,
      maxGuestsPerEvent: guestLimit,
      amountPaid: amount,
      currency: "GTQ",
      paymentStatus: "PARTIAL",
      accessPin: pin,
      createdAt: now,
      updatedAt: now,
      notes: data.notes || `Solicitud web recibida el ${new Date().toLocaleDateString("es-GT")}`,
    };

    // Guardar en memoria
    memoryTenants[tenantId] = newTenant;

    // Guardar en DynamoDB si está configurado
    if (isDynamoConfigured()) {
      try {
        const client = getDynamoClient()!;
        await client.send(
          new PutCommand({
            TableName: DYNAMO_TABLE_NAME,
            Item: {
              PK: `TENANT#${tenantId}`,
              SK: "PROFILE",
              ...newTenant,
            },
          })
        );
      } catch (err) {
        console.error("[TenantsRepository.createTenantRequest] DynamoDB put failed:", err);
      }
    }

    return newTenant;
  }

  /**
   * Libera y activa un cliente pendiente, asociando su evento y credenciales
   */
  static async releaseTenant(
    tenantId: string,
    options?: ReleaseTenantPayload
  ): Promise<{ tenant: Tenant; accessUrl: string; accessPin: string }> {
    const tenant = memoryTenants[tenantId] || (await this.getTenant(tenantId));
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} no encontrado`);
    }

    const now = new Date().toISOString();
    const pin = tenant.accessPin || this.generatePin();

    // Determinar o crear el EventId asociado
    let eventId = options?.primaryEventId || tenant.primaryEventId;
    if (!eventId) {
      const slug = tenant.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      eventId = `${slug}-${new Date().getFullYear()}`;

      // Crear evento inicial si no existe
      if (!memoryEvents[eventId]) {
        const initialEvent: EventMeta = {
          eventId,
          category: tenant.celebrationType,
          title: tenant.name,
          brideName: tenant.name.split("&")[0]?.trim() || tenant.name,
          groomName: tenant.name.split("&")[1]?.trim() || "Pareja",
          tagline: "Celebrando nuestro gran momento rodeados de amor",
          eventDate: tenant.estimatedDate ? `${tenant.estimatedDate}T16:00:00` : "2026-12-15T16:00:00",
          eventDateFormatted: tenant.estimatedDate ? `Fecha programada: ${tenant.estimatedDate}` : "Diciembre 2026",
          venueName: "Salón Principal / Jardín Colonial",
          venueCity: "Guatemala",
          venueAddress: "Dirección por confirmar",
          googleMapsUrl: "https://maps.google.com",
          wazeUrl: "https://waze.com",
          coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
          ourStory: "Nos preparamos con alegría para vivir este gran día junto a nuestra familia y amigos.",
          dressCodeTitle: "Formal Elegante",
          dressCodeDescription: "Vestimenta formal para una velada inolvidable.",
          paletteColors: ["#C5A059", "#4A5D4E", "#8C6D46", "#E5D9C5"],
          wifiSsid: "Aurea_Invitados",
          wifiPassword: `Aurea${pin}`,
          itinerary: [
            {
              time: "16:00",
              title: "Recepción y Bienvenida",
              location: "Entrada Principal",
              description: "Bienvenida y acomodo de invitados.",
              iconName: "church",
            },
            {
              time: "18:00",
              title: "Banquete y Celebración",
              location: "Salón Principal",
              description: "Cena, brindis y fiesta.",
              iconName: "utensils",
            },
          ],
          giftRegistries: [],
          menu: [],
          active: true,
          status: "ACTIVE",
          tenantId,
          maxGuestsLimit: options?.maxGuestsPerEvent || tenant.maxGuestsPerEvent || 200,
        };
        memoryEvents[eventId] = initialEvent;
        memoryGuests[eventId] = [];
        memoryTables[eventId] = [];
        memoryPhotos[eventId] = [];
      }
    }

    // Actualizar datos del tenant
    tenant.status = "ACTIVE";
    tenant.releasedAt = now;
    tenant.updatedAt = now;
    tenant.accessPin = pin;
    tenant.primaryEventId = eventId;
    if (options?.plan) tenant.plan = options.plan;
    if (options?.maxEvents) tenant.maxEvents = options.maxEvents;
    if (options?.maxGuestsPerEvent) tenant.maxGuestsPerEvent = options.maxGuestsPerEvent;
    if (options?.amountPaid !== undefined) tenant.amountPaid = options.amountPaid;
    if (options?.currency) tenant.currency = options.currency;
    if (options?.paymentStatus) tenant.paymentStatus = options.paymentStatus;

    memoryTenants[tenantId] = tenant;

    if (isDynamoConfigured()) {
      try {
        const client = getDynamoClient()!;
        await client.send(
          new PutCommand({
            TableName: DYNAMO_TABLE_NAME,
            Item: {
              PK: `TENANT#${tenantId}`,
              SK: "PROFILE",
              ...tenant,
            },
          })
        );
      } catch (err) {
        console.error("[TenantsRepository.releaseTenant] DynamoDB save failed:", err);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accessUrl = `${baseUrl}/dashboard?eventId=${eventId}&authPin=${pin}`;

    return {
      tenant,
      accessUrl,
      accessPin: pin,
    };
  }

  /**
   * Crea y activa un nuevo cliente manualmente desde cero desde el Root Panel
   */
  static async createAndReleaseTenant(data: {
    name: string;
    email: string;
    phone: string;
    role: TenantRole;
    plan: PlanType;
    celebrationType: string;
    estimatedDate?: string;
    maxEvents: number;
    maxGuestsPerEvent: number;
    amountPaid: number;
    currency: "GTQ" | "USD";
    paymentStatus: PaymentStatus;
    notes?: string;
  }): Promise<{ tenant: Tenant; accessUrl: string; accessPin: string; event: EventMeta }> {
    const tenantId = `tenant_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const pin = this.generatePin();
    const now = new Date().toISOString();

    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const eventId = `${slug}-${new Date().getFullYear()}`;

    const newEvent: EventMeta = {
      eventId,
      category: data.celebrationType,
      title: data.name,
      brideName: data.name.split("&")[0]?.trim() || data.name,
      groomName: data.name.split("&")[1]?.trim() || "Pareja",
      tagline: "Anunciando nuestra celebración con alma y distinción",
      eventDate: data.estimatedDate ? `${data.estimatedDate}T16:00:00` : "2026-12-15T16:00:00",
      eventDateFormatted: data.estimatedDate ? `Fecha programada: ${data.estimatedDate}` : "Diciembre 2026",
      venueName: "Lugar de la Celebración",
      venueCity: "Guatemala",
      venueAddress: "Dirección por definir",
      googleMapsUrl: "https://maps.google.com",
      wazeUrl: "https://waze.com",
      coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
      ourStory: "Una historia que merece ser anunciada con excelencia y calma.",
      dressCodeTitle: "Formal",
      dressCodeDescription: "Vestimenta formal de fiesta.",
      paletteColors: ["#C5A059", "#4A5D4E", "#8C6D46", "#E5D9C5"],
      wifiSsid: "Aurea_Fiesta",
      wifiPassword: `Aurea${pin}`,
      itinerary: [
        {
          time: "16:00",
          title: "Recepción de Invitados",
          location: "Entrada",
          description: "Bienvenida y registro.",
          iconName: "church",
        },
      ],
      giftRegistries: [],
      menu: [],
      active: true,
      status: "ACTIVE",
      tenantId,
      maxGuestsLimit: data.maxGuestsPerEvent,
    };

    const newTenant: Tenant = {
      tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: "ACTIVE",
      plan: data.plan,
      celebrationType: data.celebrationType,
      estimatedDate: data.estimatedDate,
      maxEvents: data.maxEvents,
      maxGuestsPerEvent: data.maxGuestsPerEvent,
      amountPaid: data.amountPaid,
      currency: data.currency,
      paymentStatus: data.paymentStatus,
      accessPin: pin,
      primaryEventId: eventId,
      createdAt: now,
      updatedAt: now,
      releasedAt: now,
      notes: data.notes,
    };

    memoryTenants[tenantId] = newTenant;
    memoryEvents[eventId] = newEvent;
    memoryGuests[eventId] = [];
    memoryTables[eventId] = [];
    memoryPhotos[eventId] = [];

    if (isDynamoConfigured()) {
      try {
        const client = getDynamoClient()!;
        await client.send(
          new PutCommand({
            TableName: DYNAMO_TABLE_NAME,
            Item: {
              PK: `TENANT#${tenantId}`,
              SK: "PROFILE",
              ...newTenant,
            },
          })
        );
        await client.send(
          new PutCommand({
            TableName: DYNAMO_TABLE_NAME,
            Item: {
              PK: `EVENT#${eventId}`,
              SK: "META",
              ...newEvent,
            },
          })
        );
      } catch (err) {
        console.error("[TenantsRepository.createAndReleaseTenant] DynamoDB error:", err);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accessUrl = `${baseUrl}/dashboard?eventId=${eventId}&authPin=${pin}`;

    return {
      tenant: newTenant,
      accessUrl,
      accessPin: pin,
      event: newEvent,
    };
  }

  static async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const tenant = memoryTenants[tenantId];
    if (!tenant) return null;

    Object.assign(tenant, updates, { updatedAt: new Date().toISOString() });
    memoryTenants[tenantId] = tenant;

    if (isDynamoConfigured()) {
      try {
        const client = getDynamoClient()!;
        await client.send(
          new PutCommand({
            TableName: DYNAMO_TABLE_NAME,
            Item: {
              PK: `TENANT#${tenantId}`,
              SK: "PROFILE",
              ...tenant,
            },
          })
        );
      } catch (err) {
        console.error("[TenantsRepository.updateTenant] DynamoDB update failed:", err);
      }
    }

    return tenant;
  }

  static async toggleTenantStatus(tenantId: string, status: TenantStatus): Promise<Tenant | null> {
    const tenant = memoryTenants[tenantId];
    if (!tenant) return null;

    tenant.status = status;
    tenant.updatedAt = new Date().toISOString();
    memoryTenants[tenantId] = tenant;

    // Si tiene evento primario, sincronizar estado del evento
    if (tenant.primaryEventId && memoryEvents[tenant.primaryEventId]) {
      const event = memoryEvents[tenant.primaryEventId];
      if (status === "ACTIVE") {
        event.active = true;
        event.status = "ACTIVE";
      } else if (status === "SUSPENDED") {
        event.active = false;
        event.status = "SUSPENDED";
      } else if (status === "ARCHIVED") {
        event.active = false;
        event.status = "ARCHIVED";
        event.isArchived = true;
      }
    }

    return tenant;
  }
}

// ===========================================================================
// ROOT ADMIN REPOSITORY (KPIS Y DIRECTORIO GLOBAL DE CELEBRACIONES)
// ===========================================================================

export class RootAdminRepository {
  static async getPlatformKpis(): Promise<PlatformKpis> {
    const tenants = Object.values(memoryTenants);
    const events = Object.values(memoryEvents);

    const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
    const pendingReleaseTenants = tenants.filter((t) => t.status === "PENDING_RELEASE").length;

    const activeEvents = events.filter((e) => e.active !== false && e.status !== "SUSPENDED" && e.status !== "ARCHIVED").length;

    // Próximos eventos en los próximos 14 días
    const now = new Date().getTime();
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;
    const upcomingThisWeek = events.filter((e) => {
      const t = new Date(e.eventDate).getTime();
      return t >= now && t <= now + twoWeeks;
    }).length;

    // Totales de invitados y fotos en toda la plataforma
    let totalGuestsAllocated = 0;
    let totalGuestsConfirmed = 0;
    let totalPhotosS3 = 0;

    for (const gList of Object.values(memoryGuests)) {
      for (const g of gList) {
        totalGuestsAllocated += g.maxSeats || 0;
        totalGuestsConfirmed += g.confirmedSeats || 0;
      }
    }

    for (const pList of Object.values(memoryPhotos)) {
      totalPhotosS3 += pList.length;
    }

    // Ingresos acumulados
    let totalRevenueGtq = 0;
    let totalRevenueUsd = 0;

    for (const t of tenants) {
      if (t.paymentStatus === "PAID" || t.paymentStatus === "PARTIAL") {
        if (t.currency === "USD") {
          totalRevenueUsd += t.amountPaid || 0;
        } else {
          totalRevenueGtq += t.amountPaid || 0;
        }
      }
    }

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

  static async listAllEventsWithMetrics(): Promise<EventDirectoryItem[]> {
    const events = Object.values(memoryEvents);
    const tenants = Object.values(memoryTenants);

    return events.map((evt) => {
      const guests = memoryGuests[evt.eventId] || [];
      const tables = memoryTables[evt.eventId] || [];
      const photos = memoryPhotos[evt.eventId] || [];

      const totalSeatsAllocated = guests.reduce((sum, g) => sum + (g.maxSeats || 0), 0);
      const totalGuestsConfirmed = guests.reduce((sum, g) => sum + (g.confirmedSeats || 0), 0);

      // Buscar tenant asociado
      const linkedTenant =
        tenants.find((t) => t.primaryEventId === evt.eventId || t.tenantId === evt.tenantId) || null;

      const eventStatus: EventStatus = evt.isArchived
        ? "ARCHIVED"
        : evt.status
        ? evt.status
        : evt.active === false
        ? "SUSPENDED"
        : "ACTIVE";

      return {
        eventId: evt.eventId,
        title: evt.title,
        category: evt.category || "Celebración",
        eventDate: evt.eventDate,
        eventDateFormatted: evt.eventDateFormatted,
        venueName: evt.venueName,
        venueCity: evt.venueCity,
        status: eventStatus,
        tenantId: linkedTenant?.tenantId,
        tenantName: linkedTenant?.name || evt.brideName + " & " + evt.groomName,
        plan: linkedTenant?.plan || "FIRMA",
        totalGuestsConfirmed,
        totalSeatsAllocated,
        maxGuestsLimit: evt.maxGuestsLimit || linkedTenant?.maxGuestsPerEvent || 200,
        totalTables: tables.length,
        totalPhotosS3: photos.length,
        active: evt.active !== false && eventStatus === "ACTIVE",
        isArchived: Boolean(evt.isArchived || eventStatus === "ARCHIVED"),
      };
    });
  }

  static async updateEventStatus(eventId: string, status: EventStatus): Promise<EventMeta | null> {
    const event = memoryEvents[eventId];
    if (!event) return null;

    event.status = status;
    event.active = status === "ACTIVE";
    event.isArchived = status === "ARCHIVED";

    memoryEvents[eventId] = event;

    if (isDynamoConfigured()) {
      try {
        const client = getDynamoClient()!;
        await client.send(
          new PutCommand({
            TableName: DYNAMO_TABLE_NAME,
            Item: {
              PK: `EVENT#${eventId}`,
              SK: "META",
              ...event,
            },
          })
        );
      } catch (err) {
        console.error("[RootAdminRepository.updateEventStatus] DynamoDB update failed:", err);
      }
    }

    return event;
  }
}

