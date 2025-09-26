// src/components/AsteroidCards.jsx
import React from "react";

export default function AsteroidCards({ asteroids, onSelect }) {
  // Show only first 12 asteroids
  const displayed = asteroids.slice(0, 12);

  return (
    <div className="absolute top-10 left-0 w-full px-10 z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {displayed.map((a, i) => (
        <div
          key={i}
          className="w-full h-48 rounded-xl bg-gradient-to-b from-gray-800 to-black text-white flex flex-col justify-center items-center cursor-pointer shadow-lg hover:scale-105 transition"
          onClick={() => onSelect(a)}
        >
          <h3 className="font-bold text-lg">{a.name}</h3>
          <p className="text-gray-400 text-sm mt-1">
            {a.estimated_diameter.kilometers.estimated_diameter_min.toFixed(2)}{" "}
            -{" "}
            {a.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)}{" "}
            km
          </p>
        </div>
      ))}
    </div>
  );
}
