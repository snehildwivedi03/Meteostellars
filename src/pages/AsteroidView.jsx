import { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import BackgroundStars from "../components/BackgroundStars";

// Earth component
function Earth({ scaleX = 20, scaleY = 5, scaleZ = 20 }) {
  const { scene } = useGLTF("/models/earth.glb");
  const ref = useRef();

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0015;
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={[scaleX, scaleY, scaleZ]}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, -40, 0]}
    />
  );
}

// Space flight animation
function SpaceFlight({ onComplete }) {
  const progress = useRef(0);

  useFrame((state, delta) => {
    const cam = state.camera;
    if (progress.current < 1) {
      progress.current += delta * 0.8;
      cam.position.z = 40 - 50 * progress.current;
      cam.position.y = 0;
    } else {
      onComplete();
    }
  });

  return <Earth scaleX={20} scaleY={5} scaleZ={20} />;
}

// Asteroid cards (outside Canvas)
function AsteroidCards({ onSelect }) {
  const asteroids = Array.from({ length: 12 }, (_, i) => `Asteroid ${i + 1}`);

  return (
    <div className="absolute top-10 w-full flex justify-between px-10 z-10">
      <div className="grid grid-cols-3 gap-6">
        {asteroids.slice(0, 6).map((a, i) => (
          <div
            key={i}
            className="w-40 h-56 rounded-xl bg-gradient-to-b from-gray-800 to-black text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition"
            onClick={() => onSelect(a)}
          >
            {a}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {asteroids.slice(6).map((a, i) => (
          <div
            key={i}
            className="w-40 h-56 rounded-xl bg-gradient-to-b from-gray-800 to-black text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition"
            onClick={() => onSelect(a)}
          >
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main component
export default function AsteroidView() {
  const [selected, setSelected] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleFlightComplete = () => setShowInfo(true);
  const handleGoBack = () => {
    setSelected(null);
    setShowInfo(false);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      {/* HTML content outside Canvas */}
      {!selected && <AsteroidCards onSelect={setSelected} />}

      {/* Canvas with Earth & stars */}
      <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.8} />
        <BackgroundStars />

        {!selected && <Earth />}
        {selected && !showInfo && (
          <SpaceFlight onComplete={handleFlightComplete} />
        )}
      </Canvas>

      {/* Asteroid info panel */}
      {selected && showInfo && (
        <div className="absolute inset-0 flex flex-col">
          <button
            onClick={handleGoBack}
            className="absolute top-5 left-5 px-4 py-2 bg-gray-800 rounded shadow hover:bg-gray-700 z-20"
          >
            Go Back
          </button>
          <div className="flex flex-1">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-64 h-64 bg-gray-800 rounded-full flex items-center justify-center text-5xl">
                🪨
              </div>
            </div>
            <div className="flex-1 p-10 bg-black/70">
              <h2 className="text-3xl font-bold mb-4">{selected}</h2>
              <p className="text-gray-300">
                Detailed asteroid data will appear here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
