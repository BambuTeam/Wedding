"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X, ArrowUpRight, Sparkles } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF7F2]/80 border-b border-[#E8DFC8]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif italic font-normal text-3xl sm:text-4xl tracking-wider text-carbon-900 group-hover:text-champagne-700 transition-colors">
            AUREA
          </span>
          <span className="text-[10px] tracking-[0.25em] text-champagne-700 uppercase font-sans font-semibold border-l border-[#C5A059]/40 pl-2.5 hidden sm:inline">
            Cartas con Alma
          </span>
        </Link>

        {/* Human Editorial Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-carbon-700 font-medium font-sans">
          <Link
            href={isHome ? "#galeria" : "/#galeria"}
            className="hover:text-champagne-700 transition-colors"
          >
            Invitaciones
          </Link>
          <Link
            href={isHome ? "#como-funciona" : "/#como-funciona"}
            className="hover:text-champagne-700 transition-colors"
          >
            Cómo funciona
          </Link>
          <Link
            href="/kit-del-dia"
            className="hover:text-champagne-700 transition-colors flex items-center gap-1"
          >
            <span>El día de la fiesta</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </Link>
          <Link
            href={isHome ? "#planners" : "/#planners"}
            className="hover:text-champagne-700 transition-colors"
          >
            Planners
          </Link>
        </nav>

        {/* Right Action Area */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-wider text-carbon-500 hover:text-carbon-900 font-sans font-medium transition-colors px-2 py-1"
          >
            Acceso Novios / Planner
          </Link>

          <Link
            href="/invitacion/rivas-molina"
            className="px-5 py-2.5 rounded-full bg-[#1E1C1A] text-[#FAF7F2] hover:bg-carbon-800 text-xs font-semibold tracking-wider transition-all shadow-sm flex items-center gap-2 group"
          >
            <span>Ver una invitación real</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-champagne-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/dashboard"
            className="text-[11px] text-carbon-600 font-medium px-2 py-1"
          >
            Novios
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-carbon-800 hover:bg-carbon-100"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E8DFC8] px-6 py-6 space-y-4 text-sm font-serif">
          <Link
            href="/#galeria"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-carbon-800 hover:text-champagne-700 text-lg italic"
          >
            Colección de Invitaciones
          </Link>
          <Link
            href="/#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-carbon-800 hover:text-champagne-700 text-lg italic"
          >
            Lo que hace por ti
          </Link>
          <Link
            href="/kit-del-dia"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-carbon-800 hover:text-champagne-700 text-lg italic"
          >
            El día de la fiesta (Kit de tus invitados)
          </Link>
          <Link
            href="/#planners"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-carbon-800 hover:text-champagne-700 text-lg italic"
          >
            Para Wedding Planners
          </Link>
          <div className="pt-4 border-t border-[#E8DFC8]/60 flex flex-col gap-2 font-sans">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl border border-carbon-300 text-carbon-800 text-xs font-semibold"
            >
              Acceso a mi boda (Panel de novios)
            </Link>
            <Link
              href="/invitacion/rivas-molina"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl bg-carbon-900 text-white text-xs font-semibold"
            >
              Abrir invitación de ejemplo (Familia Rivas)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
