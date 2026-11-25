"use client";

import React from "react";
import { MessageCircle, ArrowRight, Heart } from "lucide-react";

interface FooterContactProps {
  onOpenHost?: () => void;
  onOpenContact?: () => void;
}

export function FooterContact({ onOpenHost, onOpenContact }: FooterContactProps) {
  const whatsappUrl =
    "https://wa.me/5215500000000?text=Hola%20AUREA,%20me%20gustar%C3%ADa%20dise%C3%B1ar%20una%20invitaci%C3%B3n%20para%20mi%20pr%C3%B3xima%20celebraci%C3%B3n";

  return (
    <footer className="bg-stone-900 text-stone-100 relative overflow-hidden">
      {/* Upper CTA Section */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-28 pb-20 text-center relative z-10">
        <p className="font-sans text-[12px] uppercase tracking-widest text-[#C2A676] font-bold mb-3">
          Atelier de celebraciones
        </p>
        <h2 className="text-3xl md:text-5xl font-serif font-normal text-stone-50 tracking-tight max-w-3xl mx-auto leading-tight">
          Diseñemos juntos la carta de tu próxima gran celebración
        </h2>
        <p className="mt-6 text-stone-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-sans">
          Ya sea una boda íntima, unos XV años, un bautizo o una gala corporativa, cuidamos
          cada detalle para que tus invitados queden fascinados.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#B89758] text-stone-950 font-sans font-semibold text-sm hover:bg-[#C8A96C] transition-all duration-300 shadow-xl shadow-black/20"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Platicar por WhatsApp</span>
          </a>

          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-stone-700 hover:border-stone-500 text-stone-200 hover:text-stone-100 transition-colors text-sm font-sans font-semibold"
          >
            <span>Solicitar muestra personalizada</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-800" />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] font-sans text-stone-400">
        <div className="flex items-center gap-3">
          <span className="font-serif tracking-[0.2em] text-lg text-stone-200 font-semibold">AUREA</span>
          <span className="text-stone-700">|</span>
          <span>Cartas e invitaciones para momentos memorables</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a href="#celebraciones" className="hover:text-stone-200 transition-colors">
            Celebraciones
          </a>
          <a href="#experiencia" className="hover:text-stone-200 transition-colors">
            Experiencia
          </a>
          <a href="#planners" className="hover:text-stone-200 transition-colors">
            Planners
          </a>
          <button
            onClick={onOpenHost}
            className="hover:text-[#C2A676] transition-colors font-semibold text-stone-300"
          >
            Acceso Anfitriones
          </button>
        </div>

        <p className="flex items-center gap-1 text-stone-600">
          <span>Hecho con devoción para celebrar la vida</span>
        </p>
      </div>
    </footer>
  );
}
