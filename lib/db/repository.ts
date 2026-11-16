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
} from "../types";
import {
  MOCK_EVENTS,
  MOCK_GUESTS,
  MOCK_TABLES,
  MOCK_PHOTOS,
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

const memoryEvents = global.__aurea_in_memory_events!;
const memoryGuests = global.__aurea_in_memory_guests!;
const memoryTables = global.__aurea_in_memory_tables!;
const memoryPhotos = global.__aurea_in_memory_photos!;

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
  }
}
