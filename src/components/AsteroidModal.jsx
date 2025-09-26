// src/components/AsteroidModal.jsx
import React, { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import Asteroid3D from "./Asteroid3D";

export default function AsteroidModal({ asteroid, onClose }) {
  // Select a model based on asteroid ID (simple hash to pick a1-a6)
  const modelIndex = (parseInt(asteroid.id.slice(-1), 36) % 6) + 1;
  const modelUrl = `/models/asteroids/a${modelIndex}.stl`;

  return (
    <AnimatePresence>
      {asteroid && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-6 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-gray-900 rounded-xl flex flex-col md:flex-row w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Left: 3D Model */}
            <div className="w-full md:w-1/2 h-96 md:h-auto bg-black flex items-center justify-center p-4">
              <Canvas>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Suspense fallback={null}>
                  <Asteroid3D modelUrl={modelUrl} scale={0.5} />
                </Suspense>
              </Canvas>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto text-white">
              <h2 className="text-3xl font-bold mb-4">{asteroid.name}</h2>
              <p className="text-gray-300">NEO Reference ID: {asteroid.id}</p>
              <p className="text-gray-300">
                Relative velocity km/h:{" "}
                {
                  asteroid.close_approach_data[0]?.relative_velocity
                    .kilometers_per_hour
                }
              </p>
              <p className="text-gray-300">
                Relative velocity km/s:{" "}
                {
                  asteroid.close_approach_data[0]?.relative_velocity
                    .kilometers_per_second
                }
              </p>
              <p className="text-gray-300">
                Earth miss distance km:{" "}
                {asteroid.close_approach_data[0]?.miss_distance.kilometers}
              </p>
              <p className="text-gray-300">
                Earth miss distance lunar:{" "}
                {asteroid.close_approach_data[0]?.miss_distance.lunar}
              </p>
              <p className="text-gray-300">
                Earth miss distance AU:{" "}
                {asteroid.close_approach_data[0]?.miss_distance.astronomical}
              </p>
              <p className="text-gray-300">
                Estimated diameter:{" "}
                {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                  2
                )}{" "}
                -{" "}
                {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                  2
                )}{" "}
                km
              </p>
              <p className="text-gray-300">
                Is potential hazardous:{" "}
                {asteroid.is_potentially_hazardous_asteroid ? "Yes" : "No"}
              </p>
              <p className="text-gray-300">
                Earth closest approach date:{" "}
                {asteroid.close_approach_data[0]?.close_approach_date}
              </p>
              <p className="text-gray-300">
                Earth closest approach date full:{" "}
                {asteroid.close_approach_data[0]?.close_approach_date_full}
              </p>
              <p className="text-gray-300">
                First observation date:{" "}
                {asteroid.orbital_data?.first_observation_date}
              </p>
              <p className="text-gray-300">
                Orbital period: {asteroid.orbital_data?.orbital_period} days
              </p>
              <p className="text-gray-300">
                Orbit class type:{" "}
                {asteroid.orbital_data?.orbit_class?.orbit_class_type}
              </p>
              <p className="text-gray-300">
                Orbit class description:{" "}
                {asteroid.orbital_data?.orbit_class?.orbit_class_description}
              </p>
              <p className="text-gray-300">
                More info by NASA JPL:{" "}
                <a
                  href={asteroid.nasa_jpl_url}
                  target="_blank"
                  className="underline"
                >
                  Link
                </a>
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded shadow"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
