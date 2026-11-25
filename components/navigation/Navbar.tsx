"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onOpenHost: () => void;
  onOpenCreate: () => void;
  onScrollTo: (selector: string) => void;
}

export function Navbar({ onOpenHost, onOpenCreate, onScrollTo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["inicio", "celebraciones", "experiencia", "dia-evento", "planners"];
      const scrollPos = window.scrollY + 160;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (selector: string) => {
    onScrollTo(selector);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-20 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-black/5 transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
        {/* Left: Clean Brand Logo */}
        <button
          onClick={() => handleNavClick("#inicio")}
          className="group py-2 text-left"
        >
          <span className="font-serif font-normal text-2xl md:text-3xl tracking-[0.15em] text-[#18181B] group-hover:text-[#8F7138] transition-colors">
            AUREA
          </span>
        </button>

        {/* Center: Spaced links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-sans tracking-normal text-zinc-700 font-medium">
          <button
            onClick={() => handleNavClick("#celebraciones")}
            className={`py-2 transition-colors relative ${
              activeSection === "celebraciones" ? "text-zinc-900 font-semibold" : "hover:text-zinc-900"
            }`}
          >
            Celebraciones
            {activeSection === "celebraciones" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F7138] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick("#experiencia")}
            className={`py-2 transition-colors relative ${
              activeSection === "experiencia" ? "text-zinc-900 font-semibold" : "hover:text-zinc-900"
            }`}
          >
            Cómo funciona
            {activeSection === "experiencia" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F7138] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick("#dia-evento")}
            className={`py-2 transition-colors relative ${
              activeSection === "dia-evento" ? "text-zinc-900 font-semibold" : "hover:text-zinc-900"
            }`}
          >
            El día del evento
            {activeSection === "dia-evento" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F7138] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick("#planners")}
            className={`py-2 transition-colors relative ${
              activeSection === "planners" ? "text-zinc-900 font-semibold" : "hover:text-zinc-900"
            }`}
          >
            Planners
            {activeSection === "planners" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F7138] rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Host access + Create invitation (Nunca cortado en borde derecho) */}
        <div className="hidden sm:flex items-center gap-5 shrink-0">
          <button
            onClick={onOpenHost}
            className="text-[13px] tracking-normal text-zinc-700 hover:text-zinc-900 font-sans font-medium transition-colors py-2"
          >
            Soy anfitrión
          </button>

          <button
            onClick={onOpenCreate}
            className="px-5 py-2.5 rounded-full bg-[#18181B] text-[#FAF7F2] hover:bg-[#27272A] text-[13px] font-sans font-semibold tracking-normal transition-all shadow-sm hover:scale-[1.02] shrink-0"
          >
            Crear mi invitación
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#141413] hover:text-[#8F7138]"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-black/10 px-6 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col gap-3 text-[13px] font-sans tracking-normal text-zinc-700 font-medium">
            <button
              onClick={() => handleNavClick("#inicio")}
              className="text-left py-2 hover:text-zinc-900"
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavClick("#celebraciones")}
              className="text-left py-2 hover:text-zinc-900"
            >
              Celebraciones
            </button>
            <button
              onClick={() => handleNavClick("#experiencia")}
              className="text-left py-2 hover:text-zinc-900"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => handleNavClick("#dia-evento")}
              className="text-left py-2 hover:text-zinc-900"
            >
              El día del evento
            </button>
            <button
              onClick={() => handleNavClick("#planners")}
              className="text-left py-2 hover:text-zinc-900"
            >
              Planners
            </button>
          </div>

          <div className="pt-4 border-t border-black/10 flex flex-col gap-3">
            <button
              onClick={() => {
                onOpenHost();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-[13px] font-sans font-medium tracking-normal text-zinc-800 border border-black/15 rounded-full hover:bg-stone-50"
            >
              Soy anfitrión
            </button>

            <button
              onClick={() => {
                onOpenCreate();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-[13px] font-sans font-semibold tracking-normal bg-[#18181B] text-[#FAF7F2] rounded-full hover:bg-[#27272A]"
            >
              Crear mi invitación
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
