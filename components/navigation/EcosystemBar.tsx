"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Mail,
  PartyPopper,
  Tv,
  ChevronDown,
  Layers,
  Database,
  Cloud,
  CheckCircle2,
  Clock,
  Eye,
  Users,
} from "lucide-react";

const DEMO_GUESTS = [
  {
    token: "rivas-molina",
    name: "Familia Rivas Molina",
    seats: 4,
    status: "UNOPENED",
    statusLabel: "Sobre cerrado (Sin abrir)",
    statusColor: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    token: "carlos-mendoza",
    name: "Carlos Mendoza & Acompañante",
    seats: 2,
    status: "OPENED",
    statusLabel: "Abierto (Pendiente RSVP)",
    statusColor: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    token: "hernandez-diaz",
    name: "Familia Hernández Díaz",
    seats: 3,
    status: "CONFIRMED",
    statusLabel: "Confirmado (Mesa Capuchinas)",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    token: "lucia-alvarez",
    name: "Lucía Álvarez & Pareja",
    seats: 2,
    status: "CHECKED_IN",
    statusLabel: "Ingresó (Check-in Realizado)",
    statusColor: "text-purple-700 bg-purple-50 border-purple-200",
  },
];

export function EcosystemBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedGuestToken, setSelectedGuestToken] = useState<string>("rivas-molina");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync token from URL if on invitation page
  useEffect(() => {
    if (pathname.startsWith("/invitacion/")) {
      const token = pathname.replace("/invitacion/", "").split("/")[0];
      if (token && DEMO_GUESTS.some((g) => g.token === token)) {
        setSelectedGuestToken(token);
      }
    }
  }, [pathname]);

  const handleSelectGuest = (token: string) => {
    setSelectedGuestToken(token);
    setIsDropdownOpen(false);
    if (pathname.startsWith("/invitacion/")) {
      router.push(`/invitacion/${token}`);
    }
  };

  const currentGuest =
    DEMO_GUESTS.find((g) => g.token === selectedGuestToken) || DEMO_GUESTS[0];

  const navLinks = [
    { href: "/", label: "Landing B2C/B2B", icon: Sparkles },
    {
      href: `/invitacion/${selectedGuestToken}`,
      label: "Invitación Boutique",
      icon: Mail,
      isInvitation: true,
    },
    { href: "/dashboard", label: "Dashboard Planner", icon: LayoutDashboard },
    { href: "/kit-del-dia", label: "Kit del Día", icon: PartyPopper },
    { href: "/modo-tv", label: "Modo TV", icon: Tv, highlight: true },
  ];

  return (
    <aside
      aria-label="Navegador del Ecosistema AUREA"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300"
    >
      <div className="bg-carbon-900/90 text-white backdrop-blur-xl border border-champagne-500/30 rounded-2xl shadow-luxury-lg px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Brand & AWS Stack indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-serif font-bold text-lg tracking-wider text-champagne-300 hover:text-champagne-200 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AUREA
            </Link>
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-carbon-800/80 border border-champagne-500/20 text-[11px] text-zinc-300">
              <Database className="w-3 h-3 text-champagne-400" />
              <span>AWS DynamoDB + S3 Ready</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : link.isInvitation
                  ? pathname.startsWith("/invitacion")
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-champagne-500 text-carbon-950 font-semibold shadow-gold"
                      : link.highlight
                      ? "bg-carbon-800 text-champagne-300 hover:bg-carbon-700 border border-champagne-500/30"
                      : "text-zinc-300 hover:text-white hover:bg-carbon-800/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">{link.label}</span>
                  <span className="inline md:hidden">{link.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>

          {/* Guest Simulator Switcher (for Invitación) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-carbon-800/90 border border-champagne-500/40 text-xs text-champagne-200 hover:bg-carbon-700 transition-colors"
              title="Cambiar perfil de invitado para probar la invitación"
            >
              <Users className="w-3.5 h-3.5 text-champagne-400" />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Demo Invitado</span>
                <span className="font-semibold text-xs text-champagne-100 max-w-[120px] truncate">
                  {currentGuest.name.split("&")[0]}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-champagne-400 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-carbon-900 border border-champagne-500/40 shadow-2xl p-2 z-50 text-xs">
                <div className="px-2 py-1.5 border-b border-carbon-800 mb-1 text-[11px] font-semibold text-champagne-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Probar Estados de Invitado</span>
                  <span className="text-[10px] text-zinc-400 font-normal">4 Perfiles</span>
                </div>
                {DEMO_GUESTS.map((guest) => {
                  const isSelected = guest.token === selectedGuestToken;
                  return (
                    <button
                      key={guest.token}
                      onClick={() => handleSelectGuest(guest.token)}
                      className={`w-full text-left p-2 rounded-xl transition-all flex flex-col gap-1 mb-1 ${
                        isSelected
                          ? "bg-carbon-800 border border-champagne-500/40"
                          : "hover:bg-carbon-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-100">{guest.name}</span>
                        <span className="text-[10px] text-champagne-300 font-medium">
                          {guest.seats} {guest.seats === 1 ? "pase" : "pases"}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-block w-fit font-medium ${guest.statusColor}`}>
                        {guest.statusLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
