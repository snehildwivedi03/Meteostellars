import { Link } from "react-router-dom";
import BackgroundStars from "../components/BackgroundStars";
import GalaxyBackground from "../components/GalaxyBackground";

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0f1f] text-white">
      <GalaxyBackground />

      <div className="relative z-10 flex h-full flex-col items-center">
        <BackgroundStars />
        {/* Logo */}
        <h1 className="mt-10 w-full text-center text-6xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 drop-shadow-lg">
          <Link to="/"> MeteoStellars</Link>
        </h1>

        {/* Center Buttons */}
        <div className="flex flex-grow flex-col items-center justify-center space-y-6">
          <Link
            to="/asteroids" // Corrected path from "/asteroid" to "/asteroids"
            className="px-10 py-4 rounded-xl text-2xl font-bold text-white 
            bg-gradient-to-r from-blue-500 to-purple-600 
            shadow-[0_0_20px_#00c8ff] 
            hover:scale-105 hover:shadow-[0_0_40px_#00c8ff] 
            transition transform duration-300"
          >
            View Asteroids
          </Link>

          <Link
            to="/simulation"
            className="px-10 py-4 rounded-xl text-2xl font-bold text-white 
            bg-gradient-to-r from-pink-500 to-purple-600 
            shadow-[0_0_20px_#ff2e97] 
            hover:scale-105 hover:shadow-[0_0_40px_#ff2e97] 
            transition transform duration-300"
          >
            Simulation
          </Link>
        </div>
      </div>
    </div>
  );
}
