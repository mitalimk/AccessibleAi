
'use client';

import React, { useState, useEffect } from 'react';
import { simplifyTextWithGemini, analyzeTextComplexity } from './simplificationApi';

import { 
  ArrowLeft, FileText, Upload, Download, Copy, 
  RefreshCw, MessageCircle, Check, Mic, Book, 
  Loader2, User, Heart, AlertCircle, Sparkles,Printer
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { 
  Moon, Sun, PanelLeftOpen, PanelLeftClose, Settings
  // Include other icons you're already using
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
    
export default function TextSimplification() {
  const [theme, setTheme] = useState('light');
  const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
  const [fontZoom, setFontZoom] = useState(100);
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [results, setResults] = useState({
    general: '',
    kids: '',
    elderly: '',
    emoji: ''
  });
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [activeStyle, setActiveStyle] = useState('informative');
  
  // Load theme from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light';
      const savedDyslexia = localStorage.getItem('dyslexiaFriendly') === 'true';
      const savedZoom = parseInt(localStorage.getItem('fontZoom')) || 100;
      
      setTheme(savedTheme);
      setIsDyslexiaFriendly(savedDyslexia);
      setFontZoom(savedZoom);
    }
  }, []);
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const toggleDyslexiaFriendly = () => {
    setIsDyslexiaFriendly(!isDyslexiaFriendly);
  };
 
  const handleTextChange = (e) => {
    setInputText(e.target.value);
    // Clear results when input changes
    if (results.general || results.kids || results.elderly || results.emoji) {
      setResults({
        general: '',
        kids: '',
        elderly: '',
        emoji: ''
      });
    }
  };
  const saveSimplifiedText = async (text) => {
    try {
      const response = await fetch('/api/save-simplified-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save simplified text');
      }
      
      console.log('Simplified text saved successfully');
    } catch (error) {
      console.error('Error saving simplified text:', error);
    }
  };
  
  const handleProcessText = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      // Process all audience types simultaneously with the selected style
      const [generalResult, kidsResult, elderlyResult, emojiResult] = await Promise.all([
        simplifyTextWithGemini(inputText, 'general', activeStyle),
        simplifyTextWithGemini(inputText, 'kids', activeStyle),
        simplifyTextWithGemini(inputText, 'elderly', activeStyle),
        simplifyTextWithGemini(inputText, 'emoji', activeStyle)
      ]);
      
      const newResults = {
        general: generalResult,
        kids: kidsResult,
        elderly: elderlyResult,
        emoji: emojiResult
      };
      
      setResults(newResults);
      
      // Save the active tab's result
      await saveSimplifiedText(newResults[activeTab]);
    } catch (error) {
      console.error("Error during text simplification:", error);
    } finally {
      setIsProcessing(false);
    }
  };
   const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? fontZoom + 10 : fontZoom - 10;
    setFontZoom(Math.max(80, Math.min(150, newZoom)));
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
  const overlayVariants = {
    open: { opacity: 0.5, display: "block" },
    closed: { opacity: 0, display: "none" }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // If we already have results for this tab, save them
    if (results[tab]) {
      saveSimplifiedText(results[tab]);
    }
  };
  
  const handleCopyText = () => {
    const textToCopy = results[activeTab];
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearText = () => {
    setInputText('');
    setResults({
      general: '',
      kids: '',
      elderly: '',
      emoji: ''
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target.result);
    };
    reader.readAsText(file);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  // Example texts for demonstration
  const exampleTexts = [
    {
      title: "Scientific Text",
      text: "Quantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others, including when the particles are separated by a large distance."
    },
    {
      title: "Legal Document",
      text: "The parties hereto agree that this Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, understandings, negotiations and discussions, whether oral or written, of the parties."
    },
    {
      title: "Medical Information",
      text: "Myocardial infarction occurs when blood flow decreases or stops to a part of the heart, causing damage to the heart muscle. The most common symptom is chest pain or discomfort which may travel into the shoulder, arm, back, neck or jaw."
    }
  ];

  const loadExample = (text) => {
    setInputText(text);
    setShowExamples(false);
  };
const handleDownloadText = () => {
    if (!results[activeTab]) return;
    
    const element = document.createElement('a');
    const file = new Blob([results[activeTab]], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `simplified-text-${activeTab}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleSpeakText = () => {
    if (!results[activeTab] || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(results[activeTab]);
    
    // Optional: Configure voice properties
    utterance.rate = 1.0; // Speech rate (0.1 to 10)
    utterance.pitch = 1.0; // Speech pitch (0 to 2)
    utterance.volume = 1.0; // Volume (0 to 1)
    
    window.speechSynthesis.speak(utterance);
  };
  return (
<div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-purple-50 to-white text-gray-900'}`}>
      {/* Add static sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 shadow-lg z-20 transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
  <div className="p-4">
  <div className="flex items-center gap-2 mb-8">
  <FileText size={24} className="text-purple-600" />
  <h1 className={`text-xl font-bold text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
    AI Tools
  </h1>
</div>
    
    {/* Sidebar Navigation */}
    <nav className="space-y-2">
      <Link href="/">
      <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
          <ArrowLeft size={18} />
          <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Back to Home</span>
        </div>
      </Link>
      
      <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-800/50 text-white' : 'bg-white border-l-4 border-purple-500 text-purple-700'}`}>
        <FileText size={18} />
        <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Text Simplification</span>
      </div>
      
      <Link href="/audio-reader">
      <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
          <Mic size={18} />
          <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Audio Reader</span>
        </div>
      </Link>
      
      <Link href="/image-understanding">
      <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
          <Upload size={18} />
          <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Image Understanding</span>
        </div>
      </Link>
{/* 
      <Link href="/video-generation">
      <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
          <Upload size={18} />
          <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Video Generation</span>
        </div>
      </Link> */}
      
      <Link href="/chat-with-ai">
      <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
          <MessageCircle size={18} />
          <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Chat with AI</span>
        </div>
      </Link>
      
    </nav>
  </div>
</div>
      {/* Header */}
      <div className="pl-64">
  <header className={`py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-10 backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>      <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
          <span className="flex items-center gap-2">
  <FileText size={24} className="text-purple-600" />
  <span className={`text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Text Simplification</span>
</span>
          </h1>
        </div>
        
        
        {/* ADD THIS BLOCK - Accessibility controls */}
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
            className={`p-2 rounded-lg text-sm ${isDyslexiaFriendly ? 'bg-purple-500 text-white' : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white border border-gray-200 hover:border-purple-400'}`}`}
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
        {/* END OF ADDED BLOCK */}
      </header>
  
      <main className="container mx-auto px-4 py-8 max-w-6xl">
                <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Input Section */}
          <motion.div 
            variants={itemVariants}
            className={`rounded-2xl shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-4 text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Input Text
</h2>
            
            <div className="mb-4">
              <textarea
                value={inputText}
                onChange={handleTextChange}
                placeholder="Paste or type your complex text here..."
                className={`w-full h-64 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-400`}
                style={{ fontSize: `calc(1rem * ${fontZoom/100})` }}
              ></textarea>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearText}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white border border-gray-200 hover:border-purple-400 hover:text-purple-500'}`}
                aria-label="Clear text"
              >
                <RefreshCw size={20} />
              </motion.button>
              
              <div className="relative">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileUpload}
                  accept=".txt,.doc,.docx,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <motion.label
                  htmlFor="fileUpload"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center cursor-pointer`}
                >
                  <Upload size={20} />
                </motion.label>
              </div>
            </div>
          </motion.div>
  
          {/* Target Audience Options */}
          <motion.div
            variants={itemVariants}
            className={`rounded-2xl shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h2 className={`text-xl font-bold mb-4 text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Target Audience
</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <button
                onClick={() => setActiveTab('general')}
                className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  activeTab === 'general' 
  ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'} border-2 border-purple-600` 
  : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100  text-gray-600'} hover:border-purple-400 hover:text-purple-500`
                }`}
              >
                <Book size={24} />
                <span className="font-medium">General</span>
              </button>
              
              <button
                onClick={() => setActiveTab('kids')}
                className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  activeTab === 'kids' 
                    ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'} border-2 border-purple-600` 
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-purple-50`
                }`}
              >
                <User size={24} />
                <span className="font-medium">Kids</span>
              </button>
              
              <button
                onClick={() => setActiveTab('elderly')}
                className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  activeTab === 'elderly' 
                    ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'} border-2 border-purple-600` 
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-purple-50`
                }`}
              >
                <Heart size={24} />
                <span className="font-medium">Elderly</span>
              </button>
              
              <button
                onClick={() => setActiveTab('emoji')}
                className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  activeTab === 'emoji' 
                    ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'} border-2 border-purple-600` 
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-indigo-50`
                }`}
              >
                <span className="text-2xl">🤓</span>
                <span className="font-medium">Emoji</span>
              </button>
            </div>
          </motion.div>
  
          {/* Text Style Options */}
<motion.div
  variants={itemVariants}
  className={`rounded-2xl shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
>
<div className={`text-xl font-bold mb-4 text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Text Style
</div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
    <button
      onClick={() => setActiveStyle('informative')}
      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
        activeStyle === 'informative' 
          ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'} border-2 border-purplre-600` 
          : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-indigo-50`
      }`}
    >
      <FileText size={24} />
      <span className="font-medium">Informative</span>
    </button>
    
    <button
      onClick={() => setActiveStyle('technical')}
      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
        activeStyle === 'technical' 
          ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'} border-2 border-purple-600` 
          : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-indigo-50`
      }`}
    >
      <Sparkles size={24} />
      <span className="font-medium">Technical</span>
    </button>
    
    <button
      onClick={() => setActiveStyle('short')}
      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
        activeStyle === 'short' 
          ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'} border-2 border-purple-600` 
          : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-indigo-50`
      }`}
    >
      <MessageCircle size={24} />
      <span className="font-medium">Short Explanation</span>
    </button>
    
    <button
      onClick={() => setActiveStyle('educational')}
      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
        activeStyle === 'educational' 
          ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-indigo-100 text-purple-700'} border-2 border-purple-600` 
          : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-indigo-50`
      }`}
    >
      <Book size={24} />
      <span className="font-medium">Educational</span>
    </button>
  </div>
</motion.div>
          {/* Process Button */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProcessText}
              disabled={!inputText.trim() || isProcessing}
              className={`px-8 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors text-white font-medium flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
              >
              {isProcessing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Sparkles size={24} />
              )}
              <span className="text-lg">{isProcessing ? 'Processing...' : 'Simplify Text'}</span>
            </motion.button>
          </motion.div>
  
          {/* Output Section */}
          <motion.div 
            variants={itemVariants}
            className={`rounded-2xl shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-4 text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Simplified Output
</h2>
            
            {/* Result display */}
            <div 
              className={`h-64 p-4 rounded-lg border mb-4 overflow-y-auto ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-300'
              }`}
              style={{ fontSize: `calc(1rem * ${fontZoom/100})` }}
            >
              {isProcessing ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="animate-spin text-purple-500" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Processing your text...
                    </p>
                  </div>
                </div>
              ) : results[activeTab] ? (
                <div className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''} leading-relaxed`}>
                  {results[activeTab]}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle size={32} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {inputText 
                        ? "Click 'Simplify Text' to see your results" 
                        : "Enter text above to get started"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Output actions */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyText}
                disabled={!results[activeTab]}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-white border border-gray-200 hover:border-purple-400 hover:text-purple-500'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Text'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeakText}
                disabled={!results[activeTab]}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-white border border-gray-200 hover:border-purple-400 hover:text-purple-500'
                }`}
              >
                <Mic size={18} />
                Listen to Text
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadText}
                disabled={!results[activeTab]}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-white border border-gray-200 hover:border-purple-400 hover:text-purple-500'
                }`}
              >
                <Download size={18} />
                Download Text
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
  
        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 mb-8"
        >
          <motion.h2 
  variants={itemVariants}
  className={`text-2xl font-bold mb-6 text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}
>
  Text Simplification Features
</motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <motion.div
              variants={itemVariants}
              className={`p-6 rounded-xl shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
             <div className={`p-3 rounded-lg inline-block mb-3 ${theme === 'dark' ? 'bg-purple-800/20' : 'bg-white border border-purple-200'}`}>
<Book size={24} className="text-purple-500" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 text-purple-600 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  General Simplification
</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                Simplifies complex text while maintaining meaning, making content more accessible for general audiences.
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              className={`p-6 rounded-xl shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className={`p-3 rounded-lg inline-block mb-3 ${theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                <User size={24} className="text-indigo-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 text-purple-600 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Kid-Friendly Version
</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                Creates versions suitable for children with simpler vocabulary and shorter sentences.
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              className={`p-6 rounded-xl shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className={`p-3 rounded-lg inline-block mb-3 ${theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                <Heart size={24} className="text-indigo-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 text-purple-600 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Elderly-Friendly Version
</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                Adapts content for older readers with clear language and respectful explanations.
              </p>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div
              variants={itemVariants}
              className={`p-6 rounded-xl shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className={`p-3 rounded-lg inline-block mb-3 ${theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                <span className="text-xl">🤓</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 text-purple-600 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Emoji Explanation
</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                Adds visual cues with emojis to make content more engaging and easier to understand.
              </p>
            </motion.div>
          </div>
        </motion.div>
  
        {/* Get help section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`p-6 rounded-xl shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-12`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
              <MessageCircle size={24} className="text-indigo-600" />
            </div>
            <h3 className={`text-lg font-semibold text-purple-600 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
  Need more help?
</h3>
          </div>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
            Our AI assistant can help you further customize the text simplification to meet your specific needs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium flex items-center gap-2`}
            >
            <MessageCircle size={18} />
            Chat with Assistant
          </motion.button>
        </motion.div>
      </main>
      </div>

    </div>
  );}