import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import BackgroundStars2 from "../components/BackgroundStars2";
import AsteroidCardsGrid from "../components/ui/AsteroidCardsGrid";
import AsteroidCard from "../components/ui/AsteroidCard";
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

  const asteroidModels = [
    "/models/asteroids/a1.stl",
    "/models/asteroids/a2.stl",
    "/models/asteroids/a3.stl",
    "/models/asteroids/a4.stl",
    "/models/asteroids/a5.stl",
    "/models/asteroids/a6.stl",
  ];

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
    <div className="relative h-screen w-screen overflow-hidden text-white">
      <BackgroundStars2 />

      <Link
        to="/"
        className="absolute top-5 right-5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded shadow-lg z-50"
      >
        Home
      </Link>

      {!selected && !showModal && !selectedForPreview && (
        <AsteroidCardsGrid
          asteroids={asteroidsForToday}
          onSelect={handleSelect}
          onViewMore={handleViewMore}
        />
      )}

      <Canvas
        camera={{ position: [0, 0, 40], fov: 60 }}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} />
        <Earth scaleX={20} scaleY={5} scaleZ={20} />
      </Canvas>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="asteroidPanel"
            className="absolute inset-0 flex z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={handleGoBack}
              className="absolute top-5 left-5 px-4 py-2 bg-gray-800 rounded shadow hover:bg-gray-700 transition z-40"
            >
              Go Back
            </button>

            <motion.div
              className="flex-1 flex items-center justify-center"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={1.8} />
                <directionalLight position={[5, 5, 5]} intensity={2.2} />
                {selectedModel && (
                  <RotatingAsteroid modelUrl={selectedModel} scale={0.8} />
                )}
              </Canvas>
            </motion.div>

            <motion.div
              className="flex-1 p-10 bg-black/70 overflow-auto"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">{selected.name}</h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>NEO Reference ID: {selected.id}</p>
                <p>
                  Relative velocity km/h:{" "}
                  {
                    selected.close_approach_data[0]?.relative_velocity
                      .kilometers_per_hour
                  }
                </p>
                <p>
                  Relative velocity km/s:{" "}
                  {
                    selected.close_approach_data[0]?.relative_velocity
                      .kilometers_per_second
                  }
                </p>
                <p>
                  Earth miss distance km:{" "}
                  {selected.close_approach_data[0]?.miss_distance.kilometers}
                </p>
                <p>
                  Earth miss distance lunar:{" "}
                  {selected.close_approach_data[0]?.miss_distance.lunar}
                </p>
                <p>
                  Earth miss distance AU:{" "}
                  {selected.close_approach_data[0]?.miss_distance.astronomical}
                </p>
                <p>
                  Estimated diameter:{" "}
                  {selected.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                    2
                  )}{" "}
                  -{" "}
                  {selected.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                    2
                  )}{" "}
                  km
                </p>
                <p>
                  Is potential hazardous:{" "}
                  {selected.is_potentially_hazardous_asteroid ? "Yes" : "No"}
                </p>
                <p>
                  Earth closest approach date:{" "}
                  {selected.close_approach_data[0]?.close_approach_date}
                </p>
                <p>
                  Earth closest approach date full:{" "}
                  {selected.close_approach_data[0]?.close_approach_date_full}
                </p>
                <p>
                  First observation date:{" "}
                  {selected.orbital_data?.first_observation_date}
                </p>
                <p>
                  Orbital period: {selected.orbital_data?.orbital_period} days
                </p>
                <p>
                  Orbit class type:{" "}
                  {selected.orbital_data?.orbit_class?.orbit_class_type}
                </p>
                <p>
                  Orbit class description:{" "}
                  {selected.orbital_data?.orbit_class?.orbit_class_description}
                </p>
                <p>
                  More info by NASA JPL:{" "}
                  <a
                    href={selected.nasa_jpl_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-400"
                  >
                    Link
                  </a>
                </p>
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
