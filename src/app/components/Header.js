'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function Header({ 
  theme, 
  setTheme, 
  isDyslexiaFriendly, 
  setIsDyslexiaFriendly, 
  fontZoom, 
  handleZoom 
}) {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleDyslexiaFriendly = () => {
    setIsDyslexiaFriendly(!isDyslexiaFriendly);
  };

  return (
    <header className={`py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50 backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>
      {/* Left side of header with logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
          >
            <Brain size={24} className="text-white" />
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-sans">
            Accessible<span className="font-extrabold">AI</span>
          </h1>
        </div>
      </div>

      {/* Right side with accessibility controls */}
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg text-sm flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button 
            onClick={() => handleZoom('out')} 
            className="px-2 hover:text-indigo-600"
            aria-label="Zoom out"
          >
            A-
          </button>
          <span className="text-xs">{fontZoom}%</span>
          <button 
            onClick={() => handleZoom('in')} 
            className="px-2 hover:text-indigo-600"
            aria-label="Zoom in"
          >
            A+
          </button>
        </div>
        <button 
          onClick={toggleDyslexiaFriendly}
          className={`p-2 rounded-lg text-sm ${isDyslexiaFriendly ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}`}
          aria-label="Toggle dyslexia-friendly font"
        >
          Dyslexia Font
        </button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>
    </header>
  );
}