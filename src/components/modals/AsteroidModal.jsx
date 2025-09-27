import AsteroidCard from "../ui/AsteroidCard";

export default function AsteroidModal({ asteroids, onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">All Asteroids</h2>
          <button
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Asteroids Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {asteroids.map((asteroid) => (
            <AsteroidCard
              key={asteroid.id}
              asteroid={asteroid}
              onClick={(selectedAsteroid) => {
                onSelect(selectedAsteroid);
                onClose(); // close modal after selection
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
