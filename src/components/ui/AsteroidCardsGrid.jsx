import React from "react";
import AsteroidCard from "./AsteroidCard";

export default function AsteroidCardsGrid({ asteroids, onSelect, onViewMore }) {
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

      {asteroids.length > 0 && (
        <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 z-20">
          <button
            className="px-8 py-3 font-bold text-white 
                       bg-gradient-to-r from-blue-500 to-purple-600 
                       shadow-[0_0_20px_#00c8ff] 
                       hover:scale-105 hover:shadow-[0_0_40px_#00c8ff] 
                       transition transform duration-300 rounded-lg"
            onClick={onViewMore}
          >
            View More Asteroids
          </button>
        </div>
      )}
    </>
  );
}
