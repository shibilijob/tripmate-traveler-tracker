import React from "react";

const About = () => {
  return (
    <div className="bg-[#eef8f7] min-h-screen py-16 px-6">

      {/* Container */}
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* Section 1 - Intro */}
        <div className="flex flex-col md:flex-row items-center gap-10">

          {/* Text */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800">
              About <span className="text-orange-400">TripMate</span>
            </h1>
            <p className="text-gray-600 mt-6 leading-relaxed">
              TripMate is a real-time travel companion platform that allows you 
              to track your friends’ live locations seamlessly. Whether you're on 
              a road trip, trekking, or exploring a new city, TripMate keeps your 
              group connected and safe.
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Built with modern technologies, TripMate ensures secure and private 
              location sharing through rooms — just like multiplayer games.
            </p>
          </div>

          {/* Image */}
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470"
              alt="travel"
              className="rounded-2xl shadow-lg w-full h-[300px] object-cover"
            />
          </div>
        </div>

        {/* Section 2 - Mission */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">

          {/* Text */}
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-gray-800">
              Our Mission
            </h2>
            <p className="text-gray-600 mt-6 leading-relaxed">
              Our mission is to make group travel smarter, safer, and more fun. 
              We aim to eliminate the stress of losing track of your friends and 
              provide a seamless experience of staying connected in real time.
            </p>
          </div>

          {/* Image */}
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1"
              alt="map"
              className="rounded-2xl shadow-lg w-full h-[300px] object-cover"
            />
          </div>
        </div>

        {/* Section 3 - Features */}
        <div className="flex flex-col items-center text-center">

          <h2 className="text-3xl font-semibold text-gray-800">
            Key Features
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 mt-10">

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex-1">
              <h3 className="text-lg font-semibold text-orange-400">
                Live Tracking
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                See your friends' real-time location updates instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex-1">
              <h3 className="text-lg font-semibold text-orange-400">
                Private Rooms
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Create rooms and share access only with your group.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex-1">
              <h3 className="text-lg font-semibold text-orange-400">
                Secure Sharing
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Your location data stays safe and encrypted.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default About;