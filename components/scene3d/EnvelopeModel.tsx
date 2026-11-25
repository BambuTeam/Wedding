"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface EnvelopeModelProps {
  progress?: number;
}

export function EnvelopeModel({ progress: progressProp }: EnvelopeModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothProgress = useRef(0);
  const { viewport } = useThree();
  const isMobile = viewport.width < 7.5;

  const { scene } = useGLTF("/models/sobre-invitacion.glb");

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const name = (mesh.name || "").toLowerCase();

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
        } else if (name.includes("sello") || name.includes("lacre")) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#C89D54"),
            metalness: 0.85,
            roughness: 0.22,
            side: THREE.DoubleSide,
          });
        } else if (name.includes("carta")) {
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
    const targetProgress = THREE.MathUtils.clamp(progressProp ?? 0, 0, 1);
    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, targetProgress, 0.12);
    const p = smoothProgress.current;
    const pointer = state.pointer;

    scene.traverse((child) => {
      const name = (child.name || "").toLowerCase();

      if (name.includes("solapa")) {
        const pSolapa = THREE.MathUtils.clamp(p / 0.45, 0, 1);
        child.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.92, pSolapa);
      }

      if (name.includes("bolsillo")) {
        const pBolsillo = THREE.MathUtils.clamp((p - 0.25) / 0.35, 0, 1);
        child.rotation.x = THREE.MathUtils.lerp(0, -0.12, pBolsillo);
      }

      if (name.includes("carta")) {
        const pCarta = THREE.MathUtils.clamp((p - 0.4) / 0.55, 0, 1);
        child.position.y = THREE.MathUtils.lerp(0.016, 1.15, pCarta);
        child.position.z = THREE.MathUtils.lerp(0.04, 0.25, pCarta);
      }

      if (name.includes("sobreroot") || name === "sobreroot") {
        const pRoot = THREE.MathUtils.clamp(p / 0.45, 0, 1);
        child.rotation.y = THREE.MathUtils.lerp(-0.25, 0, pRoot);
      }
    });

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
