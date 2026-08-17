'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the @react-three/fiber Canvas for client-only rendering
const Canvas = dynamic(() => import('@react-three/fiber').then((m) => m.Canvas), { ssr: false });

// Dynamic import for useFrame to avoid SSR issues
const SmallScene = dynamic(
  () => import('./SmallScene'),
  { ssr: false }
);

export default function ThreeCanvas() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
      <Suspense fallback={<div /> }>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <SmallScene />
        </Canvas>
      </Suspense>
    </div>
  );
}
