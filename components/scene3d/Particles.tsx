"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
}

export function Particles({ count = 90 }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread across studio space
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      scl[i] = Math.random() * 0.05 + 0.02;
      spd[i] = Math.random() * 0.3 + 0.1;
    }

    return [pos, scl, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = positionsAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle floating upward & sinusoidal drift
      array[i * 3 + 1] += speeds[i] * delta * 0.4;
      array[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;

      // Wrap around
      if (array[i * 3 + 1] > 6) {
        array[i * 3 + 1] = -6;
        array[i * 3] = (Math.random() - 0.5) * 16;
      }
    }

    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#EAD7A8"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
