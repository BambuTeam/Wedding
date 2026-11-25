"use client";

import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Particles } from "./Particles";

interface EnvelopeSceneProps {
  progressProp?: number;
}

/**
 * Escenario 3D Split-Screen: Verde Salvia Profundo (#3D4F42) + Oro Metálico (#C89D54)
 * Animación fluida por nodos vinculada al progreso de la sección de 300vh
 */
export function EnvelopeModel3D({ progressProp }: EnvelopeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothProgress = useRef(0);
  const { viewport } = useThree();
  const isMobile = viewport.width < 7.5;

  const { scene } = useGLTF("/models/sobre-invitacion.glb");

  // Forzar materiales de alto contraste editorial en cada malla
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const name = (mesh.name || "").toLowerCase();

        // 1. Sobre, Solapa, Bolsillo y Espalda: Verde Salvia Profundo (#3D4F42)
        if (
          name.includes("espalda") ||
          name.includes("bolsillo") ||
          name.includes("solapa") ||
          name.includes("sobre")
        ) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#3D4F42"),
            roughness: 0.78,
            metalness: 0.05,
            side: THREE.DoubleSide,
          });
        }
        // 2. Sello de Lacre: Oro Metálico Radiante (#C89D54)
        else if (name.includes("sello") || name.includes("lacre")) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#C89D54"),
            metalness: 0.85,
            roughness: 0.22,
            side: THREE.DoubleSide,
          });
        }
        // 3. Carta Interior: Marfil Luminoso (#FFFDF9)
        else if (name.includes("carta")) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#FFFDF9"),
            roughness: 0.6,
            metalness: 0.0,
            side: THREE.DoubleSide,
          });
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    // Progreso entregado por la sección de 300vh
    const targetProgress = THREE.MathUtils.clamp(progressProp ?? 0, 0, 1);

    // Suavizado continuo lerp a 60fps
    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, targetProgress, 0.12);
    const p = smoothProgress.current;
    const pointer = state.pointer;

    // Animación de apertura garantizada en los nodos
    scene.traverse((child) => {
      const name = (child.name || "").toLowerCase();

      // 0.0 -> 0.45: Rota Solapa en su eje local para abrirse hacia arriba (rotation.x = Math.PI * 0.92)
      if (name.includes("solapa")) {
        const pSolapa = THREE.MathUtils.clamp(p / 0.45, 0, 1);
        child.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.92, pSolapa);
      }

      // Bolsillo frontal se inclina para dar paso a la carta
      if (name.includes("bolsillo")) {
        const pBolsillo = THREE.MathUtils.clamp((p - 0.25) / 0.35, 0, 1);
        child.rotation.x = THREE.MathUtils.lerp(0, -0.12, pBolsillo);
      }

      // 0.40 -> 0.95: Desliza CartaInterior hacia arriba (position.y = 1.15) y adelante (position.z = 0.25)
      if (name.includes("carta")) {
        const pCarta = THREE.MathUtils.clamp((p - 0.4) / 0.55, 0, 1);
        child.position.y = THREE.MathUtils.lerp(0.016, 1.15, pCarta);
        child.position.z = THREE.MathUtils.lerp(0.04, 0.25, pCarta);
      }

      // Gira ligeramente SobreRoot de frente (rotation.y = 0)
      if (name.includes("sobreroot") || name === "sobreroot") {
        const pRoot = THREE.MathUtils.clamp(p / 0.45, 0, 1);
        child.rotation.y = THREE.MathUtils.lerp(-0.25, 0, pRoot);
      }
    });

    // Parallax orgánico del grupo con el cursor
    if (groupRef.current) {
      const baseRotX = 0.35 + pointer.y * 0.06;
      const baseRotY = -0.25 + p * 0.25 + pointer.x * 0.08;
      const baseRotZ = 0.04;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, baseRotX, 0.08);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, baseRotY, 0.08);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, baseRotZ, 0.08);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, -0.15, 0]}
      scale={isMobile ? 1.05 : 1.35}
      rotation={[0.35, -0.25, 0.04]}
      dispose={null}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/sobre-invitacion.glb");

interface SceneCanvasProps {
  progress: number;
}

export default function SceneCanvas({ progress }: SceneCanvasProps) {
  return (
    <div className="w-full h-full relative select-none pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.2, 4.6], fov: 36 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
        className="pointer-events-none"
      >
        <Suspense fallback={null}>
          {/* Iluminación de Estudio de Alto Contraste */}
          <ambientLight intensity={0.4} />

          <directionalLight
            position={[3, 5, 4]}
            intensity={1.8}
            color="#FFF4E0"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          <directionalLight
            position={[-3, -1, 2]}
            intensity={0.5}
            color="#EAE3D2"
          />

          <pointLight
            position={[0, 1.5, 2]}
            intensity={1.0}
            color="#E8CE94"
            distance={6}
          />

          {/* Environment City para reflejos vivos en el lacre dorado */}
          <Environment preset="city" environmentIntensity={0.6} />

          {/* Sombra de contacto */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={7}
            blur={2.2}
          />

          {/* Partículas doradas suspendidas */}
          <Particles count={35} />

          {/* Modelo 3D */}
          <EnvelopeModel3D progressProp={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
