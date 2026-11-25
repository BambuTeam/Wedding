import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUREA — Cartas e Invitaciones Digitales con Alma",
  description:
    "Diseñamos invitaciones digitales a la medida para bodas, XV años, bautizos y galas especiales. Cada familia recibe su sobre personal, confirma con un toque y tú organizas todo en perfecta armonía.",
  keywords: [
    "invitaciones digitales",
    "invitaciones para bodas",
    "invitaciones para xv años",
    "invitacion con sobre digital",
    "lacre digital",
    "seating chart y mesas",
    "recepcion con pase qr",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth overflow-x-hidden overflow-y-auto">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#18181B] font-sans selection:bg-[#B89758]/20 selection:text-[#18181B] antialiased overflow-x-hidden overflow-y-auto">
        {children}
      </body>
    </html>
  );
}
