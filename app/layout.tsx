import type { Metadata } from "next";
import "./globals.css";
import { EcosystemBar } from "@/components/navigation/EcosystemBar";

export const metadata: Metadata = {
  title: "AUREA — Boutique de Invitaciones Digitales Inteligentes & Event-Tech",
  description:
    "Plataforma SaaS de invitaciones interactivas, confirmación RSVP con pases QR de alta seguridad, seating chart inteligente y kit del día para bodas de lujo en Latinoamérica.",
  keywords: [
    "invitaciones digitales",
    "boda de lujo",
    "seating chart",
    "control de acceso qr",
    "wedding planner saas",
    "antigua guatemala",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-alabaster-100 text-carbon-900 font-sans selection:bg-champagne-500 selection:text-white antialiased">
        <EcosystemBar />
        <main className="pt-20 sm:pt-24">{children}</main>
      </body>
    </html>
  );
}
