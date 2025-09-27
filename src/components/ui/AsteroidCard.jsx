import React from "react";
import { Card, CardContent } from "./Card";

export default function AsteroidCard({ asteroid, onSelect }) {
  return (
    <Card
      className="w-40 h-56 cursor-pointer flex flex-col justify-center items-center
                 text-white bg-gradient-to-b from-gray-700 to-gray-900 hover:scale-105 transition"
      onClick={() => onSelect(asteroid)}
    >
      {asteroid.image && (
        <img
          src={asteroid.image}
          alt={asteroid.name}
          className="w-full h-32 object-cover rounded-t-xl"
        />
      )}
      <CardContent className="text-center mt-2">
        <h3 className="font-bold text-lg">{asteroid.name}</h3>
        <p className="text-gray-300 text-sm mt-1">
          {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
            2
          )}{" "}
          -{" "}
          {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
            2
          )}{" "}
          km
        </p>
      </CardContent>
    </Card>
  );
}
