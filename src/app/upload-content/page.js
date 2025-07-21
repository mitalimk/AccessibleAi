'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Image, User, Moon, Sun, Book, Briefcase, 
  Users, Heart, ArrowRight, Brain, Zap, Sparkles, Menu, X,
  Menu as MenuIcon, Settings, Mic, Download, MousePointer,
  PanelLeftOpen, PanelLeftClose, UserCheck, GraduationCap,
  Newspaper, Lightbulb, Accessibility, MessageCircle, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Import the header and sidebar functionality from the home page
// This is a simplified approach to reuse code without creating separate components
import { default as HomePage } from '../page';

export default function UploadContent() {
  // State management for the page
  const [theme, setTheme] = useState('light');
  const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
  const [fontZoom, setFontZoom] = useState(100);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPointer, setShowPointer] = useState(false); // Don't show pointer on upload page

  // Add these state variables after other useState declarations
const [selectedAudience, setSelectedAudience] = useState('general');
const [uploadedContent, setUploadedContent] = useState(null);
const [contentType, setContentType] = useState(null); // 'text' or 'image'
const [processingOptions, setProcessingOptions] = useState([]);
const [showResults, setShowResults] = useState(false);
const [processedContent, setProcessedContent] = useState(null);

  // Functions needed for the header and sidebar
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleDyslexiaFriendly = () => {
    setIsDyslexiaFriendly(!isDyslexiaFriendly);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? fontZoom + 10 : fontZoom - 10;
    setFontZoom(Math.max(80, Math.min(150, newZoom)));
  };

  // Effect for initialization
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Same sidebar menu items as home page but with one item removed
  const menuItems = [
    { 
      title: "Upload Content", 
      icon: <Upload size={20} />, 
      description: "Upload text or image content" 
    },
    { 
      title: "Text Simplification", 
      icon: <FileText size={20} />, 
      description: "AI-powered text simplification" 
    },
    { 
      title: "Image Understanding", 
      icon: <Image size={20}  alt="Description of the image"/>, 
      description: "Generate captions and related images" 
    },
    { 
      title: "Text-to-Speech", 
      icon: <Mic size={20} />, 
      description: "Listen to content read aloud" 
    },
    { 
      title: "Accessibility Tools", 
      icon: <Accessibility size={20} />, 
      description: "Customize your reading experience" 
    },
    { 
      title: "Download & Print", 
      icon: <Download size={20} />, 
      description: "Save or print simplified content" 
    },
    { 
      title: "Smart Assistant", 
      icon: <MessageCircle size={20} />, 
      description: "Ask questions about the content" 
    }
  ];

  // Animation variants (copied from home page)
  const sidebarVariants = {
    open: { 
      x: 0,
      boxShadow: "10px 0 50px rgba(0,0,0,0.2)",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: { 
      x: "-100%", 
      boxShadow: "none",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const overlayVariants = {
    open: { opacity: 0.5, display: "block" },
    closed: { opacity: 0, display: "none" }
  };

  const pointerVariants = {
    initial: { x: 0, opacity: 0 },
    animate: { 
      x: [-10, 10, -10],
      opacity: 1,
      transition: { 
        x: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const toggleProcessingOption = (option) => {
    if (processingOptions.includes(option)) {
      setProcessingOptions(processingOptions.filter(item => item !== option));
    } else {
      setProcessingOptions([...processingOptions, option]);
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-indigo-50 to-white text-gray-900'}`}>
      {/* Header - similar to home page */}
      <header className={`py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50 backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} relative`}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
          </motion.button>
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

      {/* Sidebar - same as home page */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black z-40"
          variants={overlayVariants}
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
          onClick={toggleSidebar}
        ></motion.div>

        <motion.aside
          className={`fixed left-0 top-0 h-full w-80 pt-20 z-40 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          variants={sidebarVariants}
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
        >
          <div className="px-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold mb-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              AI Accessibility Tools
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              Transform any content for better accessibility
            </p>
          </div>

          <div className="py-4 overflow-y-auto" style={{ height: "calc(100vh - 150px)" }}>
            <nav className="px-2">
              {menuItems.map((item, index) => (
                <div key={index} className="mb-2">
                  {item.title === "Text Simplification" ? (
                    <Link href="/text-simplification">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'}`}
                      >
                        <span className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'}`}>
                          {item.icon}
                        </span>
                        <div>
                          <h4 className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                            {item.title}
                          </h4>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ) : item.title === "Upload Content" ? (
                    <Link href="/upload-content">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100/50'}`}
                      >
                        <span className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'}`}>
                          {item.icon}
                        </span>
                        <div>
                          <h4 className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                            {item.title}
                          </h4>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.button
                      whileHover={{ x: 5 }}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'}`}
                    >
                      <span className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'}`}>
                        {item.icon}
                      </span>
                      <div>
                        <h4 className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                          {item.title}
                        </h4>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                          {item.description}
                        </p>
                      </div>
                    </motion.button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-100 hover:bg-indigo-200'}`}
            >
              <Settings size={18} />
              <span className={isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}>Settings</span>
            </motion.button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Upload Content specific content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className={`text-3xl font-bold mb-4 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            Upload Your Content
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            Upload documents, images, or text to make them more accessible
          </p>
        </motion.div>
        
        {/* Upload options */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Document Upload Option */}
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-lg border`}
          >
            <div className="flex justify-center mb-4">
              <div className={`${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'} p-4 rounded-full`}>
                <FileText size={36} className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 text-center ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              Document Upload
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center mb-4 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              PDF, Word, or text files
            </p>
            {/* // Replace the document upload button with this one */}
<button 
  onClick={() => {
    setContentType('text');
    setUploadedContent('Sample document content');
    setProcessingOptions(['simplify', 'tts', 'download']);
    // In a real app, you'd use a file input here
  }}
  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
>
  Choose File
</button>

{/* // Replace the image upload button with this one */}
<button 
  onClick={() => {
    setContentType('image');
    setUploadedContent('sample-image.jpg');
    setProcessingOptions(['caption', 'explain', 'download']);
    // In a real app, you'd use a file input here
  }}
  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
>
  Choose Image
</button>

{/* // Replace the paste text button with this one */}
<button 
  onClick={() => {
    setContentType('text');
    setUploadedContent('Sample pasted text content');
    setProcessingOptions(['simplify', 'tts', 'download']);
    // In a real app, you'd show a textarea modal or similar
  }}
  className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
>
  Paste Text
</button>

{/* // Replace the process button with this functional version */}
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => {
    if (uploadedContent && selectedAudience) {
      setShowResults(true);
      setProcessedContent(`This content has been processed for ${selectedAudience} audience. In a real implementation, this would be the AI-generated simplified text or image caption.`);
    }
  }}
  className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
>
  <Sparkles size={20} />
  <span className={isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}>Process Content</span>
</motion.button>
          </motion.div>
          
          {/* Image Upload Option */}
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-lg border`}
          >
            <div className="flex justify-center mb-4">
              <div className={`${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'} p-4 rounded-full`}>
                <Image size={36} className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} alt="Description of the image" />
              </div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 text-center ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              Image Upload
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center mb-4 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              JPG, PNG or other image files
            </p>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
              Choose Image
            </button>
          </motion.div>
          
          {/* Paste Text Option */}
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-lg border`}
          >
            <div className="flex justify-center mb-4">
              <div className={`${theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-100'} p-4 rounded-full`}>
                <Upload size={36} className={`${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
              </div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 text-center ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              Paste Text
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center mb-4 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              Copy and paste text directly
            </p>
            <button className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg">
              Paste Text
            </button>
          </motion.div>
        </div>
        
        {/* Drop area for files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`mt-12 border-2 border-dashed ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-xl p-12 text-center`}
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className={`text-xl font-semibold mb-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            Drag and Drop
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            Drop your files here to upload
          </p>
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
            Browse Files
          </button>
        </motion.div>

        {/* // Add after the drop area for files section and before the Recently Accessed section */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.5 }}
  className="mt-12"
>
  <h2 className={`text-xl font-bold mb-4 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
    Choose Target Audience
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
    {/* Audience options */}
    {/* Replace the audience buttons with these updated versions */}
<motion.button
  whileHover={{ y: -5 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setSelectedAudience('general')}
  className={`p-4 rounded-lg flex flex-col items-center ${selectedAudience === 'general' ? 'ring-2 ring-indigo-500' : ''} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
>
  <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'} mb-2`}>
    <Users size={24} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
  </div>
  <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>General Public</span>
</motion.button>

<motion.button
  whileHover={{ y: -5 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setSelectedAudience('kids')}
  className={`p-4 rounded-lg flex flex-col items-center ${selectedAudience === 'kids' ? 'ring-2 ring-green-500' : ''} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
>
  <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'} mb-2`}>
    <GraduationCap size={24} className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
  </div>
  <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Kids</span>
</motion.button>

<motion.button
  whileHover={{ y: -5 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setSelectedAudience('elderly')}
  className={`p-4 rounded-lg flex flex-col items-center ${selectedAudience === 'elderly' ? 'ring-2 ring-purple-500' : ''} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
>
  <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'} mb-2`}>
    <UserCheck size={24} className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
  </div>
  <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Elderly</span>
</motion.button>

<motion.button
  whileHover={{ y: -5 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setSelectedAudience('technical')}
  className={`p-4 rounded-lg flex flex-col items-center ${selectedAudience === 'technical' ? 'ring-2 ring-yellow-500' : ''} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
>
  <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'} mb-2`}>
    <Briefcase size={24} className={`${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
  </div>
  <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Technical</span>
</motion.button>
</motion.div>

{/* Add this after the audience selection section */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.6 }}
  className="mt-12"
>
  {/* Replace the existing action options with these conditional ones */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {/* Text Processing Options - show only when contentType is 'text' */}
  {contentType === 'text' && (
    <>
      <motion.button
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleProcessingOption('tts')}
        className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
          <FileText size={20} className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Simplify Text</span>
      </motion.button>
      
      <motion.button
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleProcessingOption('caption')}
        className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
          <Mic size={20} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Text-to-Speech</span>
      </motion.button>
    </>
  )}
  
  {/* Image Processing Options - show only when contentType is 'image' */}
  {contentType === 'image' && (
    <>
      <motion.button
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleProcessingOption('explain')}
        className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
          <Image size={20} className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} alt="Description of the image" />
        </div>
        <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Caption Image</span>
      </motion.button>
      
      <motion.button
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleProcessingOption('download')}
        className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
          <Lightbulb size={20} className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
        </div>
        <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Explain Image</span>
      </motion.button>
    </>
  )}
  
  {/* Common Options - always show if content is uploaded */}
  {contentType && (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-100'}`}>
        <Download size={20} className={`${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
      </div>
      <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Download</span>
    </motion.button>
  )}
</div>

{/* Only show process button if content is uploaded */}
{contentType && (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => {
      if (uploadedContent && selectedAudience) {
        setShowResults(true);
        setProcessedContent(`This content has been processed for ${selectedAudience} audience. In a real implementation, this would be the AI-generated simplified text or image caption.`);
      }
    }}
    className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
  >
    <Sparkles size={20} />
    <span className={isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}>Process Content</span>
  </motion.button>
)}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {/* Text Processing Options */}
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
        <FileText size={20} className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
      </div>
      <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Simplify Text</span>
    </motion.button>
    
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
        <Mic size={20} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
      </div>
      <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Text-to-Speech</span>
    </motion.button>
    
    {/* Image Processing Options */}
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
        <Image size={20} className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}  alt="Description of the image"/>
      </div>
      <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Caption Image</span>
    </motion.button>
    
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
        <Lightbulb size={20} className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
      </div>
      <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Explain Image</span>
    </motion.button>
    
    {/* Common Options */}
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-100'}`}>
        <Download size={20} className={`${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
      </div>
      <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Download</span>
    </motion.button>
  </div>
  
  {/* Process Button */}
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
  >
    <Sparkles size={20} />
    <span className={isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}>Process Content</span>
  </motion.button>
</motion.div>

{/* Add this section before the Recently Accessed section */}
<AnimatePresence>
  {showResults && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12"
    >
      <h2 className={`text-2xl font-bold mb-6 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
        Results
      </h2>
      
      <div className={`p-6 rounded-xl shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            Processed Content
          </h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Text to speech"
            >
              <Mic size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Download"
            >
              <Download size={18} />
            </motion.button>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
          <p className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            {processedContent || "This is a placeholder for the simplified or processed content. The AI will generate content based on your selections and uploaded material."}
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span className={isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}>Regenerate</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
        
        {/* Recently accessed documents section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16"
        >
          <h2 className={`text-2xl font-bold mb-6 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            Recently Accessed
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg flex items-center gap-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md cursor-pointer border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'}`}>
                <FileText size={24} className="text-indigo-600" />
              </div>
              <div>
                <h4 className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                  Science_Article.pdf
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                  Uploaded 2 days ago
                </p>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg flex items-center gap-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md cursor-pointer border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-100'}`}>
                <Image size={24} className="text-purple-600" alt="Description of the image" />
              </div>
              <div>
                <h4 className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                  Infographic.png
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                  Uploaded 1 week ago
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}