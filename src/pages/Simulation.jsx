import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { Link } from "react-router-dom";
import useSound from "use-sound";
import impactSfx from "../assets/audio/sound.mp3";

extend({ STLLoader });

function Stars({ count = 5000 }) {
  const starGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++)
      positions[i] = (Math.random() - 0.5) * 2000;
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count]);

  return (
    <points geometry={starGeo}>
      <pointsMaterial color="white" size={0.7} sizeAttenuation />
    </points>
  );
}

function Asteroid3D({ modelUrl, onReachEarth }) {
  const geom = useLoader(STLLoader, modelUrl);
  const asteroidRef = useRef();
  const clock = useRef(new THREE.Clock());
  const [hasImpacted, setHasImpacted] = useState(false);

  const path = useMemo(() => {
    const startX = (Math.random() - 0.5) * 60;
    const startY = (Math.random() - 0.5) * 40;
    const start = new THREE.Vector3(startX, startY, 50);
    const middle = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      25
    );
    const end = new THREE.Vector3(0, 0, 10.5);
    return new THREE.CatmullRomCurve3([start, middle, end]);
  }, [modelUrl]);

  useFrame(() => {
    if (!asteroidRef.current || hasImpacted) return;
    const elapsedTime = clock.current.getElapsedTime();
    const progress = Math.min(elapsedTime / 4, 1);
    const newPos = path.getPointAt(progress);
    asteroidRef.current.position.copy(newPos);
    const tangent = path.getTangentAt(progress);
    asteroidRef.current.lookAt(newPos.clone().add(tangent));
    asteroidRef.current.rotation.z += 0.02;
    asteroidRef.current.rotation.x += 0.01;

    if (progress >= 1) {
      setHasImpacted(true);
      onReachEarth(asteroidRef.current.position);
    }
  });

  return (
    <mesh ref={asteroidRef} scale={0.8}>
      <primitive object={geom} attach="geometry" />
      <meshStandardMaterial color="#888" roughness={0.9} metalness={0.5} />
    </mesh>
  );
}

function ImpactExplosion({ position }) {
  const meshRef = useRef();
  const clock = useRef(new THREE.Clock());

  useFrame(() => {
    if (!meshRef.current) return;
    const t = clock.current.getElapsedTime();
    meshRef.current.scale.setScalar(1 + t * 5);
    meshRef.current.material.opacity = Math.max(0, 1 - t * 1.5);
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

function Earth() {
  const { scene } = useGLTF("/models/earth.glb");
  const groupRef = useRef();
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    isDragging.current = true;
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerUp = (e) => {
    e.stopPropagation();
    isDragging.current = false;
  };
  const handlePointerOut = (e) => {
    e.stopPropagation();
    isDragging.current = false;
  };
  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (isDragging.current) {
      const deltaX = e.clientX - previousMouse.current.x;
      groupRef.current.rotation.y += deltaX * 0.005;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    }
  };

  useFrame(() => {
    if (groupRef.current && !isDragging.current)
      groupRef.current.rotation.y += 0.001;
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <primitive object={scene} scale={10} position={[0, 0, 0]} />
    </group>
  );
}

function CameraManager({ shake }) {
  useFrame(({ camera }) => {
    if (shake) {
      camera.position.x += (Math.random() - 0.5) * 0.4;
      camera.position.y += (Math.random() - 0.5) * 0.4;
    }
  });
  return null;
}

export default function Simulation() {
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [impact, setImpact] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [impactPoint, setImpactPoint] = useState(null);
  const [cameraShake, setCameraShake] = useState(false);
  const [size, setSize] = useState(1.0);

  const [playImpact] = useSound(impactSfx, { volume: 1 });

  const asteroidModels = [
    "/models/asteroids/a1.stl",
    "/models/asteroids/a2.stl",
    "/models/asteroids/a3.stl",
    "/models/asteroids/a4.stl",
    "/models/asteroids/a5.stl",
    "/models/asteroids/a6.stl",
  ];

  const handleImpact = (finalPosition) => {
    if (impact) return;
    setImpact(true);
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 500);
    playImpact();
    setImpactPoint(finalPosition.clone());
    const lat = Math.random() * 180 - 90;
    const lon = Math.random() * 360 - 180;
    setImpactData({
      name: selectedAsteroid.name,
      x: lat.toFixed(2),
      y: lon.toFixed(2),
      energy: (size * 5000).toFixed(0),
      radius: (size * 10).toFixed(0),
      diameter: size,
    });
  };

  const launchAsteroid = () => {
    const modelUrl =
      asteroidModels[Math.floor(Math.random() * asteroidModels.length)];
    setSelectedAsteroid({
      name: `Asteroid ${modelUrl.slice(-6, -4).toUpperCase()}`,
      diameter: size,
      modelUrl: modelUrl,
    });
  };

  const resetSimulation = () => {
    setImpact(false);
    setImpactData(null);
    setImpactPoint(null);
    setSelectedAsteroid(null);
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col">
      <div className="absolute top-5 right-5 z-20">
        <Link
          to="/"
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded shadow-lg"
        >
          Home
        </Link>
      </div>

      {!selectedAsteroid && (
        <div className="absolute top-5 left-5 z-20 flex flex-col gap-3 bg-gray-900/70 p-4 rounded-lg">
          <label className="flex flex-col">
            <span className="mb-1">Select Asteroid Diameter (km)</span>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={size}
              onChange={(e) => setSize(parseFloat(e.target.value))}
            />
            <span className="text-sm mt-1">{size.toFixed(1)} km</span>
          </label>
          <button
            className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg shadow-[0_0_15px_#3b82f6] hover:shadow-[0_0_30px_#3b82f6] transition-all duration-300 transform hover:scale-105"
            onClick={launchAsteroid}
          >
            Launch Asteroid
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        <Canvas camera={{ position: [0, 0, 40], fov: 60 }} className="flex-1">
          <Stars count={3000} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <CameraManager shake={cameraShake} />
          <Earth />
          {impactPoint && <ImpactExplosion position={impactPoint} />}
          {selectedAsteroid && !impact && (
            <Asteroid3D
              modelUrl={selectedAsteroid.modelUrl}
              onReachEarth={handleImpact}
            />
          )}
        </Canvas>

        {impact && impactData && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 w-80 bg-gray-900/80 backdrop-blur-sm p-6 rounded shadow-lg flex flex-col gap-3">
            <h2 className="text-xl font-bold text-red-400">
              {impactData.name} Impacted Earth!
            </h2>
            <p>
              <span className="font-semibold">Coordinates:</span> {impactData.x}
              ° Lat, {impactData.y}° Long
            </p>
            <p>
              <span className="font-semibold">Diameter:</span>{" "}
              {impactData.diameter} km
            </p>
            <p>
              <span className="font-semibold">Energy:</span> {impactData.energy}{" "}
              TJ
            </p>
            <p>
              <span className="font-semibold">Impact Area:</span>{" "}
              {impactData.radius} km²
            </p>
            <button
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
              onClick={resetSimulation}
            >
              Reset Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
