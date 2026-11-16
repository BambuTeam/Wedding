import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/navigation/Header";

export const metadata: Metadata = {
  title: "AUREA — Invitaciones de Boda con Alma & Papelería Digital",
  description:
    "Creamos la carta digital de tu boda desde cero, con su historia, sus fotos y el nombre de cada familia. Confirmaciones con un toque, mesas y bienvenida en calma.",
  keywords: [
    "invitaciones de boda digitales",
    "boda colonial",
    "antigua guatemala bodas",
    "invitacion con sobre",
    "lacre digital",
    "seating chart boda",
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
      <body className="min-h-screen bg-[#FAF7F2] text-[#1F1D1A] font-sans selection:bg-[#C5A059] selection:text-white antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
