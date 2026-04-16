import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import bikers from "../../assets/bikers.jpeg";
import Trekkers from "../../assets/Trekkers.png";
import cyclers from "../../assets/cyclers.jpg";

function Home() {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const navigate = useNavigate();

  const images = [bikers, Trekkers, cyclers];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white transition-all duration-1000"
      style={{
        backgroundImage: `url(${images[currentIndex]})`,
      }}
    >
      <div className="min-h-screen bg-black/50">

        <div className="flex flex-col justify-center items-start px-10 md:px-20 h-[70vh] max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Explore the World,
            <br />
            One Trip at a Time
          </h1>

          <p className="text-white/80 mb-8">
            Discover unforgettable adventures, explore breathtaking destinations,
            and create lifelong memories with your squad.
          </p>

          {!user ? (
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold"
              >
                Start Your Journey
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (role === "admin") {
                  navigate("/admin/dashboard");
                } else {
                  navigate("/rooms");
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default Home;