// src/components/three/RotatingAsteroid.jsx
import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

export default function RotatingAsteroid({ modelUrl, scale = 0.8 }) {
  const geom = useLoader(STLLoader, modelUrl);
  const asteroidRef = useRef();

  useFrame((_, delta) => {
    if (asteroidRef.current) {
      asteroidRef.current.rotation.y += delta * 0.2;
      asteroidRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <mesh ref={asteroidRef} scale={scale}>
      <primitive object={geom} attach="geometry" />
      <meshStandardMaterial color="#888" roughness={0.9} metalness={0.5} />
    </mesh>
  );
}
