// src/components/ViewMoreButton.jsx
import React from "react";

export default function ViewMoreButton({ onClick }) {
  return (
    <div className="absolute bottom-10 w-full flex justify-center z-20">
      <button
        onClick={onClick}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow"
      >
        View More Asteroids
      </button>
    </div>
  );
}
