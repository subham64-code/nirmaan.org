"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sphere, MeshWobbleMaterial } from "@react-three/drei";
import { useEffect, useState } from "react";

function AnimatedSphere() {
  return (
    <Sphere args={[1, 100, 200]}>
      <MeshWobbleMaterial
        color="#6366f1"
        speed={2}
        factor={0.6}
        wireframe={false}
      />
    </Sphere>
  );
}

export function HeroCanvas() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Canvas className="!absolute inset-0 -z-10" dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, 0, 2.5]} />
      <AnimatedSphere />
      <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}
