'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Play, Pause, Moon, Sun, Settings, Volume2, VolumeX, Sparkles, ChevronDown, Sliders, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PanelLeftOpen, PanelLeftClose, FileText, MessageCircle } from 'lucide-react';

export default function TextToSpeech() {
  // All state variables remain the same
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [savedText, setSavedText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [queryType, setQueryType] = useState('previous');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
  const [fontZoom, setFontZoom] = useState(100);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // All existing useEffect functions remain the same
  useEffect(() => {
    async function loadPdfJs() {
      if (typeof window !== 'undefined') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        setPdfjsLib(pdfjs);
      }
    }
    
    loadPdfJs();
    // Check for saved preferences in localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedDyslexia = localStorage.getItem('dyslexiaFriendly') === 'true';
    const savedZoom = localStorage.getItem('fontZoom') || '100';
    
    setTheme(savedTheme);
    setIsDyslexiaFriendly(savedDyslexia);
    setFontZoom(parseInt(savedZoom));
    setSidebarOpen(true);

    // Load voices
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
      
      // Set default voice
      if (synthVoices.length > 0) {
        setSelectedVoice(synthVoices[0].name);
      }
    };

    if (typeof window !== 'undefined' ) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
    fetchSavedText();
  }, []);

  // All existing functions remain unchanged
  const fetchSavedText = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/save-simplified-text');
      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text.trim() !== '') {
          setSavedText(data.text);
          console.log("Fetched saved text:", data.text);
        } else {
          setSavedText('No previously simplified text found. Please use the text simplification feature first or enter new text.');
        }
      } else {
        console.error('Failed to fetch saved text:', response.status);
        setSavedText('Error fetching saved text. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching saved text:', error);
      setSavedText('Error connecting to the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleDyslexiaFriendly = () => {
    const newValue = !isDyslexiaFriendly;
    setIsDyslexiaFriendly(newValue);
    localStorage.setItem('dyslexiaFriendly', newValue);
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? fontZoom + 10 : fontZoom - 10;
    const clampedZoom = Math.max(80, Math.min(150, newZoom));
    setFontZoom(clampedZoom);
    localStorage.setItem('fontZoom', clampedZoom.toString());
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const toggleAdvancedSettings = () => {
    setAdvancedSettingsOpen(!advancedSettingsOpen);
  };

  const handleSpeak = async (content) => {
    if (!content.trim()) return;
  
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
  
    const utterance = new SpeechSynthesisUtterance(content);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.lang = selectedLanguage;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume; 
    utterance.onstart = () => {
      setIsPlaying(true);
      console.log("Speech started");
    };
    utterance.onend = () => {
      setIsPlaying(false);
      console.log("Speech ended");
    };
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);   
  
    setIsPlaying(true);
  
    // Create an audio context and capture audio
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
  
    const mediaRecorder = new MediaRecorder(destination.stream);
    let chunks = [];
  
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    };
  
    mediaRecorder.start();
    setRecorder(mediaRecorder);
  
    const source = audioContext.createMediaStreamSource(destination.stream);
    const utteranceClone = new SpeechSynthesisUtterance(content);
    if (voice) utteranceClone.voice = voice;
    utteranceClone.lang = selectedLanguage;
    utteranceClone.rate = rate;
    utteranceClone.pitch = pitch;
    utteranceClone.volume = volume;
  
    window.speechSynthesis.speak(utteranceClone);
  
    utteranceClone.onend = () => {
      mediaRecorder.stop();
      audioContext.close();
      setIsPlaying(false);
    };
  };

  const extractTextFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      if (file.type === 'application/pdf') {
        if (!pdfjsLib) {
          reject(new Error("PDF library not loaded yet. Please try again."));
          return;
        }
        reader.onload = async () => {
          try {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let text = '';
  
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map(item => item.str).join(' ');
              text += pageText + '\n';
            }
  
            console.log("✅ PDF extracted text:", text);
            resolve(text);
          } catch (error) {
            console.error("❌ Error reading PDF:", error);
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'text/plain') {
        reader.onload = () => {
          console.log("✅ TXT extracted text:", reader.result);
          resolve(reader.result);
        };
        reader.onerror = (err) => {
          console.error("❌ Error reading TXT:", err);
          reject(err);
        };
        reader.readAsText(file);
      } else {
        reject(new Error("Unsupported file type. Please upload a .pdf or .txt file."));
      }
    });
  };

  const handleSubmit = async () => {
    let contentToSpeak = '';
  
    if (queryType === 'previous') {
      contentToSpeak = savedText;
      // If savedText is an error message, alert the user
      if (savedText.includes('Error') || savedText.includes('No previously simplified text found')) {
        alert(savedText);
        return;
      }
    } else if (file) {
      try {
        contentToSpeak = await extractTextFromFile(file);
        setText(contentToSpeak); // Optional: shows in textarea
      } catch (error) {
        alert("Failed to read file: " + error.message);
        return;
      }
    } else {
      contentToSpeak = text;
    }
  
    if (contentToSpeak.trim()) {
      handleSpeak(contentToSpeak);
    } else {
      alert("No text available to speak. Please enter some text or upload a file.");
    }
  };

  // Animation variants
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

  const settingsVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  // Custom slider component
  const CustomSlider = ({ value, onChange, min, max, step, label, valueDisplay }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
          {label}
        </label>
        <span className={`text-sm font-bold px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-100'}`}>
          {valueDisplay}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-purple-100'
          }`}
          style={{
            backgroundImage: `linear-gradient(to right, 
              ${theme === 'dark' ? '#6366f1' : '#818cf8'} 0%, 
              ${theme === 'dark' ? '#6366f1' : '#818cf8'} ${((value - min) / (max - min)) * 100}%, 
              ${theme === 'dark' ? '#374151' : '#e0e7ff'} ${((value - min) / (max - min)) * 100}%, 
              ${theme === 'dark' ? '#374151' : '#e0e7ff'} 100%)`
          }}
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header - Keep unchanged */}
      <header className={`py-4 px-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md ${
        theme === 'dark' ? 'bg-gray-800/90 border-b border-gray-700' : 'bg-white/90 border-b border-gray-100'
      }`}>
        <div className="flex items-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </motion.button>
          </Link>

          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-2 rounded-full bg-gradient-to-r from-purple-500 via-purple-500 to-purple-600"
            >
              <Mic size={24} className="text-white" />
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-sans">
              Text-to-Speech
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleSettings}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            aria-label="Settings"
          >
            <Settings size={20} />
          </motion.button>
          
          <AnimatePresence>
            {showSettings && (
              <motion.div
                variants={settingsVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={`absolute right-6 top-16 p-4 rounded-lg shadow-xl z-50 w-64 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
              >
                <h3 className="font-medium mb-3">Display Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Dark Mode</span>
                    <button 
                      onClick={toggleTheme}
                      className={`p-1 rounded-full w-12 h-6 relative ${
                        theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div 
                        animate={{ x: theme === 'dark' ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white absolute top-1"
                      />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Dyslexia Font</span>
                    <button 
                      onClick={toggleDyslexiaFriendly}
                      className={`p-1 rounded-full w-12 h-6 relative ${
                        isDyslexiaFriendly ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div 
                        animate={{ x: isDyslexiaFriendly ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white absolute top-1"
                      />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <span className={`text-sm ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Font Size</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleZoom('out')} 
                        className={`px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        A-
                      </button>
                      <div className={`text-xs px-2 py-1 rounded-lg flex-grow text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {fontZoom}%
                      </div>
                      <button 
                        onClick={() => handleZoom('in')} 
                        className={`px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        A+
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </header>

      {/* Sidebar - Keep unchanged */}
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
              <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ?'bg-purple-800/50 text-white' : 'bg-white border-l-4 border-purple-500 text-purple-700'} cursor-pointer`}>
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
            {/* <Link href="/video-generation">
              <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ?' text-white' : 'bg-white border-l-4 border-purple-500 text-purple-700'} cursor-pointer`}>
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

      {/* Main content - Restructured */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-6"
          >
            <motion.p 
              variants={itemVariants}
              className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}
              style={{ fontSize: `calc(1.125rem * ${fontZoom/100})` }}
            >
              Convert any text into spoken words with customizable voices, speed, and pitch
            </motion.p>
          </motion.div>

          {/* Main card */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`rounded-xl shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-6`}
          >
            <div className="relative p-6">
              {/* Card header */}
              <motion.div 
                variants={itemVariants}
                className="mb-6 flex items-center gap-3"
              >
                <motion.span 
                  whileHover={{ rotate: [-5, 5, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-purple-100 to-purple-200'}`}
                >
                  <Volume2 size={24} className={theme === 'dark' ? 'text-white' : 'text-purple-600'} />
                </motion.span>
                <h3 className={`text-xl font-bold ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                  Text-to-Speech Generator
                </h3>
              </motion.div>

              {/* Controls section */}
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Language and Voice Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                      Language
                    </label>
                    <div className={`relative ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className={`w-full p-3 rounded-lg appearance-none ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="es-ES">Spanish</option>
                        <option value="fr-FR">French</option>
                        <option value="de-DE">German</option>
                        <option value="zh-CN">Chinese</option>
                        <option value="ja-JP">Japanese</option>
                      </select>
                      <ChevronDown size={18} className={`absolute right-3 top-3.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                      Voice
                    </label>
                    <div className={`relative ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className={`w-full p-3 rounded-lg appearance-none ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                      >
                        {voices.map((voice, idx) => (
                          <option key={idx} value={voice.name}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={18} className={`absolute right-3 top-3.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                </div>

                {/* Content Source Selection */}
                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-purple-50/50'}`}>
                  <label className={`block mb-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                    Content Source
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.label 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        queryType === 'previous' 
                          ? theme === 'dark' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-200' 
                          : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                              >
                                                <input
                                                  type="radio"
                                                  name="queryType"
                                                  value="previous"
                                                  className="sr-only"
                                                  checked={queryType === 'previous'}
                                                  onChange={() => setQueryType('previous')}
                                                />
                                                <span className={`p-1 rounded-md ${
                                                  queryType === 'previous' 
                                                    ? 'bg-white/20' 
                                                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}>
                                                  <FileText size={18} />
                                                </span>
                                                <div className="flex flex-col flex-1">
                                                  <span className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                                    Use Previous Simplified Text
                                                  </span>
                                                  <span className="text-xs opacity-80">Use text from the Text Simplification tool</span>
                                                </div>
                                              </motion.label>
                          
                                              <motion.label 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                                  queryType === 'custom' 
                                                    ? theme === 'dark' 
                                                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                                                      : 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                    : theme === 'dark'
                                                      ? 'bg-gray-700 text-gray-200' 
                                                      : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                              >
                                                <input
                                                  type="radio"
                                                  name="queryType"
                                                  value="custom"
                                                  className="sr-only"
                                                  checked={queryType === 'custom'}
                                                  onChange={() => setQueryType('custom')}
                                                />
                                                <span className={`p-1 rounded-md ${
                                                  queryType === 'custom' 
                                                    ? 'bg-white/20' 
                                                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}>
                                                  <MessageCircle size={18} />
                                                </span>
                                                <div className="flex flex-col flex-1">
                                                  <span className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                                    Custom Text / Upload File
                                                  </span>
                                                  <span className="text-xs opacity-80">Enter your own text or upload a document</span>
                                                </div>
                                              </motion.label>
                                            </div>
                                          </div>
                          
                                          {/* Text Area or File Upload based on selection */}
                                          <AnimatePresence mode="wait">
                                            {queryType === 'previous' ? (
                                              <motion.div 
                                                key="previous"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className={`p-4 rounded-lg ${
                                                  theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                                                }`}
                                              >
                                                <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                                  Previously Simplified Text
                                                </h4>
                                                <div 
                                                  className={`p-4 rounded-lg overflow-y-auto max-h-32 ${
                                                    theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
                                                  } ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}
                                                  style={{ fontSize: `calc(1rem * ${fontZoom/100})` }}
                                                >
                                                  {isLoading ? (
                                                    <div className="flex items-center justify-center h-full">
                                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                                    </div>
                                                  ) : (
                                                    savedText || "No previously simplified text found."
                                                  )}
                                                </div>
                                              </motion.div>
                                            ) : (
                                              <motion.div 
                                                key="custom"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-4"
                                              >
                                                <div>
                                                  <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                                    Enter Text
                                                  </label>
                                                  <textarea
                                                    value={text}
                                                    onChange={(e) => setText(e.target.value)}
                                                    placeholder="Type or paste text here..."
                                                    className={`w-full rounded-lg p-4 min-h-32 resize-y border ${
                                                      theme === 'dark' 
                                                        ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500' 
                                                        : 'bg-white text-gray-900 border-gray-300 focus:border-purple-500'
                                                    } focus:ring focus:ring-purple-500/20 outline-none transition-all ${
                                                      isDyslexiaFriendly ? 'font-mono tracking-wide' : ''
                                                    }`}
                                                    style={{ fontSize: `calc(1rem * ${fontZoom/100})` }}
                                                  />
                                                </div>
                                                
                                                <div>
                                                  <p className={`mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                                    Or Upload a File
                                                  </p>
                                                  <div 
                                                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                                      theme === 'dark' 
                                                        ? 'border-gray-600 hover:border-purple-500 bg-gray-700/50' 
                                                        : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                                                    }`}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                      e.preventDefault();
                                                      const droppedFile = e.dataTransfer.files[0];
                                                      if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain')) {
                                                        setFile(droppedFile);
                                                      } else {
                                                        alert('Please upload a .pdf or .txt file');
                                                      }
                                                    }}
                                                    onClick={() => {
                                                      const fileInput = document.getElementById('fileInput');
                                                      if (fileInput) fileInput.click();
                                                    }}
                                                  >
                                                    <input
                                                      type="file"
                                                      id="fileInput"
                                                      className="hidden"
                                                      accept=".pdf,.txt"
                                                      onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                          setFile(e.target.files[0]);
                                                        }
                                                      }}
                                                    />
                                                    <Upload size={32} className={`mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                                      {file ? file.name : "Drop your .pdf or .txt file here, or click to browse"}
                                                    </p>
                                                  </div>
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                          
                                          {/* Advanced Settings Accordion */}
                                          <div>
                                            <button 
                                              onClick={toggleAdvancedSettings}
                                              className={`w-full flex items-center justify-between p-3 rounded-lg ${
                                                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Sliders size={18} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                                <span className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Advanced Settings</span>
                                              </div>
                                              <ChevronDown 
                                                size={18} 
                                                className={`transition-transform ${advancedSettingsOpen ? 'rotate-180' : ''}`} 
                                              />
                                            </button>
                                            
                                            <AnimatePresence>
                                              {advancedSettingsOpen && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: 'auto', opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  className="overflow-hidden"
                                                >
                                                  <div className={`p-4 rounded-lg mt-2 space-y-4 ${
                                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                                                  }`}>
                                                    <CustomSlider 
                                                      value={rate} 
                                                      onChange={(e) => setRate(parseFloat(e.target.value))} 
                                                      min={0.5} 
                                                      max={2} 
                                                      step={0.1} 
                                                      label="Speech Rate" 
                                                      valueDisplay={`${rate}x`}
                                                    />
                                                    
                                                    <CustomSlider 
                                                      value={pitch} 
                                                      onChange={(e) => setPitch(parseFloat(e.target.value))} 
                                                      min={0.5} 
                                                      max={2} 
                                                      step={0.1} 
                                                      label="Pitch" 
                                                      valueDisplay={pitch}
                                                    />
                                                    
                                                    <CustomSlider 
                                                      value={volume} 
                                                      onChange={(e) => setVolume(parseFloat(e.target.value))} 
                                                      min={0} 
                                                      max={1} 
                                                      step={0.1} 
                                                      label="Volume" 
                                                      valueDisplay={`${Math.round(volume * 100)}%`}
                                                    />
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                          
                                          {/* Button Section */}
                                          <div className="flex justify-center pt-2">
                                            <motion.button
                                              whileHover={{ scale: 1.03 }}
                                              whileTap={{ scale: 0.97 }}
                                              onClick={handleSubmit}
                                              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium shadow-lg ${
                                                theme === 'dark' 
                                                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-700/30' 
                                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30'
                                              } transition-all hover:shadow-xl ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}
                                              disabled={isPlaying && (queryType === 'custom' ? !text && !file : !savedText)}
                                            >
                                              {isPlaying ? (
                                                <>
                                                  <Pause size={20} />
                                                  <span>Stop Speaking</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Play size={20} />
                                                  <span>Read Aloud</span>
                                                </>
                                              )}
                                            </motion.button>
                                          </div>
                          
                                          {/* Audio Player (if audioUrl is available) */}
                                          {audioUrl && (
                                            <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                              <audio 
                                                controls 
                                                src={audioUrl}
                                                className="w-full"
                                              >
                                                Your browser does not support the audio element.
                                              </audio>
                                            </div>
                                          )}
                                        </motion.div>
                                      </div>
                                    </motion.div>
                          
                                    {/* Tips and Info Section */}
                                    <motion.div
                                      variants={containerVariants}
                                      initial="hidden"
                                      animate="visible"
                                      className={`rounded-xl overflow-hidden shadow-md ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-purple-50'}`}
                                    >
                                      <div className="p-6">
                                        <motion.div 
                                          variants={itemVariants}
                                          className="flex items-center gap-3 mb-4"
                                        >
                                          <Sparkles size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                          <h3 className={`text-lg font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                            Tips & Information
                                          </h3>
                                        </motion.div>
                                        
                                        <motion.ul variants={itemVariants} className="space-y-2">
                                          <li className={`flex items-start gap-2 ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}>
                                            <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                            <span className="text-sm">
                                              To get the best quality speech, use punctuation and full sentences.
                                            </span>
                                          </li>
                                          <li className={`flex items-start gap-2 ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}>
                                            <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                            <span className="text-sm">
                                              Different voices work better for different languages. Try several to find your favorite.
                                            </span>
                                          </li>
                                          <li className={`flex items-start gap-2 ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}>
                                            <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                            <span className="text-sm">
                                              Upload PDF or TXT files to have their contents read aloud to you.
                                            </span>
                                          </li>
                                          <li className={`flex items-start gap-2 ${isDyslexiaFriendly ? 'font-mono leading-relaxed tracking-wide' : ''}`}>
                                            <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                            <span className="text-sm">
                                              Use the advanced settings to customize the speech rate, pitch, and volume.
                                            </span>
                                          </li>
                                        </motion.ul>
                                      </div>
                                    </motion.div>
                                  </div>
                                </main>
                              </div>
                            );
                          }