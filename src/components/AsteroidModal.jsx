// src/components/AsteroidModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AsteroidModal({ asteroids, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {asteroids && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex justify-center items-start overflow-auto p-10 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {asteroids.map((a, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg p-3 text-white cursor-pointer hover:scale-105 transition"
                onClick={() => {
                  onSelect(a);
                  onClose();
                }}
              >
                <h4 className="font-bold text-lg">{a.name}</h4>
                <p className="text-gray-400 text-sm mt-1">
                  {a.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                    2
                  )}{" "}
                  -{" "}
                  {a.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                    2
                  )}{" "}
                  km
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded shadow"
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
