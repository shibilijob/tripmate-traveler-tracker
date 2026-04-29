import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5 text-center">
      
      {/* Animated 404 Text */}
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-9xl font-bold text-[#11889c]"
      >
        404
      </motion.h1>

      {/* Animated Illustration or Icon */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 2, -2, 0] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="my-8"
      >
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#dc551b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </motion.div>

      {/* Error Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4">
          Lost in the Clouds?
        </h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Back to Home Button */}
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#11889c] text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-[#0e6d7d] transition-colors"
          >
            Take Me Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;