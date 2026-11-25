"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onOpenHostPanel?: () => void;
  onOpenCreateInvite?: () => void;
}

export function Header({ onOpenHostPanel, onOpenCreateInvite }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenHost = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenHostPanel) {
      onOpenHostPanel();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aurea:open-host"));
    }
  };

  const handleOpenCreate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenCreateInvite) {
      onOpenCreateInvite();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aurea:create-invite"));
    }
  };

  const handleScrollToAct = (progress: number) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("aurea:scroll-to", { detail: { progress } })
      );
    }
    setMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (typeof window !== "undefined") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-30 w-full backdrop-blur-md bg-[#FAF8F5]/85 border-b border-[#E8DFC8]/50 transition-all">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Left: Clean Brand Logo only */}
        <Link href="/" className="group py-2">
          <span className="font-serif italic font-normal text-3xl md:text-4xl tracking-wider text-stone-900 group-hover:text-[#8F7138] transition-colors">
            AUREA
          </span>
        </Link>

        {/* Center: Minimalist progress indicators linking to acts & sections */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-serif uppercase tracking-[0.18em] text-stone-600 font-medium">
          <button
            onClick={() => handleScrollToAct(0.0)}
            className="hover:text-stone-900 transition-colors py-2"
          >
            01 El Anuncio
          </button>
          <span className="text-stone-300">·</span>
          <button
            onClick={() => handleScrollToAct(0.28)}
            className="hover:text-stone-900 transition-colors py-2"
          >
            02 La Carta
          </button>
          <span className="text-stone-300">·</span>
          <button
            onClick={() => handleScrollToSection("celebraciones")}
            className="hover:text-stone-900 transition-colors py-2"
          >
            Celebraciones
          </button>
          <span className="text-stone-300">·</span>
          <button
            onClick={() => handleScrollToSection("dia-del-evento")}
            className="hover:text-stone-900 transition-colors py-2"
          >
            El Día
          </button>
          <span className="text-stone-300">·</span>
          <button
            onClick={() => handleScrollToSection("planners")}
            className="hover:text-stone-900 transition-colors py-2"
          >
            Planners
          </button>
        </nav>

        {/* Right: Max 2 clean actions */}
        <div className="hidden sm:flex items-center gap-6">
          <button
            onClick={handleOpenHost}
            className="text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900 font-sans font-medium transition-colors py-2"
          >
            Soy anfitrión
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 hover:bg-[#8F7138] text-xs font-sans font-semibold tracking-wider transition-all shadow-sm hover:scale-[1.02]"
          >
            Diseñar la mía
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 hover:text-stone-900"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-stone-200 px-6 py-6 space-y-4">
          <div className="flex flex-col gap-3 text-xs font-serif uppercase tracking-widest text-stone-700">
            <button
              onClick={() => handleScrollToAct(0.0)}
              className="text-left py-2 hover:text-[#8F7138]"
            >
              01 El Anuncio
            </button>
            <button
              onClick={() => handleScrollToAct(0.28)}
              className="text-left py-2 hover:text-[#8F7138]"
            >
              02 La Carta
            </button>
            <button
              onClick={() => handleScrollToSection("celebraciones")}
              className="text-left py-2 hover:text-[#8F7138]"
            >
              03 Celebraciones
            </button>
            <button
              onClick={() => handleScrollToSection("dia-del-evento")}
              className="text-left py-2 hover:text-[#8F7138]"
            >
              04 El Día de la Fiesta
            </button>
            <button
              onClick={() => handleScrollToSection("planners")}
              className="text-left py-2 hover:text-[#8F7138]"
            >
              05 Para Planners
            </button>
          </div>

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-3">
            <button
              onClick={(e) => {
                handleOpenHost(e);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-serif uppercase tracking-wider text-stone-700 border border-stone-300 rounded-full"
            >
              Soy anfitrión
            </button>

            <button
              onClick={(e) => {
                handleOpenCreate(e);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-sans uppercase tracking-wider bg-stone-900 text-stone-50 rounded-full font-semibold"
            >
              Diseñar la mía
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
