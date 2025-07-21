'use client';
import ResponsiveContainer from '../components/ResponsiveContainer';

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  ArrowLeft, FileText, Upload, Download, Copy, 
  RefreshCw, MessageCircle, Check, Mic, Book, 
  Loader2, User, Heart, AlertCircle, Sparkles, Printer,
  Moon, Sun, PanelLeftOpen, PanelLeftClose, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
// Import the new component
import ImageGenerationTab from './page2';
    
export default function ImageUnderstanding() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [audienceType, setAudienceType] = useState('general');
  const [customPrompt, setCustomPrompt] = useState('');
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('captionGeneration');  // Default tab
  const fileInputRef = useRef(null);
  const [theme, setTheme] = useState('light');
  const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
  const [fontZoom, setFontZoom] = useState(100);
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [withEmoji, setWithEmoji] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyToClipboard = () => {
    try {
      navigator.clipboard.writeText(caption);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy caption. Please try again.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = () => {
              setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Failed to paste image:', err);
      alert('Failed to paste image. Please try uploading instead.');
    }
  };

  const generateCaption = async () => {
    if (!selectedImage) {
      alert('Please upload an image first');
      return;
    }

    setIsLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        
        // Call your API endpoint
        const response = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            audienceType,
            customPrompt
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to generate caption');
        }

        const data = await response.json();
        setCaption(data.caption);
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error generating caption:', error);
      setIsLoading(false);
      alert('Failed to generate caption. Please try again.');
    }
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? fontZoom + 10 : fontZoom - 10;
    setFontZoom(Math.max(80, Math.min(150, newZoom)));
  };
 

  return (
    <ResponsiveContainer>
    
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-purple-50 to-white text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 shadow-lg z-20 transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <FileText size={24} className="text-purple-600" />
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
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
            <Link href="/text-simplification">
              <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
                <FileText size={18} />
                <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Text Simplification</span>
              </div>
            </Link>
            <Link href="/audio-reader">
              <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
                <Mic size={18} /> 
                <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Audio Reader</span>
              </div>
            </Link>
            <Link href="/image-understanding">
              <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ?'bg-purple-800/50 text-white' : 'bg-white border-l-4 border-purple-500 text-purple-700'} cursor-pointer`}>
                <Upload size={18} />
                <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Image Understanding</span>
              </div>
            </Link>

            {/* <Link href="/video-generation">
              <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ?'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
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

      {/* Main Content Area */}
      <div className="pl-64">
        {/* Header */}
        <header className={`py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-10 backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>      
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">
              <span className="flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                <span className={`text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Image Understanding</span>
              </span>
            </h1>
          </div>
          
          {/* Accessibility controls */}
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
        </header>

        {/* Main Content */}
        <div className={`max-w-5xl mx-auto p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-purple-50 to-white'}`}>
          {/* Tabs Container */}
          <div className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} shadow-lg rounded-xl overflow-hidden mb-8`}>
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'captionGeneration' 
                    ? `${theme === 'dark' 
                      ? 'bg-purple-700 text-white border-b-2 border-purple-400' 
                      : 'bg-blue-500 text-white border-b-2 border-blue-300'}`
                    : `${theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'}`
                } focus:outline-none`}
                onClick={() => setActiveTab('captionGeneration')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText size={16} />
                  <span>Generate Caption</span>
                </div>
              </button>
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'imageGeneration' 
                    ? `${theme === 'dark' 
                      ? 'bg-purple-700 text-white border-b-2 border-purple-400' 
                      : 'bg-blue-500 text-white border-b-2 border-blue-300'}`
                    : `${theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'}`
                } focus:outline-none`}
                onClick={() => setActiveTab('imageGeneration')}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  <span>Generate Image</span>
                </div>
              </button>
            </div>
            
            {/* Caption Generation Tab Content */}
            {activeTab === 'captionGeneration' && (
              <div className={`p-8 ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                {/* Image Upload Area - CENTERED with flex */}
                <div className="flex justify-center">
                  <div 
                    className={`border-2 border-dashed ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-gray-800/50' 
                        : 'border-gray-300 bg-gray-50'
                    } rounded-xl p-10 mb-8 text-center cursor-pointer transition-all hover:border-opacity-70 max-w-xl w-full`}
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {!imagePreview ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className={`p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Upload 
                            className={`h-10 w-10 ${theme === 'dark' ? 'text-purple-400' : 'text-blue-500'}`}
                          />
                        </div>
                        <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          Upload an image
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Click to upload or drag and drop
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          PNG, JPG, GIF up to 10MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <button
                          type="button"
                          className={`mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                            theme === 'dark' 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          } transition-colors`}
                          onClick={handlePasteImage}
                        >
                          Paste Image
                        </button>
                      </div>
                    ) : (
                      <div className="relative h-72 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Selected image preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration Options */}
                <div className="space-y-6 max-w-xl mx-auto">
                  {/* Audience Type Selection */}
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      Caption Style
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {['general', 'children', 'experts', 'elderly'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`
                            px-4 py-3 text-sm font-medium rounded-lg transition-colors
                            ${audienceType === type 
                              ? `${theme === 'dark' 
                                ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-opacity-50' 
                                : 'bg-blue-500 text-white ring-2 ring-blue-300'}`
                              : `${theme === 'dark' 
                                ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                          `}
                          onClick={() => setAudienceType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Prompt */}
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Custom Prompt (Optional)
                    </label>
                    <textarea
                      className={`w-full px-4 py-3 rounded-lg shadow-sm transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500' 
                          : 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      rows="3"
                      placeholder="Add specific directions for your captions (e.g., 'include emojis', 'make it humorous')"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={generateCaption}
                    disabled={isLoading || !selectedImage}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Captions
                      </>
                    )}
                  </button>
                </div>

                {/* Results Display */}
                {caption && (
                  <div 
                    className={`mt-8 p-6 rounded-lg max-w-xl mx-auto ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border border-gray-600 shadow-lg' 
                        : 'bg-white border border-gray-200 shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Caption Options
                      </h3>
                      <button
                        type="button"
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          theme === 'dark' 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        onClick={handleCopyToClipboard}
                      >
                        {isCopied ? (
                          <>
                            <Check className="mr-1 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-4 w-4" />
                            Copy All
                          </>
                        )}
                      </button>
                    </div>
                    <div 
                      className={`p-4 rounded-md ${
                        theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {caption.split('\n').filter(line => line.trim()).map((line, index) => {
                        // Extract just the caption content, removing the number if present
                        const captionContent = line.replace(/^\d+[\.\)]\s*/, '').trim();
                        
                        // Determine the style based on position in the list
                        let cardStyle = "";
                        if (index < 2) {
                          // Short captions (first 2)
                          cardStyle = `text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
                        } else if (index < 4) {
                          // Medium captions (next 2)
                          cardStyle = `text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`;
                        } else {
                          // Longer captions (last 2)
                          cardStyle = `text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;
                        }
                        
                        return (
                          <div key={index} className={`mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-purple-600' : 'bg-blue-500'} text-white text-xs font-bold`}>
                                {index + 1}
                              </span>
                              <p className={cardStyle}>{captionContent}</p>
                            </div>
                          </div>
                         

                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Generation Tab Content */}
            {activeTab === 'imageGeneration' && (
              <ImageGenerationTab theme={theme} isDyslexiaFriendly={isDyslexiaFriendly} />
            )}
          </div>
        </div>
      </div>
    </div>
    </ResponsiveContainer>
  );
}