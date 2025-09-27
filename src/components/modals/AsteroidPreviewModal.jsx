import { motion, AnimatePresence } from "framer-motion";

export default function AsteroidPreviewModal({
  asteroid,
  onClose,
  onViewMore,
  loading,
}) {
  if (!asteroid) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-900 rounded-xl p-6 max-w-md w-full text-white"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Title */}
          <h2 className="text-2xl font-bold mb-4">{asteroid.name}</h2>

          {/* Basic Info */}
          <p>
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
          <p>
            Potentially hazardous:{" "}
            {asteroid.is_potentially_hazardous_asteroid ? "Yes" : "No"}
          </p>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded shadow"
            >
              Close
            </button>
            <button
              onClick={() => onViewMore(asteroid)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow"
              disabled={loading}
            >
              {loading ? "Loading..." : "View More Info"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
