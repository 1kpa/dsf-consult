'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the @react-three/fiber Canvas for client-only rendering
const Canvas = dynamic(() => import('@react-three/fiber').then((m) => m.Canvas), { ssr: false });

// Dynamic import for useFrame to avoid SSR issues
const JourneyScene = dynamic(() => import('./JourneyScene'), { ssr: false });

interface JourneyThreeCanvasProps {
  currentStage: number;
  totalStages?: number;
}

export default function JourneyThreeCanvas({ currentStage, totalStages = 7 }: JourneyThreeCanvasProps) {
  return (
    <div className="w-full h-full opacity-40 md:opacity-50">
      <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <JourneyScene currentStage={currentStage} totalStages={totalStages} />
        </Canvas>
      </Suspense>
    </div>
  );
}
