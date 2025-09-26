// src/components/Asteroid3D.jsx
import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

export default function Asteroid3D({
  modelUrl,
  position,
  scale = 0.5,
  onReachEarth,
}) {
  const geometry = useLoader(STLLoader, modelUrl);
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;

    // Rotate asteroid
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;

    // Move asteroid toward Earth (Z-axis)
    ref.current.position.z -= 0.2;

    // Trigger callback when hitting Earth
    if (ref.current.position.z <= 0) {
      onReachEarth && onReachEarth();
    }
  });

  return (
    <mesh ref={ref} geometry={geometry} position={position} scale={scale}>
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}
