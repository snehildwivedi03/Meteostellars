import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ImpactExplosion({ position }) {
  const meshRef = useRef();
  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    clock.current.start();
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      const t = clock.current.getElapsedTime();
      // Explosion Animation: Scale up and fade out
      meshRef.current.scale.setScalar(1 + t * 5);
      meshRef.current.material.opacity = Math.max(0, 1 - t * 1.5);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="orange"
        emissive="red"
        transparent
        opacity={1}
      />
    </mesh>
  );
}
