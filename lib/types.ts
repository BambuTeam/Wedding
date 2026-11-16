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

export interface EventMeta {
  eventId: string;
  title: string;
  brideName: string;
  groomName: string;
  tagline: string;
  eventDate: string; // ISO date e.g. "2025-11-20T16:00:00"
  eventDateFormatted: string;
  venueName: string;
  venueCity: string;
  venueAddress: string;
  googleMapsUrl: string;
  wazeUrl: string;
  coverImageUrl: string;
  ourStory: string;
  dressCodeTitle: string;
  dressCodeDescription: string;
  paletteColors: string[];
  wifiSsid: string;
  wifiPassword: string;
  itinerary: ItineraryItem[];
  giftRegistries: {
    name: string;
    description: string;
    codeOrUrl: string;
    type: "store" | "bank";
  }[];
  menu: {
    course: string;
    title: string;
    description: string;
    dietaryFlag?: string;
  }[];
  active: boolean;
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
