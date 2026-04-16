import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:justify-between gap-10">

        <div className="md:w-1/3">
          <h1 className="text-2xl font-bold text-orange-400">TripMate</h1>
          <p className="text-gray-400 mt-4 text-sm">
            Track your travel buddies live location in real-time and stay connected
            like never before.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-10 md:w-2/3 md:justify-end">

          <div>
            <h2 className="font-semibold text-lg mb-4">Quick Links</h2>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-orange-400 cursor-pointer">Home</li>
              <li className="hover:text-orange-400 cursor-pointer">Rooms</li>
              <li className="hover:text-orange-400 cursor-pointer">About</li>
              <li className="hover:text-orange-400 cursor-pointer">Contact</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-4">Features</h2>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Live Location Tracking</li>
              <li>Private Rooms</li>
              <li>Secure Sharing</li>
              <li>Real-time Updates</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-4">Follow Us</h2>
            <div className="flex gap-4">
              <div className="p-2 bg-gray-800 rounded-full hover:bg-orange-400 cursor-pointer">
                <FaFacebookF />
              </div>
              <div className="p-2 bg-gray-800 rounded-full hover:bg-orange-400 cursor-pointer">
                <FaTwitter />
              </div>
              <div className="p-2 bg-gray-800 rounded-full hover:bg-orange-400 cursor-pointer">
                <FaInstagram />
              </div>
              <div className="p-2 bg-gray-800 rounded-full hover:bg-orange-400 cursor-pointer">
                <FaGithub />
              </div>
            </div>
          </div>

        </div>
      </div>
        
      <div className="border-t border-gray-700 text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} TripMate. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;