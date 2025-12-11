import { useState, useRef, useMemo, useEffect } from "react";
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
    // Adjusted spread for better mobile visibility
    const startX = (Math.random() - 0.5) * 40;
    const startY = (Math.random() - 0.5) * 30;
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

function Earth({ scale }) {
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
      <primitive object={scene} scale={scale} position={[0, 0, 0]} />
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
  const [isMobile, setIsMobile] = useState(false);

  const [playImpact] = useSound(impactSfx, { volume: 1 });

  const asteroidModels = [
    "/models/asteroids/a1.stl",
    "/models/asteroids/a2.stl",
    "/models/asteroids/a3.stl",
    "/models/asteroids/a4.stl",
    "/models/asteroids/a5.stl",
    "/models/asteroids/a6.stl",
  ];

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <div className="relative h-screen w-screen bg-black text-white overflow-hidden">
      {/* --- Home Button --- */}
      <div className="absolute top-4 right-4 z-50">
        <Link
          to="/"
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded shadow-lg text-sm md:text-base transition-colors"
        >
          Home
        </Link>
      </div>

      {/* --- Controls Panel (Launch) --- */}
      {!selectedAsteroid && (
        <div
          className={`
            absolute z-40 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl transition-all duration-300
            /* Mobile: Bottom Center */
            bottom-8 left-4 right-4 
            /* Desktop: Top Left */
            md:bottom-auto md:right-auto md:top-6 md:left-6 md:w-80
          `}
        >
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 font-medium">Diameter</span>
              <span className="text-blue-400 font-bold">
                {size.toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={size}
              onChange={(e) => setSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5km</span>
              <span>10km</span>
            </div>
          </div>

          <button
            className="w-full py-3 md:py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] active:scale-95 transition-all duration-200"
            onClick={launchAsteroid}
          >
            Launch Asteroid
          </button>
        </div>
      )}

      {/* --- 3D Scene --- */}
      <div className="absolute inset-0 z-0">
        <Canvas
          // Pull camera back on mobile (55) vs desktop (40) so Earth fits
          camera={{ position: [0, 0, isMobile ? 55 : 40], fov: 60 }}
        >
          <Stars count={3000} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <CameraManager shake={cameraShake} />
          {/* Scale Earth slightly smaller on mobile to allow room for UI */}
          <Earth scale={isMobile ? 8 : 10} />
          {impactPoint && <ImpactExplosion position={impactPoint} />}
          {selectedAsteroid && !impact && (
            <Asteroid3D
              modelUrl={selectedAsteroid.modelUrl}
              onReachEarth={handleImpact}
            />
          )}
        </Canvas>
      </div>

      {/* --- Impact Results Panel --- */}
      {impact && impactData && (
        <div
          className={`
            absolute z-50 bg-gray-900/95 backdrop-blur-lg border border-red-500/30 shadow-2xl overflow-hidden
            /* Mobile: Bottom Sheet slide-up */
            bottom-0 left-0 w-full rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-500
            /* Desktop: Floating Card on Right */
            md:bottom-auto md:left-auto md:right-8 md:top-1/2 md:-translate-y-1/2 md:w-80 md:rounded-2xl md:p-6
          `}
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
              Impact Confirmed!
            </h2>
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mt-2"></div>
          </div>

          <div className="space-y-3 text-sm md:text-base text-gray-200">
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Object</span>
              <span>{impactData.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Coordinates</span>
              <span>
                {impactData.x}, {impactData.y}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Diameter</span>
              <span>{impactData.diameter} km</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Est. Energy</span>
              <span className="text-yellow-400 font-mono">
                {impactData.energy} TJ
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Destruction Radius</span>
              <span className="text-red-400 font-mono">
                {impactData.radius} km²
              </span>
            </div>
          </div>

          <button
            className="w-full mt-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition-colors shadow-lg shadow-red-900/40"
            onClick={resetSimulation}
          >
            Reset Simulation
          </button>
        </div>
      )}
    </div>
  );
}
