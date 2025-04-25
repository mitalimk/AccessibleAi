'use client';

import React from 'react';
import { 
  Upload, FileText, Image, Mic, Download, Settings,
  Accessibility, MessageCircle, PanelLeftOpen, PanelLeftClose 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Sidebar({ 
  theme, 
  isDyslexiaFriendly, 
  sidebarOpen, 
  setSidebarOpen,
  showPointer,
  setShowPointer
}) {
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Hide the pointer when sidebar is opened
    if (!sidebarOpen) {
      setShowPointer(false);
    }
  };
  
  // Sidebar menu items
  const menuItems = [
    { 
      title: "Upload Content", 
      icon: <Upload size={20} />, 
      description: "Upload text or image content",
      href: "/upload-content"
    },
    { 
      title: "Text Simplification", 
      icon: <FileText size={20} />, 
      description: "AI-powered text simplification",
      href: "/text-simplification"
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

  return (
    <>
      {/* Toggle button for sidebar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} relative`}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
        
        {/* Arrow pointer animation */}
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

      {/* Sidebar overlay */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black z-40"
          variants={overlayVariants}
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
          onClick={toggleSidebar}
        ></motion.div>

        {/* Sidebar content */}
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
                  {item.href ? (
                    <Link href={item.href}>
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
    </>
  );
}