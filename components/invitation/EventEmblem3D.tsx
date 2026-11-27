"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  Suspense,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
} from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, RotateCcw } from "lucide-react";
import { EventMeta, SculptureSlotKey, SculptureFinish } from "@/lib/types";
import { getEventCuratedSculptures } from "@/lib/3d/aurea3dCurator";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// =========================================================================
// 1. ERROR BOUNDARY SILENCIOSO PARA MODELOS .GLB
// =========================================================================
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[EventEmblem3D] Error al cargar modelo .glb:", error.message, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// =========================================================================
// 2. AUTO-FRAMING CAMERA RIG (DISTANCIA CALCULADA CON 38% DE MARGEN)
// =========================================================================
interface AutoFrameProps {
  boundingRadius: number;
  fov?: number;
}

function AutoFrameCamera({ boundingRadius, fov = 38 }: AutoFrameProps) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || boundingRadius <= 0) return;

    // Distancia exacta con 38% de margen de seguridad sobre la esfera envolvente
    const fovInRad = (camera.fov * Math.PI) / 180;
    const distance = (boundingRadius / Math.sin(fovInRad / 2)) * 1.38;

    camera.position.set(0, 0.12 * boundingRadius, distance);
    camera.near = 0.1;
    camera.far = distance * 4;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [boundingRadius, fov, camera]);

  return null;
}

// =========================================================================
// 3. GENERADOR DE MATERIALES PBR SEGÚN ACABADO ASIGNADO
// =========================================================================
function createPBRMaterial(origMaterial: THREE.Material, finish: SculptureFinish): THREE.Material {
  const matName = origMaterial?.name?.toLowerCase() || "";

  // 1. Detección de Gemas / Cristales Swarovski en Mallas Secundarias
  const isGem =
    matName.includes("cristal") ||
    matName.includes("gem") ||
    matName.includes("diamond") ||
    matName.includes("stone") ||
    matName.includes("joya") ||
    matName.includes("gema");

  if (isGem) {
    return new THREE.MeshPhysicalMaterial({
      name: origMaterial.name,
      color: new THREE.Color("#FFFFFF"),
      metalness: 0.04,
      roughness: 0.03,
      transmission: 0.94,
      ior: 2.417,
      thickness: 0.65,
      transparent: true,
      opacity: 1.0,
      envMapIntensity: 2.6,
    });
  }

  // 2. Acabado "pearl_gold": Nacarado satinado con reflejos iridiscentes
  if (finish === "pearl_gold" || matName.includes("perla") || matName.includes("pearl")) {
    const isGoldAccent = matName.includes("metal") || matName.includes("oro") || matName.includes("pico");
    if (isGoldAccent) {
      return new THREE.MeshPhysicalMaterial({
        name: origMaterial.name,
        color: new THREE.Color("#DFC38C"),
        metalness: 0.92,
        roughness: 0.16,
        clearcoat: 1.0,
        envMapIntensity: 1.8,
        transparent: false,
        opacity: 1.0,
      });
    }

    return new THREE.MeshPhysicalMaterial({
      name: origMaterial.name,
      color: new THREE.Color("#F4EFE6"),
      metalness: 0.25,
      roughness: 0.28,
      iridescence: 0.65,
      iridescenceIOR: 1.3,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.6,
      transparent: false,
      opacity: 1.0,
    });
  }

  // 3. Acabado "silver_crystal": Plata pulida con cristales refractivos
  if (finish === "silver_crystal") {
    const isGlassBody =
      matName.includes("vidrio") ||
      matName.includes("cristal") ||
      matName.includes("glass") ||
      matName.includes("gemas");

    if (isGlassBody) {
      return new THREE.MeshPhysicalMaterial({
        name: origMaterial.name,
        color: new THREE.Color("#FFFFFF"),
        metalness: 0.03,
        roughness: 0.03,
        transmission: 0.92,
        ior: 2.4,
        thickness: 0.7,
        transparent: true,
        opacity: 1.0,
        envMapIntensity: 2.4,
      });
    }

    // Plata pulida de alta pureza
    return new THREE.MeshPhysicalMaterial({
      name: origMaterial.name,
      color: new THREE.Color("#E8ECEF"),
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 2.0,
      transparent: false,
      opacity: 1.0,
    });
  }

  // 4. Acabado "rose_gold": Oro rosa editorial
  if (finish === "rose_gold") {
    return new THREE.MeshPhysicalMaterial({
      name: origMaterial.name,
      color: new THREE.Color("#E2B4A6"),
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.8,
      transparent: false,
      opacity: 1.0,
    });
  }

  // 5. Acabado "gold": Oro champán editorial de alta costura
  return new THREE.MeshPhysicalMaterial({
    name: origMaterial.name,
    color: new THREE.Color("#DFC38C"),
    metalness: 0.92,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.8,
    transparent: false,
    opacity: 1.0,
  });
}

// =========================================================================
// 4. INSTANCIA DE MODELO CON CENTRADO Y ROTACIÓN ANIMADA
// =========================================================================
interface ModelInstanceProps {
  modelUrl: string;
  finish: SculptureFinish;
  initialRotation?: [number, number, number];
  scaleMultiplier?: number;
  onRadiusCalculated: (radius: number) => void;
  scrollProgress: number;
}

function ModelInstance({
  modelUrl,
  finish,
  initialRotation,
  scaleMultiplier = 1.0,
  onRadiusCalculated,
  scrollProgress,
}: ModelInstanceProps) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);
  const [clonedGroup, setClonedGroup] = useState<THREE.Group | null>(null);

  useLayoutEffect(() => {
    if (!scene) return;

    const clone = scene.clone(true);

    // 1. Calcular Box3 y Bounding Sphere
    const box = new THREE.Box3().setFromObject(clone);
    const sphere = box.getBoundingSphere(new THREE.Sphere());

    // Centrar la pieza en (0, 0, 0)
    clone.position.sub(sphere.center);

    const effectiveRadius = sphere.radius > 0 ? sphere.radius : 1.0;
    onRadiusCalculated(effectiveRadius);

    // 2. Asignar materiales PBR granularmente por primitiva
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => createPBRMaterial(m, finish));
        } else if (mesh.material) {
          mesh.material = createPBRMaterial(mesh.material, finish);
        }
      }
    });

    setClonedGroup(clone);

    return () => {
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    };
  }, [scene, finish, onRadiusCalculated]);

  // Animación continua y reactiva al scroll
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Micro-levitación
    groupRef.current.position.y = Math.sin(t * 1.4) * 0.04;

    // Rotación continua vinculada al scroll
    const baseRotationY = (initialRotation?.[1] || 0) + t * 0.22;
    groupRef.current.rotation.y = baseRotationY + scrollProgress * 0.45;

    const baseRotationX = initialRotation?.[0] || 0.15;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      baseRotationX + (scrollProgress - 0.5) * 0.2,
      0.08
    );
  });

  if (!clonedGroup) return null;

  return (
    <group ref={groupRef} rotation={initialRotation || [0.22, -0.4, 0.08]}>
      <primitive object={clonedGroup} scale={scaleMultiplier} />
    </group>
  );
}

// =========================================================================
// 5. ESCENARIO 3D CON ESTUDIO DE ILUMINACIÓN DE JOYERÍA (0 KB HDR)
// =========================================================================
interface SculptureCanvasProps {
  modelUrl: string;
  finish: SculptureFinish;
  initialRotation?: [number, number, number];
  scaleMultiplier?: number;
  scrollProgress: number;
  isVisible: boolean;
  onLoadFailed: () => void;
  interactive?: boolean;
  showPedestalShadow?: boolean;
}

function SculptureCanvas({
  modelUrl,
  finish,
  initialRotation,
  scaleMultiplier,
  scrollProgress,
  isVisible,
  onLoadFailed,
  interactive = true,
  showPedestalShadow = false,
}: SculptureCanvasProps) {
  const [boundingRadius, setBoundingRadius] = useState<number>(1.0);

  return (
    <Canvas
      shadows="percentage"
      camera={{ position: [0, 0.4, 4.2], fov: 38 }}
      dpr={[1, 1.5]}
      frameloop={isVisible ? "always" : "demand"}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.18,
      }}
      className="w-full h-full"
      style={{ pointerEvents: interactive ? "auto" : "none", opacity: 1 }}
    >
      {/* Auto-framing con margen del 38% sobre la esfera envolvente */}
      <AutoFrameCamera boundingRadius={boundingRadius} fov={38} />

      {/* Luces direccionales de estudio de joyería */}
      <ambientLight color="#FAF5EE" intensity={0.7} />
      <directionalLight
        color="#FFF8EB"
        intensity={2.4}
        position={[4, 6, 5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <directionalLight
        color="#E8C882"
        intensity={1.8}
        position={[-4, 3, -4]}
      />

      {/* Entorno PBR con 4 Lightformers cálidos (#FFF6E5, #E8C882, #FFFFFF) */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={3.6}
          color="#FFF6E5"
          position={[5, 3, 5]}
          scale={[10, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.8}
          color="#E8C882"
          position={[-5, 2, -4]}
          scale={[10, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={3.2}
          color="#FFFFFF"
          position={[0, 6, 0]}
          scale={[8, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#FFF8EB"
          position={[0, -2, 3]}
          scale={[6, 3, 1]}
        />
      </Environment>

      {/* Modelo cargado */}
      <ModelErrorBoundary onError={onLoadFailed}>
        <Suspense fallback={null}>
          <ModelInstance
            modelUrl={modelUrl}
            finish={finish}
            initialRotation={initialRotation}
            scaleMultiplier={scaleMultiplier}
            onRadiusCalculated={setBoundingRadius}
            scrollProgress={scrollProgress}
          />
        </Suspense>
      </ModelErrorBoundary>

      {/* Sombra de contacto únicamente en modo pedestal (desactivada en flotantes) */}
      {showPedestalShadow && (
        <ContactShadows
          position={[0, -boundingRadius * 0.95, 0]}
          opacity={0.28}
          scale={boundingRadius * 3.4}
          blur={2.4}
          far={boundingRadius * 3.0}
          color="#181715"
        />
      )}

      {/* OrbitControls interactivo */}
      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={isVisible}
          autoRotateSpeed={1.2}
          dampingFactor={0.06}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
        />
      )}
    </Canvas>
  );
}

// =========================================================================
// 6. COMPONENTE MARGINAL EDITORIAL (MOTOR CURATOR DE 4 RANURAS)
// =========================================================================
export interface EditorialSculptureProps {
  event: EventMeta;
  slot?: SculptureSlotKey;
}

export function EventEmblem3D({ event, slot = "slot_1" }: EditorialSculptureProps) {
  const curatedSlots = getEventCuratedSculptures(event);
  const piece = curatedSlots[slot] || curatedSlots.slot_1;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const [hasFailed, setHasFailed] = useState(false);

  // Lazy mounting con IntersectionObserver (rootMargin: 200px para 60fps)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Parallax con GSAP ScrollTrigger
  useEffect(() => {
    if (!containerRef.current || !isIntersecting) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [isIntersecting]);

  if (hasFailed) return null;

  // -------------------------------------------------------------
  // POSICIONAMIENTO EN DESKTOP (Márgenes Seguros >= 1280px, z-0 para cero superposición)
  // -------------------------------------------------------------
  let desktopPositionClasses = "-right-24 xl:-right-36 top-16";
  if (piece.position === "top-right") {
    desktopPositionClasses = "-right-24 xl:-right-36 top-20";
  } else if (piece.position === "mid-left") {
    desktopPositionClasses = "-left-24 xl:-left-36 top-12";
  } else if (piece.position === "mid-right") {
    desktopPositionClasses = "-right-24 xl:-right-36 top-16";
  } else if (piece.position === "bottom-left") {
    desktopPositionClasses = "-left-24 xl:-left-36 top-12";
  }

  // Las ranuras 1 y 4 se muestran en pantallas menores como separadores dedicados entre bloques
  const isMobileFeatured = slot === "slot_1" || slot === "slot_4";

  return (
    <div
      ref={containerRef}
      className="pointer-events-none select-none"
    >
      {/* Vista Desktop (>= 1280px): Escultura colocada en los márgenes exteriores sin invadir formularios */}
      <div
        className={`hidden xl:block absolute ${desktopPositionClasses} w-[300px] 2xl:w-[360px] h-[420px] 2xl:h-[480px] z-0 pointer-events-none`}
      >
        <div className="relative w-full h-full pointer-events-none">
          {isIntersecting && (
            <SculptureCanvas
              modelUrl={piece.modelUrl}
              finish={piece.finish}
              initialRotation={piece.rotation}
              scaleMultiplier={piece.scaleMultiplier}
              scrollProgress={scrollProgress}
              isVisible={isIntersecting}
              onLoadFailed={() => setHasFailed(true)}
              interactive={false}
              showPedestalShadow={false}
            />
          )}
        </div>
      </div>

      {/* Vista Móvil y Tablet (< 1280px): Separador escultórico dedicado con altura propia entre bloques (jamás flotando encima) */}
      {isMobileFeatured && (
        <div className="xl:hidden my-8 p-4 rounded-3xl bg-gradient-to-b from-[#FAF7F2]/90 to-white/90 border border-[#DFC9A6]/40 text-center relative overflow-hidden pointer-events-none h-48 flex flex-col items-center justify-center">
          {piece.badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B2B23] text-[#DFC07D] text-[9px] font-bold uppercase tracking-widest shadow-sm mb-1">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              <span>{piece.badge}</span>
            </div>
          )}

          <h4 className="font-serif text-lg text-[#181715] font-normal leading-tight">{piece.name}</h4>

          <div className="relative w-full h-[120px] mx-auto pointer-events-none">
            {isIntersecting && (
              <SculptureCanvas
                modelUrl={piece.modelUrl}
                finish={piece.finish}
                initialRotation={piece.rotation}
                scaleMultiplier={piece.scaleMultiplier}
                scrollProgress={scrollProgress}
                isVisible={isIntersecting}
                onLoadFailed={() => setHasFailed(true)}
                interactive={false}
                showPedestalShadow={true}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventEmblem3D;
