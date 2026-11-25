"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { InteractiveCssEnvelope } from "@/components/landing/InteractiveCssEnvelope";
import { CelebrationsShowcase } from "@/components/landing/CelebrationsShowcase";
import { HowItWorksScenes } from "@/components/landing/HowItWorksScenes";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { PricingFaqSection } from "@/components/landing/PricingFaqSection";
import { FooterContact } from "@/components/landing/FooterContact";
import { InvitationModal } from "@/components/viewers/InvitationModal";
import { HostDashboardModal } from "@/components/viewers/HostDashboardModal";
import { DayOfKitModal } from "@/components/viewers/DayOfKitModal";
import { ContactModal } from "@/components/viewers/ContactModal";

export function UnifiedScrollyExperience() {
  // Modal states
  const [invitationState, setInvitationState] = useState<{
    isOpen: boolean;
    token: string;
    eventId: string;
  }>({
    isOpen: false,
    token: "rivas-molina",
    eventId: "camila-andres-2025",
  });

  const [isHostOpen, setIsHostOpen] = useState(false);
  const [isDayOfOpen, setIsDayOfOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactPlan, setContactPlan] = useState<string>("Colección Firma");

  const handleOpenContact = (planName?: string) => {
    if (planName) setContactPlan(planName);
    setIsContactOpen(true);
  };

  const isAnyModalOpen =
    invitationState.isOpen || isHostOpen || isDayOfOpen || isContactOpen;

  // Global scroll lock when any modal is open
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  // Smooth scroll handler
  const handleScrollTo = useCallback((selector: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleOpenInvitation = (token: string, eventId: string) => {
    setInvitationState({
      isOpen: true,
      token,
      eventId,
    });
  };

  return (
    <div className="relative bg-[#FAF7F2] text-[#141413] selection:bg-[#B89758]/20 selection:text-[#141413] min-h-screen">
      {/* 1. Header / Navbar */}
      <Navbar
        onOpenHost={() => setIsHostOpen(true)}
        onOpenCreate={() => handleOpenContact()}
        onScrollTo={handleScrollTo}
      />

      {/* 2. Hero Section: Editorial Split-Screen (Text Left + Artisan CSS 3D Envelope Right) */}
      <section
        id="inicio"
        className="relative pt-28 pb-12 lg:pt-32 lg:pb-16 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Narrative Headline, Story & Action */}
            <div className="lg:col-span-6 space-y-8 z-10">
              <div className="space-y-5">
                <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-[4.2rem] text-zinc-900 leading-[1.06] tracking-tight font-normal">
                  Cada gran historia merece ser anunciada con alma.
                </h1>

                <p className="text-zinc-700 text-base sm:text-lg leading-relaxed font-sans max-w-xl">
                  Diseñamos cartas digitales personalizadas para bodas, XV años,
                  bautizos y galas corporativas. Cada familia recibe su sobre
                  personalizado con caligrafía fina, confirma asistencia en segundos
                  y tú organizas mesas y bienvenida con absoluta serenidad.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() =>
                    handleOpenInvitation("rivas-molina", "camila-andres-2025")
                  }
                  className="px-8 py-4 rounded-full bg-[#18181B] text-[#FAF7F2] hover:bg-[#27272A] text-[13px] font-sans font-semibold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer group"
                >
                  <span className="text-[#FAF7F2]">Abrir carta de muestra</span>
                  <ArrowRight className="w-4 h-4 text-[#DFC07D] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleScrollTo("#celebraciones")}
                  className="px-7 py-4 rounded-full bg-white hover:bg-stone-50 text-zinc-800 text-[13px] font-sans font-semibold uppercase tracking-wider border border-[#DFC9A6] shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                >
                  Explorar celebraciones
                </button>
              </div>

              {/* Trust Details */}
              <div className="pt-4 border-t border-[#E8DFC8]/70 flex flex-wrap items-center gap-6 text-[13px] text-zinc-600 font-sans">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8F7138]" />
                  <span>Sobre rotulado por familia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8F7138]" />
                  <span>Confirmación en tiempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8F7138]" />
                  <span>Mesas y QR sin estrés</span>
                </div>
              </div>
            </div>

            {/* Right Column: Artisan CSS 3D Envelope with Wax Seal (pt-14 lg:pt-20 para encuadre vertical seguro respecto al Navbar) */}
            <div className="lg:col-span-6 flex items-center justify-center relative z-10 pt-14 lg:pt-20">
              <InteractiveCssEnvelope
                onOpenModal={() =>
                  handleOpenInvitation("rivas-molina", "camila-andres-2025")
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Multi-Event Celebrations Showcase */}
      <CelebrationsShowcase onOpenInvitation={handleOpenInvitation} />

      {/* 4. How It Works (3 Alternating Visual Scenes) */}
      <section id="como-funciona" className="py-12">
        <HowItWorksScenes
          onOpenInvitation={handleOpenInvitation}
          onOpenHost={() => setIsHostOpen(true)}
          onOpenDayOf={() => setIsDayOfOpen(true)}
        />
      </section>

      {/* 5. PDF Comparison Section */}
      <section id="experiencia" className="py-12">
        <ComparisonSection />
      </section>

      {/* 6. Plans, Investment & FAQ Section */}
      <section id="planes" className="py-12">
        <PricingFaqSection onOpenContact={(planName) => handleOpenContact(planName)} />
      </section>

      {/* 7. Footer & Direct WhatsApp Contact */}
      <FooterContact
        onOpenHost={() => setIsHostOpen(true)}
        onOpenContact={() => handleOpenContact()}
      />

      {/* 8. Full Experience Modals */}
      <InvitationModal
        isOpen={invitationState.isOpen}
        guestToken={invitationState.token}
        eventId={invitationState.eventId}
        onClose={() =>
          setInvitationState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />

      <HostDashboardModal
        isOpen={isHostOpen}
        defaultEventId={invitationState.eventId || "camila-andres-2025"}
        onClose={() => setIsHostOpen(false)}
      />

      <DayOfKitModal
        isOpen={isDayOfOpen}
        eventId={invitationState.eventId || "camila-andres-2025"}
        onClose={() => setIsDayOfOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        initialPlan={contactPlan}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
