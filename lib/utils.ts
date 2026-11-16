import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera el enlace oficial de WhatsApp para enviar la invitación digital
 */
export function buildWhatsAppInviteUrl(params: {
  phone?: string;
  guestName: string;
  maxSeats: number;
  inviteUrl: string;
  coupleNames: string;
}): string {
  const cleanPhone = (params.phone || "").replace(/[^0-9]/g, "");
  
  const text = encodeURIComponent(
    `✨ *${params.guestName}*\n\n` +
    `Con inmensa alegría, ${params.coupleNames} tienen el honor de invitarles a celebrar su matrimonio.\n\n` +
    `Hemos reservado con mucho cariño *${params.maxSeats} ${params.maxSeats === 1 ? "lugar" : "lugares"}* para ustedes.\n\n` +
    `💌 Pueden abrir su sobre digital, conocer el itinerario y confirmar su asistencia en este enlace:\n` +
    `${params.inviteUrl}\n\n` +
    `¡Esperamos de corazón contar con su presencia!`
  );

  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${text}`
    : `https://api.whatsapp.com/send?text=${text}`;
}

/**
 * Genera el enlace de recordatorio de RSVP por WhatsApp
 */
export function buildWhatsAppReminderUrl(params: {
  phone?: string;
  guestName: string;
  inviteUrl: string;
  coupleNames: string;
}): string {
  const cleanPhone = (params.phone || "").replace(/[^0-9]/g, "");
  
  const text = encodeURIComponent(
    `Estimada *${params.guestName}*,\n\n` +
    `Esperamos que te encuentres muy bien. ${params.coupleNames} están afinando los últimos detalles de su boda y les encantaría saber si podrán acompañarles.\n\n` +
    `Por favor, confirma tus lugares a través de tu invitación digital:\n` +
    `${params.inviteUrl}\n\n` +
    `¡Un abrazo enorme!`
  );

  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${text}`
    : `https://api.whatsapp.com/send?text=${text}`;
}

/**
 * Genera y descarga un archivo .ICS para Apple Calendar, Outlook y Google Calendar
 */
export function downloadCalendarIcs(event: {
  title: string;
  description: string;
  location: string;
  startDateIso: string; // e.g. "2026-11-28T16:30:00"
}) {
  const start = new Date(event.startDateIso);
  const end = new Date(start.getTime() + 10 * 60 * 60 * 1000); // +10 horas de fiesta

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AUREA//Boutique Digital Invitations//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:aurea-${Date.now()}@aurea.lat`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
