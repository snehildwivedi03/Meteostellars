// src/components/three/Earth.jsx
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function Earth({ scaleX = 20, scaleY = 5, scaleZ = 20 }) {
  const { scene } = useGLTF("/models/earth.glb");
  const earthRef = useRef();

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0015;
  });

  return (
    <primitive
      ref={earthRef}
      object={scene}
      scale={[scaleX, scaleY, scaleZ]}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, -40, 0]}
    />
  );
}
