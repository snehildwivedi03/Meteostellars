import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import BackgroundStars2 from "../components/BackgroundStars2";
import AsteroidCardsGrid from "../components/ui/AsteroidCardsGrid";
import AsteroidModal from "../components/modals/AsteroidModal";
import AsteroidPreviewModal from "../components/modals/AsteroidPreviewModal";
import Earth from "../components/three/Earth";
import RotatingAsteroid from "../components/three/RotatingAsteroid";

export default function AsteroidView() {
  const [neosData, setNeosData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedForPreview, setSelectedForPreview] = useState(null);
  const [asteroidsForToday, setAsteroidsForToday] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Helper state to determine screen size for 3D scaling adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const asteroidModels = [
    "/models/asteroids/a1.stl",
    "/models/asteroids/a2.stl",
    "/models/asteroids/a3.stl",
    "/models/asteroids/a4.stl",
    "/models/asteroids/a5.stl",
    "/models/asteroids/a6.stl",
  ];

  // Handle Resize for logic variables
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch today's NEOs
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const fetchNeos = async () => {
      try {
        const res = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${
            import.meta.env.VITE_NASA_API_KEY
          }`
        );
        if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
        const data = await res.json();
        const asteroids = data.near_earth_objects[today] || [];
        const asteroidsWithImages = asteroids.map((a, i) => ({
          ...a,
          image: `/images/${(i % 12) + 1}.png`,
        }));
        setNeosData({ [today]: asteroidsWithImages });
      } catch (err) {
        console.error("Error fetching asteroids:", err);
      }
    };
    fetchNeos();
  }, []);

  useEffect(() => {
    if (!neosData) return;
    const today = new Date().toISOString().split("T")[0];
    setAsteroidsForToday(neosData[today] || []);
  }, [neosData]);

  // Handlers
  const handleGoBack = () => setSelected(null);
  const handleViewMore = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSelect = (asteroid) => {
    setSelectedForPreview(asteroid);
    setSelected(null);
  };
  const handleClosePreviewModal = () => setSelectedForPreview(null);
  const handleViewDetails = async (asteroid) => {
    setLoadingDetails(true);
    setSelectedForPreview(null);
    try {
      const res = await fetch(
        `https://api.nasa.gov/neo/rest/v1/neo/${asteroid.id}?api_key=${
          import.meta.env.VITE_NASA_API_KEY
        }`
      );
      if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
      const fullData = await res.json();
      setSelected(fullData);
      const randomIndex = Math.floor(Math.random() * asteroidModels.length);
      setSelectedModel(asteroidModels[randomIndex]);
    } catch (err) {
      console.error("Error fetching asteroid details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white bg-black">
      <BackgroundStars2 />

      {/* Responsive Home Button */}
      <Link
        to="/"
        className="absolute top-4 right-4 md:top-5 md:right-5 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-500 rounded shadow-lg z-50 text-sm md:text-base transition-colors"
      >
        Home
      </Link>

      {!selected && !showModal && !selectedForPreview && (
        <div className="h-full w-full overflow-y-auto">
          <AsteroidCardsGrid
            asteroids={asteroidsForToday}
            onSelect={handleSelect}
            onViewMore={handleViewMore}
          />
        </div>
      )}

      {/* Earth Background Canvas */}
      {/* Logic: We adjust the camera position or scale slightly based on device to ensure Earth doesn't overwhelm the screen on mobile */}
      <Canvas
        camera={{ position: [0, 0, isMobile ? 50 : 40], fov: 60 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} />
        <Earth
          scaleX={isMobile ? 15 : 20}
          scaleY={isMobile ? 3 : 5}
          scaleZ={isMobile ? 15 : 20}
        />
      </Canvas>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="asteroidPanel"
            className="absolute inset-0 flex flex-col md:flex-row z-30 bg-black/40 backdrop-blur-sm md:backdrop-blur-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Go Back Button - Positioned absolute relative to container */}
            <button
              onClick={handleGoBack}
              className="absolute top-4 left-4 md:top-5 md:left-5 px-3 py-1.5 md:px-4 md:py-2 bg-gray-800/80 rounded shadow hover:bg-gray-700 transition z-50 text-sm md:text-base border border-gray-600"
            >
              ← Go Back
            </button>

            {/* Left Side (Desktop) / Top Side (Mobile): 3D Model */}
            <motion.div
              className="relative w-full h-[40vh] md:h-full md:flex-1 flex items-center justify-center"
              initial={{ x: isMobile ? 0 : "-100%", y: isMobile ? "-50%" : 0 }}
              animate={{ x: 0, y: 0 }}
              exit={{ x: isMobile ? 0 : "-100%", y: isMobile ? "-50%" : 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={1.8} />
                <directionalLight position={[5, 5, 5]} intensity={2.2} />
                {selectedModel && (
                  <RotatingAsteroid
                    modelUrl={selectedModel}
                    scale={isMobile ? 0.6 : 0.8}
                  />
                )}
              </Canvas>
            </motion.div>

            {/* Right Side (Desktop) / Bottom Side (Mobile): Info Panel */}
            <motion.div
              className="flex-1 w-full bg-black/80 md:bg-black/70 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-700/50"
              initial={{
                opacity: 0,
                x: isMobile ? 0 : 50,
                y: isMobile ? 50 : 0,
              }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 50 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6 md:p-10 pb-20 md:pb-10">
                <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {selected.name}
                </h2>

                <div className="space-y-3 md:space-y-4 text-base md:text-lg leading-relaxed text-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    <DataPoint label="NEO Reference ID" value={selected.id} />
                    <DataPoint
                      label="Hazardous"
                      value={
                        selected.is_potentially_hazardous_asteroid
                          ? "⚠️ Yes"
                          : "No"
                      }
                      highlight={selected.is_potentially_hazardous_asteroid}
                    />
                  </div>

                  <hr className="border-gray-700 my-4" />

                  <h3 className="text-xl font-semibold text-blue-300 mt-4 mb-2">
                    Close Approach Data
                  </h3>
                  <DataPoint
                    label="Velocity (km/h)"
                    value={parseFloat(
                      selected.close_approach_data[0]?.relative_velocity
                        .kilometers_per_hour
                    ).toLocaleString()}
                  />
                  <DataPoint
                    label="Velocity (km/s)"
                    value={parseFloat(
                      selected.close_approach_data[0]?.relative_velocity
                        .kilometers_per_second
                    ).toFixed(2)}
                  />
                  <DataPoint
                    label="Miss Distance (km)"
                    value={parseFloat(
                      selected.close_approach_data[0]?.miss_distance.kilometers
                    ).toLocaleString()}
                  />
                  <DataPoint
                    label="Miss Distance (AU)"
                    value={parseFloat(
                      selected.close_approach_data[0]?.miss_distance
                        .astronomical
                    ).toFixed(4)}
                  />
                  <DataPoint
                    label="Approach Date"
                    value={
                      selected.close_approach_data[0]?.close_approach_date_full
                    }
                  />

                  <hr className="border-gray-700 my-4" />

                  <h3 className="text-xl font-semibold text-purple-300 mt-4 mb-2">
                    Physical Specs
                  </h3>
                  <DataPoint
                    label="Est. Diameter"
                    value={`${selected.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                      3
                    )} - ${selected.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                      3
                    )} km`}
                  />
                  <DataPoint
                    label="Orbital Period"
                    value={`${selected.orbital_data?.orbital_period} days`}
                  />
                  <DataPoint
                    label="Orbit Class"
                    value={`${selected.orbital_data?.orbit_class?.orbit_class_type} (${selected.orbital_data?.orbit_class?.orbit_class_description})`}
                  />

                  <div className="pt-6">
                    <a
                      href={selected.nasa_jpl_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors w-full md:w-auto text-center"
                    >
                      View Official NASA Data
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && (
        <AsteroidModal
          asteroids={asteroidsForToday}
          onClose={handleCloseModal}
          onSelect={handleSelect}
        />
      )}

      <AsteroidPreviewModal
        asteroid={selectedForPreview}
        onClose={handleClosePreviewModal}
        onViewMore={handleViewDetails}
        loading={loadingDetails}
      />
    </div>
  );
}

// Simple Helper Component for neat data display
function DataPoint({ label, value, highlight = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-gray-800 pb-1">
      <span className="text-gray-400 text-sm md:text-base">{label}:</span>
      <span
        className={`font-medium ${
          highlight ? "text-red-500 font-bold" : "text-gray-100"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
