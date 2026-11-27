export type GuestStatus = "UNOPENED" | "OPENED" | "CONFIRMED" | "DECLINED";

export interface Guest {
  guestToken: string;
  eventId: string;
  familyName: string;
  primaryContactName: string;
  phone?: string;
  maxSeats: number;
  confirmedSeats: number;
  status: GuestStatus;
  openedAt?: string;
  confirmedAt?: string;
  checkedInAt?: string;
  checkedInBy?: string;
  tableId?: string;
  dietaryNotes?: string;
  guestMessage?: string;
  songSuggestion?: string;
  createdAt: string;
  updatedAt: string;
}

export type TableType = "ROUND" | "IMPERIAL";

export interface Table {
  tableId: string;
  eventId: string;
  name: string;
  capacity: number;
  type: TableType;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface ItineraryItem {
  time: string;
  title: string;
  location: string;
  description: string;
  iconName: "church" | "cocktail" | "utensils" | "music" | "camera" | "sparkles";
}

export type MusicProvider = "none" | "aurea_ambient" | "youtube" | "spotify";
export type AureaAmbientPreset = "piano" | "strings" | "acoustic";

export interface EventMusicConfig {
  provider: MusicProvider;
  trackId?: string; // YouTube videoId or Spotify trackId/playlistId
  songTitle?: string;
  artist?: string;
  preset?: AureaAmbientPreset;
  url?: string;
}

export interface EditorialPhoto {
  id: string;
  url: string;
  caption?: string;
  order?: number;
  isCover?: boolean;
  aspect?: "portrait" | "landscape";
}

export interface HotelRecommendation {
  name: string;
  description: string;
  address: string;
  discountCode?: string;
  bookingUrl?: string;
  phone?: string;
}

export type SculptureSlotKey = "slot_1" | "slot_2" | "slot_3" | "slot_4";
export type SculptureFinish = "gold" | "rose_gold" | "silver_crystal" | "pearl_gold";
export type SculpturePosition = "top-right" | "mid-left" | "mid-right" | "bottom-left";

export interface SculptureSlotConfig {
  id: string;
  slotKey: SculptureSlotKey;
  position: SculpturePosition;
  modelUrl: string;
  name: string;
  finish: SculptureFinish;
  rotation?: [number, number, number];
  scaleMultiplier?: number;
  badge?: string;
  sectionTarget?: string;
}

export type Custom3dSlots = Partial<Record<SculptureSlotKey, {
  modelUrl: string;
  finish?: SculptureFinish;
  name?: string;
  scaleMultiplier?: number;
}>>;

export interface EventMeta {
  eventId: string;
  category?: string;
  title: string;
  brideName: string;
  groomName: string;
  hostNames?: string;
  tagline: string;
  eventDate: string; // ISO date e.g. "2025-11-20T16:00:00"
  eventDateFormatted: string;
  venueName: string;
  venueCity: string;
  venueAddress: string;
  googleMapsUrl: string;
  wazeUrl: string;
  receptionVenueName?: string;
  receptionVenueAddress?: string;
  receptionGoogleMapsUrl?: string;
  receptionWazeUrl?: string;
  coverImageUrl: string;
  ourStory: string;
  dressCodeTitle: string;
  dressCodeDescription: string;
  paletteColors: string[];
  paletteColorNames?: string[];
  wifiSsid: string;
  wifiPassword: string;
  musicConfig?: EventMusicConfig;
  itinerary: ItineraryItem[];
  giftRegistries: {
    name: string;
    description: string;
    codeOrUrl: string;
    type: "store" | "bank";
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    currency?: "GTQ" | "USD";
  }[];
  hotels?: HotelRecommendation[];
  editorialPhotos?: EditorialPhoto[];
  custom3dSlots?: Custom3dSlots;
  menu: {
    course: string;
    title: string;
    description: string;
    dietaryFlag?: string;
  }[];
  active: boolean;
  status?: EventStatus;
  tenantId?: string;
  maxGuestsLimit?: number;
  isArchived?: boolean;
  isLocked?: boolean;
}

export interface LivePhoto {
  photoId: string;
  eventId: string;
  url: string;
  author: string;
  message?: string;
  timestamp: string;
  likes?: number;
}

export interface CheckInResult {
  success: boolean;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  guest?: Guest;
  message: string;
}

export interface EventDashboardStats {
  totalFamilies: number;
  totalSeatsAllocated: number;
  totalSeatsConfirmed: number;
  totalSeatsDeclined: number;
  totalGuestsPending: number;
  openedInvitationsCount: number;
  unopenedInvitationsCount: number;
  openRatePercentage: number;
  totalCheckedInSeats: number;
  dietaryRestrictionsCount: number;
  dietaryNotesList: { guestName: string; notes: string }[];
}

// ==============================================================================
// ROOT / SUPERADMIN & MULTI-TENANT ARCHITECTURE
// ==============================================================================

export type TenantRole = "HOST" | "PLANNER" | "COUPLE";
export type TenantStatus = "PENDING_RELEASE" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type PlanType = "ESENCIAL" | "FIRMA" | "GRAN_CELEBRACION" | "PLANNER_PRO";
export type PaymentStatus = "PAID" | "PARTIAL" | "COMPLIMENTARY";
export type EventStatus = "ACTIVE" | "LIVE" | "DRAFT" | "SUSPENDED" | "ARCHIVED";

export interface Tenant {
  tenantId: string;
  accountCode?: string; // Formato oficial corto: AUR-XXXX (ej. AUR-4829)
  name: string;
  email: string;
  phone: string;
  role: TenantRole;
  status: TenantStatus;
  plan: PlanType;
  celebrationType: string;
  estimatedDate?: string;
  estimatedGuests?: number | string;
  maxEvents: number;
  maxGuestsPerEvent: number;
  amountPaid: number;
  paidAmountGTQ?: number;
  currency: "GTQ" | "USD";
  paymentStatus: PaymentStatus;
  accessPin: string;
  magicSlug?: string;
  primaryEventId?: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  releasedAt?: string;
  notes?: string;
}

export interface EventDirectoryItem {
  eventId: string;
  title: string;
  category: string;
  eventDate: string;
  eventDateFormatted: string;
  venueName: string;
  venueCity: string;
  status: EventStatus;
  tenantId?: string;
  tenantName?: string;
  plan: PlanType;
  totalGuestsConfirmed: number;
  totalSeatsAllocated: number;
  maxGuestsLimit: number;
  totalTables: number;
  totalPhotosS3: number;
  active: boolean;
  isArchived: boolean;
  isLocked?: boolean;
}

export interface PlatformKpis {
  totalTenants: number;
  activeTenants: number;
  pendingReleaseTenants: number;
  totalEvents: number;
  activeEvents: number;
  upcomingThisWeek: number;
  totalGuestsAllocated: number;
  totalGuestsConfirmed: number;
  totalPhotosS3: number;
  totalRevenueGtq: number;
  totalRevenueUsd: number;
}

export interface CreateTenantRequestPayload {
  hostName: string;
  email: string;
  phone: string;
  celebrationType: string;
  estimatedDate?: string;
  guestCount?: string | number;
  plan?: PlanType | string;
  notes?: string;
}

export interface ReleaseTenantPayload {
  plan?: PlanType;
  maxEvents?: number;
  maxGuestsPerEvent?: number;
  amountPaid?: number;
  currency?: "GTQ" | "USD";
  paymentStatus?: PaymentStatus;
  primaryEventId?: string;
}

