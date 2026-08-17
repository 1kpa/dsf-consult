'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Mesh, MathUtils, MeshStandardMaterial } from 'three';

interface JourneySceneProps {
  currentStage: number;
  totalStages: number;
}

const COLOR_START = new Color('#f59e0b');
const COLOR_END = new Color('#0ea5e9');

export default function JourneyScene({ currentStage, totalStages }: JourneySceneProps) {
  const meshRef = useRef<Mesh>(null);
  const progress = totalStages > 1 ? (currentStage - 1) / (totalStages - 1) : 0;

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.rotation.y += delta * 0.2;
    mesh.rotation.x += delta * 0.06;

    const targetScale = 1 + progress * 0.5;
    mesh.scale.x = MathUtils.lerp(mesh.scale.x, targetScale, 0.04);
    mesh.scale.y = MathUtils.lerp(mesh.scale.y, targetScale, 0.04);
    mesh.scale.z = MathUtils.lerp(mesh.scale.z, targetScale, 0.04);

    const material = mesh.material as MeshStandardMaterial;
    material.color.lerp(COLOR_START.clone().lerp(COLOR_END, progress), 0.04);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.4, 1]} />
      <meshStandardMaterial
        color="#f59e0b"
        metalness={0.5}
        roughness={0.3}
        emissive="#0f172a"
        emissiveIntensity={0.2}
        wireframe={progress < 0.15}
      />
    </mesh>
  );
}
