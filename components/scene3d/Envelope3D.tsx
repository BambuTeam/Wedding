"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  createLetterTexture,
  createQrTotemTexture,
  createAcrylicTableTexture,
} from "./textureUtils";

interface CelebrationInfo {
  title: string;
  subtitle: string;
  recipient: string;
  venue: string;
  date: string;
  accentColor: string;
}

interface Envelope3DProps {
  progress: number;
  celebration?: CelebrationInfo;
}

export function Envelope3D({
  progress,
  celebration = {
    title: "Camila & Andrés",
    subtitle: "Nuestra Boda",
    recipient: "Familia Rivas Molina",
    venue: "Convento de las Capuchinas · Antigua Guatemala",
    date: "Sábado, 28 de Noviembre de 2026",
    accentColor: "#B89758",
  },
}: Envelope3DProps) {
  const masterGroup = useRef<THREE.Group>(null);
  const envelopeGroup = useRef<THREE.Group>(null);
  const flapPivot = useRef<THREE.Group>(null);
  const waxSealRef = useRef<THREE.Mesh>(null);
  const letterRef = useRef<THREE.Group>(null);
  const qrTotemRef = useRef<THREE.Group>(null);
  const acrylicCardRef = useRef<THREE.Group>(null);

  // Dynamic Textures
  const letterTexture = useMemo(() => {
    return createLetterTexture(
      celebration.title,
      celebration.subtitle,
      celebration.recipient,
      celebration.venue,
      celebration.date,
      celebration.accentColor
    );
  }, [
    celebration.title,
    celebration.subtitle,
    celebration.recipient,
    celebration.venue,
    celebration.date,
    celebration.accentColor,
  ]);

  const qrTexture = useMemo(() => createQrTotemTexture(), []);
  const acrylicTexture = useMemo(() => createAcrylicTableTexture(), []);

  // Paper & Gold materials
  const paperMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#F6F2EC",
        roughness: 0.82,
        metalness: 0.05,
        clearcoat: 0.1,
        clearcoatRoughness: 0.3,
        side: THREE.DoubleSide,
      }),
    []
  );

  const goldSealMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#C5A059",
        roughness: 0.22,
        metalness: 0.78,
        clearcoat: 0.85,
        clearcoatRoughness: 0.15,
      }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        transmission: 0.75,
        opacity: 1,
        transparent: true,
        roughness: 0.12,
        ior: 1.5,
        thickness: 0.4,
      }),
    []
  );

  // Custom triangular flap shape
  const flapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Base along top edge of envelope (width 3.8, from x = -1.9 to x = 1.9)
    shape.moveTo(-1.9, 0);
    shape.lineTo(1.9, 0);
    // Point downward toward center
    shape.lineTo(0, -1.45);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.03,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Frame loop smoothly interpolating 3D components according to scroll progress
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const pointer = state.pointer;
    const isMobile = state.viewport.width < 7.5;
    const scaleFactor = isMobile ? 0.75 : 1.0;

    // Smooth progress dampening
    const p = THREE.MathUtils.clamp(progress, 0, 1);

    // 1. Master Group Transformation Across 5 Acts
    if (masterGroup.current) {
      masterGroup.current.scale.setScalar(scaleFactor);

      // Mouse Parallax
      const targetMouseX = pointer.x * 0.35;
      const targetMouseY = pointer.y * 0.25;

      // Base coordinate offsets based on device width
      const baseX = isMobile ? 0.0 : 0.95;
      const baseY = isMobile ? 0.7 : 0.05;

      let targetX = baseX;
      let targetY = baseY;
      let targetZ = 0.0;
      let targetRotY = -0.15;
      let targetRotX = 0.08;

      if (p <= 0.2) {
        const t = p / 0.2;
        targetX = THREE.MathUtils.lerp(baseX, isMobile ? 0.0 : 0.4, t);
        targetY = THREE.MathUtils.lerp(baseY, isMobile ? 0.5 : -0.05, t);
        targetZ = THREE.MathUtils.lerp(0.0, 0.3, t);
        targetRotY = THREE.MathUtils.lerp(-0.18, -0.08, t);
      } else if (p <= 0.42) {
        const t = (p - 0.2) / 0.22;
        targetX = THREE.MathUtils.lerp(isMobile ? 0.0 : 0.4, isMobile ? 0.0 : 0.1, t);
        targetY = THREE.MathUtils.lerp(isMobile ? 0.5 : -0.05, isMobile ? 0.2 : -0.4, t);
        targetZ = THREE.MathUtils.lerp(0.3, 0.7, t);
        targetRotY = THREE.MathUtils.lerp(-0.08, 0.05, t);
        targetRotX = THREE.MathUtils.lerp(0.08, 0.12, t);
      } else if (p <= 0.65) {
        const t = (p - 0.42) / 0.23;
        targetX = THREE.MathUtils.lerp(isMobile ? 0.0 : 0.1, isMobile ? 0.0 : 0.8, t);
        targetY = THREE.MathUtils.lerp(isMobile ? 0.2 : -0.4, isMobile ? 0.4 : -0.2, t);
        targetZ = THREE.MathUtils.lerp(0.7, 0.4, t);
        targetRotY = THREE.MathUtils.lerp(0.05, -0.22, t);
      } else if (p <= 0.85) {
        const t = (p - 0.65) / 0.2;
        targetX = THREE.MathUtils.lerp(isMobile ? 0.0 : 0.8, isMobile ? -0.4 : -1.3, t);
        targetY = THREE.MathUtils.lerp(isMobile ? 0.4 : -0.2, isMobile ? 0.5 : 0.1, t);
        targetZ = THREE.MathUtils.lerp(0.4, -0.4, t);
        targetRotY = THREE.MathUtils.lerp(-0.22, 0.28, t);
      } else {
        const t = (p - 0.85) / 0.15;
        targetX = THREE.MathUtils.lerp(isMobile ? -0.4 : -1.3, 0.0, t);
        targetY = THREE.MathUtils.lerp(isMobile ? 0.5 : 0.1, isMobile ? 0.4 : 0.0, t);
        targetZ = THREE.MathUtils.lerp(-0.4, -0.6, t);
        targetRotY = THREE.MathUtils.lerp(0.28, 0.0, t);
      }

      // Natural idle floating
      const idleY = Math.sin(time * 1.2) * 0.04;
      const idleRotZ = Math.cos(time * 0.9) * 0.015;

      masterGroup.current.position.x = THREE.MathUtils.lerp(
        masterGroup.current.position.x,
        targetX + targetMouseX * 0.3,
        0.08
      );
      masterGroup.current.position.y = THREE.MathUtils.lerp(
        masterGroup.current.position.y,
        targetY + idleY + targetMouseY * 0.2,
        0.08
      );
      masterGroup.current.position.z = THREE.MathUtils.lerp(
        masterGroup.current.position.z,
        targetZ,
        0.08
      );

      masterGroup.current.rotation.x = THREE.MathUtils.lerp(
        masterGroup.current.rotation.x,
        targetRotX - targetMouseY * 0.15,
        0.08
      );
      masterGroup.current.rotation.y = THREE.MathUtils.lerp(
        masterGroup.current.rotation.y,
        targetRotY + targetMouseX * 0.25,
        0.08
      );
      masterGroup.current.rotation.z = THREE.MathUtils.lerp(
        masterGroup.current.rotation.z,
        idleRotZ,
        0.08
      );
    }

    // 2. Flap Rotation Hinge (Opens between p = 0.16 and p = 0.38)
    if (flapPivot.current) {
      let flapProgress = 0;
      if (p >= 0.16 && p <= 0.38) {
        flapProgress = (p - 0.16) / 0.22;
      } else if (p > 0.38) {
        flapProgress = 1;
      }
      // Rotate backwards around top hinge (-165 degrees = -2.88 rad)
      const targetFlapAngle = -flapProgress * 2.88;
      flapPivot.current.rotation.x = THREE.MathUtils.lerp(
        flapPivot.current.rotation.x,
        targetFlapAngle,
        0.1
      );
    }

    // 3. Wax Seal Lift & Peel
    if (waxSealRef.current) {
      let sealProgress = 0;
      if (p >= 0.15 && p <= 0.28) {
        sealProgress = (p - 0.15) / 0.13;
      } else if (p > 0.28) {
        sealProgress = 1;
      }
      // Elevate slightly in Z to simulate break
      waxSealRef.current.position.z = THREE.MathUtils.lerp(
        waxSealRef.current.position.z,
        0.04 + sealProgress * 0.12,
        0.12
      );
    }

    // 4. Inner Letter Emergence (Sliding up between p = 0.22 and p = 0.45)
    if (letterRef.current) {
      let letterSlide = 0;
      if (p >= 0.22 && p <= 0.45) {
        letterSlide = (p - 0.22) / 0.23;
      } else if (p > 0.45) {
        letterSlide = 1;
      }

      const targetLetterY = THREE.MathUtils.lerp(0.0, 1.82, letterSlide);
      const targetLetterZ = THREE.MathUtils.lerp(-0.01, 0.22, letterSlide);
      const targetLetterRotX = THREE.MathUtils.lerp(0.0, -0.16, letterSlide);

      letterRef.current.position.y = THREE.MathUtils.lerp(
        letterRef.current.position.y,
        targetLetterY,
        0.1
      );
      letterRef.current.position.z = THREE.MathUtils.lerp(
        letterRef.current.position.z,
        targetLetterZ,
        0.1
      );
      letterRef.current.rotation.x = THREE.MathUtils.lerp(
        letterRef.current.rotation.x,
        targetLetterRotX,
        0.1
      );
    }

    // 5. QR Totem Traveling (Comes to front stage in Act 4)
    if (qrTotemRef.current) {
      let qrFocus = 0;
      if (p >= 0.62 && p <= 0.82) {
        qrFocus = (p - 0.62) / 0.2;
      } else if (p > 0.82) {
        qrFocus = THREE.MathUtils.lerp(1, 0.2, (p - 0.82) / 0.18);
      }

      const targetQrX = THREE.MathUtils.lerp(2.8, 1.35, qrFocus);
      const targetQrY = THREE.MathUtils.lerp(-1.2, -0.15, qrFocus);
      const targetQrZ = THREE.MathUtils.lerp(-0.5, 1.25, qrFocus);
      const targetQrRotY = THREE.MathUtils.lerp(0.3, -0.15, qrFocus);

      qrTotemRef.current.position.x = THREE.MathUtils.lerp(
        qrTotemRef.current.position.x,
        targetQrX,
        0.08
      );
      qrTotemRef.current.position.y = THREE.MathUtils.lerp(
        qrTotemRef.current.position.y,
        targetQrY + Math.sin(time * 1.5 + 2) * 0.03,
        0.08
      );
      qrTotemRef.current.position.z = THREE.MathUtils.lerp(
        qrTotemRef.current.position.z,
        targetQrZ,
        0.08
      );
      qrTotemRef.current.rotation.y = THREE.MathUtils.lerp(
        qrTotemRef.current.rotation.y,
        targetQrRotY,
        0.08
      );
    }

    // 6. Acrylic Table Card (Drifts gracefully)
    if (acrylicCardRef.current) {
      let acrylicFocus = 0;
      if (p >= 0.62 && p <= 0.82) {
        acrylicFocus = (p - 0.62) / 0.2;
      } else if (p > 0.82) {
        acrylicFocus = THREE.MathUtils.lerp(1, 0.1, (p - 0.82) / 0.18);
      }

      const targetAcX = THREE.MathUtils.lerp(-2.8, -1.4, acrylicFocus);
      const targetAcY = THREE.MathUtils.lerp(1.4, 0.7, acrylicFocus);
      const targetAcZ = THREE.MathUtils.lerp(-0.8, 0.6, acrylicFocus);

      acrylicCardRef.current.position.x = THREE.MathUtils.lerp(
        acrylicCardRef.current.position.x,
        targetAcX,
        0.08
      );
      acrylicCardRef.current.position.y = THREE.MathUtils.lerp(
        acrylicCardRef.current.position.y,
        targetAcY + Math.cos(time * 1.3) * 0.04,
        0.08
      );
      acrylicCardRef.current.position.z = THREE.MathUtils.lerp(
        acrylicCardRef.current.position.z,
        targetAcZ,
        0.08
      );
    }
  });

  return (
    <group ref={masterGroup}>
      {/* ============================================================== */}
      {/* 1. ENVELOPE BASE (Pocket, Back Plate, Pocket Front)           */}
      {/* ============================================================== */}
      <group ref={envelopeGroup}>
        {/* Back Plate */}
        <mesh position={[0, 0, -0.04]} material={paperMaterial}>
          <boxGeometry args={[3.8, 2.5, 0.03]} />
        </mesh>

        {/* Pocket Front Plate (lower front half) */}
        <mesh position={[0, -0.4, 0.03]} material={paperMaterial}>
          <boxGeometry args={[3.8, 1.7, 0.03]} />
        </mesh>

        {/* Side and Bottom Spacers to create inner pocket */}
        <mesh position={[-1.85, 0, 0]} material={paperMaterial}>
          <boxGeometry args={[0.08, 2.5, 0.06]} />
        </mesh>
        <mesh position={[1.85, 0, 0]} material={paperMaterial}>
          <boxGeometry args={[0.08, 2.5, 0.06]} />
        </mesh>
        <mesh position={[0, -1.22, 0]} material={paperMaterial}>
          <boxGeometry args={[3.8, 0.08, 0.06]} />
        </mesh>

        {/* Front pocket decorative diagonal fold lines */}
        <mesh position={[0, -0.4, 0.048]}>
          <planeGeometry args={[3.7, 0.012]} />
          <meshBasicMaterial color="#E0D2BC" transparent opacity={0.6} />
        </mesh>

        {/* ============================================================== */}
        {/* 2. TOP FLAP WITH PIVOT GROUP (Hinge along upper edge y = 1.25) */}
        {/* ============================================================== */}
        <group ref={flapPivot} position={[0, 1.25, 0.02]}>
          <mesh geometry={flapGeometry} material={paperMaterial} position={[0, 0, 0]} />

          {/* Golden Wax Seal placed on the triangular tip */}
          <mesh
            ref={waxSealRef}
            position={[0, -1.35, 0.04]}
            material={goldSealMaterial}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.34, 0.38, 0.06, 32]} />
          </mesh>

          {/* Wax Seal Inner Monogram Ring */}
          <mesh position={[0, -1.35, 0.075]} material={goldSealMaterial}>
            <ringGeometry args={[0.18, 0.24, 32]} />
          </mesh>
        </group>

        {/* ============================================================== */}
        {/* 3. INNER INVITATION CARD (Sliding Upward on Scroll)             */}
        {/* ============================================================== */}
        <group ref={letterRef} position={[0, 0, -0.005]}>
          {/* Card Body */}
          <mesh material={paperMaterial}>
            <boxGeometry args={[3.5, 2.3, 0.025]} />
          </mesh>

          {/* Front Printed Canvas Texture */}
          <mesh position={[0, 0, 0.014]}>
            <planeGeometry args={[3.46, 2.26]} />
            <meshStandardMaterial
              map={letterTexture}
              roughness={0.7}
              metalness={0.08}
            />
          </mesh>

          {/* Back Printed Minimalist Pattern */}
          <mesh position={[0, 0, -0.014]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[3.46, 2.26]} />
            <meshStandardMaterial color="#FAF7F2" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 4. SATELLITE 3D OBJECTS (Parallax in Depth)                    */}
      {/* ============================================================== */}

      {/* Satellite A: Golden QR Totem */}
      <group ref={qrTotemRef} position={[2.8, -1.2, -0.5]}>
        {/* Card Stand */}
        <mesh material={goldSealMaterial}>
          <boxGeometry args={[1.5, 2.1, 0.05]} />
        </mesh>
        {/* QR Face */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.44, 2.04]} />
          <meshStandardMaterial map={qrTexture} roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* Satellite B: Acrylic Glass Table Card */}
      <group ref={acrylicCardRef} position={[-2.8, 1.4, -0.8]}>
        <mesh material={glassMaterial}>
          <boxGeometry args={[1.6, 1.6, 0.06]} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.55, 1.55]} />
          <meshStandardMaterial
            map={acrylicTexture}
            transparent
            opacity={0.92}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* Satellite C: Floating Gold Seal Monogram Token */}
      <mesh
        position={[-2.3, -1.2, 0.4]}
        material={goldSealMaterial}
        rotation={[0.3, 0.4, 0.1]}
      >
        <cylinderGeometry args={[0.26, 0.3, 0.05, 32]} />
      </mesh>
    </group>
  );
}
