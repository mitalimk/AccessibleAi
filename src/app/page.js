// src/app/page.js - With added typing animation for the heading

'use client'; // This directive is needed for client-side components in App Router

import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Image, User, Moon, Sun, Book, Briefcase, 
  Users, Heart, ArrowRight, Brain, Zap, Sparkles, Menu, X,
  Menu as MenuIcon, Settings, Mic, Download, MousePointer,
  PanelLeftOpen, PanelLeftClose, UserCheck, GraduationCap,
  Newspaper, Lightbulb, Accessibility, MessageCircle, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TextSimplification from './text-simplification/page';

import Link from 'next/link';


export default function Home() {
  const [theme, setTheme] = useState('light');
  const [contentType, setContentType] = useState('');
  const [audience, setAudience] = useState('');
  const [uploadedContent, setUploadedContent] = useState(null);
  const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
  const [fontZoom, setFontZoom] = useState(100);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPointer, setShowPointer] = useState(true); // Control the visibility of the pointer
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // The full text for typing effect
  const fullText = "Making Content Accessible for Every Mind";

  // Effect for typing animation
  useEffect(() => {
    let typingInterval;
    let currentIndex = 0;
    
    if (isTyping) {
      typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          // Reset typing after a delay
          setTimeout(() => {
            setDisplayText('');
            currentIndex = 0;
          }, 1000);
        }
      }, 100); // Adjust speed as needed
    }
    
    return () => clearInterval(typingInterval);
  }, [isTyping]);

  // Simulate loading effect
  useEffect(() => {
    setIsLoaded(true);
    
    // Auto-hide pointer after 10 seconds
    const timer = setTimeout(() => {
      setShowPointer(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleDyslexiaFriendly = () => {
    setIsDyslexiaFriendly(!isDyslexiaFriendly);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Hide the pointer when sidebar is opened
    if (!sidebarOpen) {
      setShowPointer(false);
    }
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? fontZoom + 10 : fontZoom - 10;
    setFontZoom(Math.max(80, Math.min(150, newZoom)));
  };

    // Sidebar menu items
    // Replace the menuItems array with this updated version that doesn't include audience selection:
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
    icon: <Image size={20} />, 
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

    // Define animations
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
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

    const pulseVariants = {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity }
      }
    };

    const floatVariants = {
      initial: { y: 0 },
      animate: {
        y: [0, -10, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    };

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

    // Animation for the pointer
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

  // Cursor blinking animation
  const cursorVariants = {
    blink: {
      opacity: [1, 0, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-indigo-50 to-white text-gray-900'}`}>
      {/* Header */}
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
            
            {/* Arrow pointer animation pointing to sidebar button */}
            <AnimatePresence>
              {showPointer && !sidebarOpen && (
                <motion.div 
                  className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex items-center"
                  variants={pointerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <motion.div 
                    className={`px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500'} text-white font-bold text-sm whitespace-nowrap mr-2`}
                  >
                    Start Here
                  </motion.div>
                  <ArrowLeft 
                    size={24} 
                    className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* Sidebar */}
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
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>        Transform any content for better accessibility
      </p>
    </div>

    <div className="py-4 overflow-y-auto" style={{ height: "calc(100vh - 150px)" }}>
      <nav className="px-2">
        {menuItems.map((item, index) => (
          <div key={index} className="mb-2">
           {item.title === "Text Simplification" || item.title === "Upload Content" ? (
  <Link href={item.title === "Text Simplification" ? "/text-simplification" : "/upload-content"}>
    <motion.div
      whileHover={{ x: 5 }}
      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'}`}
    >
      <span className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'}`}>
        {item.icon}
      </span>
      <div>
        <h4 className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>{item.title}</h4>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
          {item.description}
        </p>
      </div>
    </motion.div>
  </Link>
) : (
  // Rest of the code
           
              <>
                <motion.button
                  whileHover={{ x: 5 }}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'}`}
                >
                  <span className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'}`}>
                    {item.icon}
                  </span>
                  <div>
                  <h4 className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>{item.title}</h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                      {item.description}
                    </p>
                  </div>
                </motion.button>

                {item.subItems && (
                  <div className="ml-12 mt-2 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <motion.button
                        key={subIndex}
                        whileHover={{ x: 3 }}
                        className={`w-full text-left p-2 rounded-md flex items-center gap-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'}`}
                      >
                        <span className={isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}>{subItem.icon}</span>
                        <span className={isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}>
                          {subItem.title}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </div>

    {/* ✅ Keep this outside of scrollable content */}
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


      {/* Hero Section */}
      <section className={`py-16 md:py-28 px-4 ${theme === 'dark' ? 'bg-gradient-to-b from-indigo-900/20 to-gray-900' : 'bg-gradient-to-b from-indigo-100 to-indigo-50'}`}>
        <div className="container mx-auto max-w-6xl relative">
          {/* Decorative elements */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-0 right-0 -mt-20 mr-20 hidden md:block"
          >
            <div className="text-indigo-500/20 text-9xl font-bold">AI</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -bottom-10 -left-10 hidden md:block"
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-r from-purple-400/10 to-indigo-400/10 blur-2xl"></div>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-7/12"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="mb-2 inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className={`bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                  AI-Powered Accessibility
                </span>
              </motion.div>
              
              <motion.h1 
                className={`text-4xl md:text-6xl font-extrabold mb-6 leading-tight ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : 'font-sans'}`}
                style={{ fontSize: `calc(3rem * ${fontZoom/100})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="inline-flex">
                  {displayText}
                  <motion.span
                    variants={cursorVariants}
                    animate="blink"
                    className="inline-block w-2 h-12 bg-indigo-600 ml-1"
                  />
                </span>
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"> </span>
              </motion.h1>
              
              <motion.p 
                className={`text-lg md:text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}
                style={{ fontSize: `calc(1.25rem * ${fontZoom/100})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Transform any content into formats that work for everyone, regardless of cognitive or learning differences. Powered by advanced AI to simplify, explain, and personalize.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/text-simplification">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </motion.button>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-3 rounded-lg font-semibold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'} shadow-md border border-gray-200 hover:shadow-lg`}
                >
                  Watch Demo
                </motion.button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="md:w-5/12 relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div 
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                className={`rounded-2xl shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                {/* Hero image/illustration */}
                <div className="p-6">
                  <div className={`rounded-lg p-6 mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1 text-center text-sm text-gray-500">AccessibleAI Demo</div>
                    </div>
                    <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-3`}>
                      <p className="text-sm text-gray-500 mb-2">Original Text:</p>
                      <p className="text-sm">The photosynthetic process in plants involves the conversion of light energy into chemical energy that can be used to fuel the organism's activities.</p>
                    </div>
                    <div className={`p-4 rounded-md bg-gradient-to-r ${theme === 'dark' ? 'from-indigo-900/50 to-purple-900/50' : 'from-indigo-100 to-purple-100'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">Simplified Version:</p>
                        <span className="text-xs px-2 py-1 bg-indigo-200 text-indigo-700 rounded-full">For Students</span>
                      </div>
                      <p className="text-sm">Photosynthesis is how plants make their food! They use sunlight to turn water and air into energy they can use to grow and live.</p>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700'}`}
                      >
                        <span className="text-xl">🔊</span>
                        <span>Listen</span>
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <motion.div 
                      variants={floatVariants} 
                      initial="initial" 
                      animate="animate"
                      className="h-2 w-2 rounded-full bg-indigo-500"
                    ></motion.div>
                    <motion.div 
                      variants={floatVariants} 
                      initial="initial" 
                      animate="animate"
                      transition={{ delay: 0.5 }}
                      className="h-2 w-2 rounded-full bg-purple-500"
                    ></motion.div>
                    <motion.div 
                      variants={floatVariants} 
                      initial="initial" 
                      animate="animate"
                      transition={{ delay: 1 }}
                      className="h-2 w-2 rounded-full bg-pink-500"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -z-10 -bottom-12 -right-12"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <div className="h-40 w-40 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl font-bold mb-6 ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : 'font-sans'}`}
            style={{ fontSize: `calc(2rem * ${fontZoom/100})` }}
          >
            Transform Content with <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Intelligent Accessibility</span>
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}
            style={{ fontSize: `calc(1.125rem * ${fontZoom/100})` }}
          >
            Upload your content and our AI will adapt it for your specific audience, making information accessible to everyone
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div 
          className={`rounded-2xl shadow-xl p-8 mb-16 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {/* Background decorative elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-2xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl"></div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h3 
              variants={itemVariants}
              className={`text-2xl font-bold mb-8 inline-flex items-center gap-3 ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : 'font-sans'}`}
              style={{ fontSize: `calc(1.5rem * ${fontZoom/100})` }}
            >
              <span className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <Sparkles size={22} />
              </span>
              Start Making Content Accessible
            </motion.h3>
            
            {/* Content continues with rest of the page... */}
          </motion.div>
        </motion.div>

        {/* Rest of the page content would continue here */}
      </main>
    </div>
  );
}