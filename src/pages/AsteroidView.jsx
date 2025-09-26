// src/pages/AsteroidView.jsx
import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import BackgroundStars from "../components/BackgroundStars";
import { fetchNEOsSaga } from "../redux/actionCreators";

// Earth 3D component
function Earth({ scaleX = 20, scaleY = 5, scaleZ = 20 }) {
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

// Single asteroid card
function AsteroidCard({ asteroid, onSelect }) {
  return (
    <div
      className="w-40 h-56 rounded-xl bg-gradient-to-b from-gray-800 to-black text-white flex flex-col justify-center items-center cursor-pointer shadow-lg hover:scale-105 transition"
      onClick={() => onSelect(asteroid)}
    >
      <h3 className="font-bold text-lg text-center">{asteroid.name}</h3>
      <p className="text-gray-400 text-sm mt-2 text-center">
        {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
          2
        )}{" "}
        -{" "}
        {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
          2
        )}{" "}
        km
      </p>
    </div>
  );
}

// Grid for 12 cards
function AsteroidCardsGrid({ asteroids, onSelect, onViewMore }) {
  const left = asteroids.slice(0, 6);
  const right = asteroids.slice(6, 12);

  return (
    <>
      <div className="absolute top-20 left-10 grid grid-cols-3 gap-4 z-10">
        {left.map((a, i) => (
          <AsteroidCard key={i} asteroid={a} onSelect={onSelect} />
        ))}
      </div>
      <div className="absolute top-20 right-10 grid grid-cols-3 gap-4 z-10">
        {right.map((a, i) => (
          <AsteroidCard key={i} asteroid={a} onSelect={onSelect} />
        ))}
      </div>
      {asteroids.length > 12 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <button
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded text-white shadow-lg"
            onClick={onViewMore}
          >
            View More Asteroids
          </button>
        </div>
      )}
    </>
  );
}

// Modal for viewing all asteroids
function AsteroidModal({ asteroids, onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">All Asteroids</h2>
          <button
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {asteroids.map((a, i) => (
            <AsteroidCard key={i} asteroid={a} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main component
export default function AsteroidView() {
  const dispatch = useDispatch();
  const neosData = useSelector((state) => state.neosDetail.near_earth_objects);
  const [selected, setSelected] = useState(null);
  const [asteroidsForToday, setAsteroidsForToday] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    dispatch(fetchNEOsSaga(today));
  }, [dispatch]);

  useEffect(() => {
    if (!neosData) return;
    const today = new Date().toISOString().split("T")[0];
    setAsteroidsForToday(neosData[today] || []);
  }, [neosData]);

  const handleGoBack = () => setSelected(null);
  const handleViewMore = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <BackgroundStars />

      {!selected && !showModal && (
        <AsteroidCardsGrid
          asteroids={asteroidsForToday}
          onSelect={setSelected}
          onViewMore={handleViewMore}
        />
      )}

      <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.8} />
        <Earth scaleX={20} scaleY={5} scaleZ={20} />
      </Canvas>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="asteroidPanel"
            className="absolute inset-0 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={handleGoBack}
              className="absolute top-5 left-5 px-4 py-2 bg-gray-800 rounded shadow hover:bg-gray-700 transition z-20"
            >
              Go Back
            </button>
            <motion.div
              className="flex-1 flex items-center justify-center"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="w-64 h-64 bg-gray-800 rounded-full flex items-center justify-center text-5xl">
                🪨
              </div>
            </motion.div>
            <motion.div
              className="flex-1 p-10 bg-black/70 overflow-auto"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">{selected.name}</h2>
              <p className="text-gray-300">NEO Reference ID: {selected.id}</p>
              <p className="text-gray-300">
                Relative velocity km/h:{" "}
                {
                  selected.close_approach_data[0]?.relative_velocity
                    .kilometers_per_hour
                }
              </p>
              <p className="text-gray-300">
                Relative velocity km/s:{" "}
                {
                  selected.close_approach_data[0]?.relative_velocity
                    .kilometers_per_second
                }
              </p>
              <p className="text-gray-300">
                Earth miss distance km:{" "}
                {selected.close_approach_data[0]?.miss_distance.kilometers}
              </p>
              <p className="text-gray-300">
                Earth miss distance lunar:{" "}
                {selected.close_approach_data[0]?.miss_distance.lunar}
              </p>
              <p className="text-gray-300">
                Earth miss distance AU:{" "}
                {selected.close_approach_data[0]?.miss_distance.astronomical}
              </p>
              <p className="text-gray-300">
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
              <p className="text-gray-300">
                Is potential hazardous:{" "}
                {selected.is_potentially_hazardous_asteroid ? "Yes" : "No"}
              </p>
              <p className="text-gray-300">
                Earth closest approach date:{" "}
                {selected.close_approach_data[0]?.close_approach_date}
              </p>
              <p className="text-gray-300">
                Earth closest approach date full:{" "}
                {selected.close_approach_data[0]?.close_approach_date_full}
              </p>
              <p className="text-gray-300">
                First observation date:{" "}
                {selected.orbital_data?.first_observation_date}
              </p>
              <p className="text-gray-300">
                Orbital period: {selected.orbital_data?.orbital_period} days
              </p>
              <p className="text-gray-300">
                Orbit class type:{" "}
                {selected.orbital_data?.orbit_class?.orbit_class_type}
              </p>
              <p className="text-gray-300">
                Orbit class description:{" "}
                {selected.orbital_data?.orbit_class?.orbit_class_description}
              </p>
              <p className="text-gray-300">
                More info by NASA JPL:{" "}
                <a
                  href={selected.nasa_jpl_url}
                  target="_blank"
                  className="underline"
                >
                  Link
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for all asteroids */}
      {showModal && (
        <AsteroidModal
          asteroids={asteroidsForToday}
          onClose={handleCloseModal}
          onSelect={(a) => {
            setSelected(a);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
