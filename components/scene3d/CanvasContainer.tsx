"use client";

import React from "react";
import dynamic from "next/dynamic";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => null,
});

interface CanvasContainerProps {
  progress: number;
}

export function CanvasContainer({ progress }: CanvasContainerProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      <SceneCanvas progress={progress} />
    </div>
  );
}
