"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasContainer } from "@/components/scene3d/CanvasContainer";
import {
  ActOverlays,
  CELEBRATION_CATEGORIES,
  CelebrationCategory,
} from "./ActOverlays";
import { CelebrationsShowcase } from "@/components/landing/CelebrationsShowcase";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { ScrollytellingSteps } from "@/components/landing/ScrollytellingSteps";
import { PlannersSection } from "@/components/landing/PlannersSection";
import { PricingFaqSection } from "@/components/landing/PricingFaqSection";
import { FooterContact } from "@/components/landing/FooterContact";
import { InvitationModal } from "@/components/viewers/InvitationModal";
import { HostDashboardModal } from "@/components/viewers/HostDashboardModal";
import { DayOfKitModal } from "@/components/viewers/DayOfKitModal";
import { ContactModal } from "@/components/viewers/ContactModal";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollyStage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState<CelebrationCategory>(
    CELEBRATION_CATEGORIES[0]
  );

  // Modals state
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

  const stagePinRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const isAnyModalOpen =
    invitationState.isOpen || isHostOpen || isDayOfOpen || isContactOpen;

  // Modal scroll isolation: pause Lenis when a modal is open
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isAnyModalOpen) {
      lenisRef.current.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenisRef.current.start();
      document.body.style.overflow = "";
    }
  }, [isAnyModalOpen]);

  // Initialize Lenis + GSAP ScrollTrigger Pinned Stage
  useEffect(() => {
    // 1. Setup Lenis instance
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // 2. Synchronize Lenis with GSAP Ticker & ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenisTicker);
    gsap.ticker.lagSmoothing(0);

    // 3. Setup ScrollTrigger with true pin: true for 320% of viewport height
    if (stagePinRef.current) {
      const st = ScrollTrigger.create({
        trigger: stagePinRef.current,
        pin: true,
        start: "top top",
        end: "+=320%",
        scrub: 1.1,
        anticipatePin: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
      scrollTriggerRef.current = st;
    }

    // 4. Custom navigation events
    const handleOpenHost = () => setIsHostOpen(true);
    const handleOpenContact = () => setIsContactOpen(true);
    const handleOpenDayOf = () => setIsDayOfOpen(true);

    const handleScrollToEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      if (customEvent.detail && typeof customEvent.detail.progress === "number") {
        if (!lenisRef.current || !scrollTriggerRef.current) return;
        const st = scrollTriggerRef.current;
        const targetScroll = st.start + (st.end - st.start) * customEvent.detail.progress;
        lenisRef.current.scrollTo(targetScroll, { duration: 1.4 });
      }
    };

    window.addEventListener("aurea:open-host", handleOpenHost);
    window.addEventListener("aurea:create-invite", handleOpenContact);
    window.addEventListener("aurea:open-dayof", handleOpenDayOf);
    window.addEventListener("aurea:scroll-to", handleScrollToEvent);

    return () => {
      gsap.ticker.remove(updateLenisTicker);
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      lenis.destroy();
      window.removeEventListener("aurea:open-host", handleOpenHost);
      window.removeEventListener("aurea:create-invite", handleOpenContact);
      window.removeEventListener("aurea:open-dayof", handleOpenDayOf);
      window.removeEventListener("aurea:scroll-to", handleScrollToEvent);
    };
  }, []);

  // Smooth scroll to specific act inside the pinned sequence
  const scrollToAct = useCallback((targetProgress: number) => {
    if (!lenisRef.current || !scrollTriggerRef.current) return;
    const st = scrollTriggerRef.current;
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    lenisRef.current.scrollTo(targetScroll, { duration: 1.4 });
  }, []);

  const handleOpenInvitation = (token: string, eventId: string) => {
    setInvitationState({
      isOpen: true,
      token,
      eventId,
    });
  };

  return (
    <div className="relative bg-[#FAF8F5]">
      {/* ============================================================== */}
      {/* 1. PINNED 100VH 3D STAGE (GSAP pin: true for 320% of scroll)  */}
      {/* ============================================================== */}
      <div
        ref={stagePinRef}
        className="w-full h-screen relative overflow-hidden bg-[#FAF8F5] select-none"
      >
        {/* Layer 0: 3D WebGL Canvas */}
        <CanvasContainer progress={scrollProgress} />

        {/* Layer 1: Choreographed 5 Acts HTML/JSX Overlay */}
        <ActOverlays
          progress={scrollProgress}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
          onOpenInvitation={handleOpenInvitation}
          onOpenDayOf={() => setIsDayOfOpen(true)}
          onOpenHost={() => setIsHostOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          onScrollToAct={scrollToAct}
        />

        {/* Floating Mini Timeline Dock in Bottom Right */}
        <div className="absolute bottom-6 right-6 pointer-events-auto z-20 hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/90 shadow-lg text-xs">
          {[
            { label: "01", name: "El Anuncio", progress: 0.0 },
            { label: "02", name: "La Carta", progress: 0.28 },
            { label: "03", name: "Celebraciones", progress: 0.52 },
            { label: "04", name: "El Día", progress: 0.74 },
            { label: "05", name: "Atelier", progress: 0.94 },
          ].map((act, i) => {
            const isActive =
              (i === 0 && scrollProgress < 0.2) ||
              (i === 1 && scrollProgress >= 0.2 && scrollProgress < 0.42) ||
              (i === 2 && scrollProgress >= 0.42 && scrollProgress < 0.65) ||
              (i === 3 && scrollProgress >= 0.65 && scrollProgress < 0.85) ||
              (i === 4 && scrollProgress >= 0.85);

            return (
              <button
                key={act.label}
                onClick={() => scrollToAct(act.progress)}
                className={`px-3 py-1 rounded-full font-serif transition-all duration-300 text-xs ${
                  isActive
                    ? "bg-stone-900 text-stone-50 font-medium shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                }`}
                title={act.name}
              >
                {act.label} <span className="hidden lg:inline text-[11px] ml-1">{act.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE INTEGRAL WEBSITE SECTIONS (Flowing naturally below)    */}
      {/* ============================================================== */}

      {/* Section A: Multi-Celebration Lookbook Showcase */}
      <section id="celebraciones" className="relative z-10">
        <CelebrationsShowcase onOpenInvitation={handleOpenInvitation} />
      </section>

      {/* Section B: Comparison Table ("Lo que una carta digital hace por ti") */}
      <section className="relative z-10">
        <ComparisonSection />
      </section>

      {/* Section C: The 3-Step Human Journey */}
      <section id="dia-del-evento" className="relative z-10">
        <ScrollytellingSteps
          onOpenDayOf={() => setIsDayOfOpen(true)}
          onOpenHost={() => setIsHostOpen(true)}
        />
      </section>

      {/* Section D: Atelier for Wedding Planners & Hosts */}
      <section id="planners" className="relative z-10">
        <PlannersSection onOpenHost={() => setIsHostOpen(true)} />
      </section>

      {/* Section E: Transparent Design Collections & FAQ */}
      <section className="relative z-10">
        <PricingFaqSection onOpenContact={() => setIsContactOpen(true)} />
      </section>

      {/* Section F: Direct Atelier Contact & Comprehensive Footer */}
      <footer className="relative z-10">
        <FooterContact
          onOpenHost={() => setIsHostOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
        />
      </footer>

      {/* ============================================================== */}
      {/* 3. IN-PAGE INMERSIVE MODALS (With isolated scroll)            */}
      {/* ============================================================== */}
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
        defaultEventId={activeCategory.eventId || "camila-andres-2025"}
        onClose={() => setIsHostOpen(false)}
      />

      <DayOfKitModal
        isOpen={isDayOfOpen}
        eventId={activeCategory.eventId || "camila-andres-2025"}
        onClose={() => setIsDayOfOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
