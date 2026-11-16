import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera el mensaje cálido y personal para enviar la carta de boda por WhatsApp
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
    `✨ *Querida ${params.guestName}*\n\n` +
    `Con inmensa alegría y el corazón lleno de ilusión, ${params.coupleNames} queremos invitarles a celebrar el inicio de nuestro matrimonio.\n\n` +
    `Hemos reservado con todo nuestro cariño *${params.maxSeats} ${params.maxSeats === 1 ? "lugar especial" : "lugares especiales"}* para ustedes.\n\n` +
    `💌 Pueden abrir su sobre digital, conocer la historia, el lugar y confirmar su asistencia en este enlace:\n` +
    `${params.inviteUrl}\n\n` +
    `¡Nada nos haría más felices que contar con su presencia y su abrazo en este gran día!`
  );

  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${text}`
    : `https://api.whatsapp.com/send?text=${text}`;
}

/**
 * Genera un recordatorio afectuoso de confirmación por WhatsApp
 */
export function buildWhatsAppReminderUrl(params: {
  phone?: string;
  guestName: string;
  inviteUrl: string;
  coupleNames: string;
}): string {
  const cleanPhone = (params.phone || "").replace(/[^0-9]/g, "");
  
  const text = encodeURIComponent(
    `Hola *${params.guestName}*,\n\n` +
    `Esperamos que estén muy bien. ${params.coupleNames} estamos afinando los últimos detalles con el banquete y nos encantaría saber si podrán acompañarnos en nuestra boda.\n\n` +
    `Por favor confírmennos en su sobre digital:\n` +
    `${params.inviteUrl}\n\n` +
    `¡Les mandamos un abrazo con mucho cariño!`
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
  startDateIso: string;
}) {
  const start = new Date(event.startDateIso);
  const end = new Date(start.getTime() + 10 * 60 * 60 * 1000);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AUREA//Cartas de Boda con Alma//ES",
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
