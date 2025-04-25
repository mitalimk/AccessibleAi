'use client';
    import { CheckCircle, Play, PauseCircle, Settings } from 'lucide-react';

    import React, { useState, useEffect } from 'react';
    // import { simplifyTextWithGemini, analyzeTextComplexity } from './simplificationApi';

    import { 
    ArrowLeft, FileText, Upload, Download, Copy, 
    RefreshCw, MessageCircle, Check, Mic, Book, 
    Loader2, User, Heart, AlertCircle, Sparkles, Printer
    } from 'lucide-react';
    import { motion } from 'framer-motion';
    import Link from 'next/link';

    import { 
    Moon, Sun, PanelLeftOpen, PanelLeftClose
    // Include other icons you're already using
    } from 'lucide-react';
    import { AnimatePresence } from 'framer-motion';
        
    export default function VideoGenerator() {
    const [simplifiedText, setSimplifiedText] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [theme, setTheme] = useState('light');
    const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
    const [fontZoom, setFontZoom] = useState(100);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
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
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        }
    };

    useEffect(() => {
        // Fetch simplified text, images, and videos when component mounts
        fetchSimplifiedText();
        // Don't fetch audio at mount - we'll generate it when needed
        fetchImages();
        fetchVideos();
    }, []);
    
    const fetchSimplifiedText = async () => {
        try {
        const response = await fetch('/api/save-simplified-text');
        const data = await response.json();
        if (data.text) {
            setSimplifiedText(data.text);
        }
        } catch (error) {
        console.error('Error fetching simplified text:', error);
        setError('Failed to load simplified text');
        }
    };

    // WITH THIS NEW FUNCTION:
    const generateAudioFromText = async () => {
        if (!simplifiedText) {
        setError('No simplified text available for audio generation');
        return;
        }
        
        try {
        setStatus('Generating audio from text...');
        
        const response = await fetch('/api/generate-audio', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: simplifiedText }),
        });
        
        const data = await response.json();
        
        if (data.success && data.audioUrl) {
            setAudioUrl(data.audioUrl);
            setStatus('Audio generated successfully');
        } else {
            setError(data.error || 'Failed to generate audio');
        }
        } catch (error) {
        console.error('Error generating audio:', error);
        setError('Failed to generate audio from text');
        } finally {
        setStatus('');
        }
    };
    const fetchImages = async () => {
        setIsLoadingImages(true);
        try {
          // First fetch generated images
          const generatedResponse = await fetch('/api/generate-image');
          const generatedData = await generatedResponse.json();
          
          let allImages = [];
          if (generatedData.images && generatedData.images.length > 0) {
            allImages = generatedData.images.map(img => ({
              name: img.id || `image-${Date.now()}`,
              url: img.url,
              time: Date.now(),
              isGenerated: true
            }));
            setImages(allImages);
          } else {
            // If no generated images, try to get saved images as fallback
            const savedResponse = await fetch('/api/save-images');
            const savedData = await savedResponse.json();
            
            if (savedData.images && savedData.images.length > 0) {
              setImages(savedData.images);
            } else {
              setImages([]);
            }
          }
        } catch (error) {
          console.error('Error fetching images:', error);
          setError('Failed to load images');
        } finally {
          setIsLoadingImages(false);
        }
      };
    const fetchVideos = async () => {
        try {
        const response = await fetch('/api/generate-video');
        const data = await response.json();
        if (data.videos) {
            setVideos(data.videos);
            if (data.videos.length > 0) {
            setCurrentVideo(data.videos[0]);
            }
        }
        } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
        }
    };

    const refreshImages = () => {
        fetchImages();
      };

    const generateVideo = async () => {
        if (!simplifiedText) {
        setError('No simplified text available');
        return;
        }

        if (!audioUrl) {
        setError('No audio available');
        return;
        }

        if (images.length === 0) {
        setError('No images available');
        return;
        }

        try {
        setIsGenerating(true);
        setStatus('Generating video...');
        
        const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ showSubtitles }),
        });

        const data = await response.json();
        if (data.success) {
            setStatus('Video generated successfully');
            fetchVideos();
        } else {
            setError(data.error || 'Failed to generate video');
        }
        } catch (error) {
        console.error('Error generating video:', error);
        setError('Failed to generate video');
        } finally {
        setIsGenerating(false);
        setStatus('');
        }
    };

    const downloadVideo = () => {
        if (!currentVideo) return;
        
        const link = document.createElement('a');
        link.href = currentVideo.url;
        link.download = currentVideo.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const toggleDyslexiaFriendly = () => {
        const newValue = !isDyslexiaFriendly;
        setIsDyslexiaFriendly(newValue);
        if (typeof window !== 'undefined') {
        localStorage.setItem('dyslexiaFriendly', newValue);
        }
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
        const clampedZoom = Math.max(80, Math.min(150, newZoom));
        setFontZoom(clampedZoom);
        if (typeof window !== 'undefined') {
        localStorage.setItem('fontZoom', clampedZoom);
        }
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
        {/* Sidebar */}
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
                
                <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
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

                <Link href="/video-generation">
                <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
                    <Upload size={18} />
                    <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Video Generation</span>
                </div>
                </Link>

                <Link href="/chat-ai">
                <div className={`w-full flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-teal-50'} cursor-pointer`}>
                    <MessageCircle size={18} />
                    <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Chat with AI</span>
                </div>
                </Link>
            </nav>
            </div>
        </div>

        {/* Main content */}
        <div className="pl-64">
            {/* Header */}
            <header className={`py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-10 backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">
                <span className="flex items-center gap-2">
                    <FileText size={24} className="text-purple-600" />
                    <span className={`text-purple-700 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Video Generation</span>
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
    
            {/* Main content */}
            <main className="container mx-auto px-4 py-8 max-w-6xl">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6"
            >
                {/* Error and Status displays */}
                {error && (
                <motion.div 
                    variants={itemVariants}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-400'} text-red-700 flex justify-between items-center`}
                >
                    <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    </div>
                    <button onClick={() => setError('')} className="hover:bg-red-200 p-1 rounded-full">
                    <span className="sr-only">Close</span>
                    ×
                    </button>
                </motion.div>
                )}
                
                {status && (
                <motion.div 
                    variants={itemVariants}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-100 border-blue-400'} text-blue-700`}
                >
                    <div className="flex items-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    <span>{status}</span>
                    </div>
                </motion.div>
                )}
                
                {/* Content Status */}
                <motion.div variants={itemVariants} className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                    Content Status
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Simplified Text */}
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200'}`}>
                    <div className="flex items-center mb-2">
                        <span className={`font-medium mr-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Simplified Text</span>
                        {simplifiedText ? <CheckCircle className="text-green-500" size={18} /> : null}
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                        {simplifiedText ? `${simplifiedText.substring(0, 50)}...` : 'Not available'}
                    </p>
                    </div>
                    
                {/* Audio Narration */}
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200'}`}>
    <div className="flex items-center mb-2">
        <span className={`font-medium mr-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Audio Narration</span>
        {audioUrl ? <CheckCircle className="text-green-500" size={18} /> : null}
    </div>
    {audioUrl ? (
        <audio controls className="w-full h-8">
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
        </audio>
    ) : (
        <div className="flex flex-col gap-2">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Not available</p>
        <button
            onClick={generateAudioFromText}
            disabled={!simplifiedText}
            className={`p-2 text-sm rounded transition-colors flex items-center justify-center ${
            !simplifiedText
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : theme === 'dark' ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
        >
            <Mic size={16} className="mr-1" />
            <span>Generate Audio</span>
        </button>
        </div>
    )}
    </div>
                    
                    {/* Images */}
                    {/* Images */}
<div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200'}`}>
  <div className="flex items-center mb-2">
    <span className={`font-medium mr-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Images</span>
    {images.length > 0 ? <CheckCircle className="text-green-500" size={18} /> : null}
  </div>
  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
    {images.length > 0 ? `${images.length} images available` : 'No images'}
  </p>
  <div className="mt-2">
    <button
      onClick={refreshImages}
      className={`flex items-center justify-center p-2 rounded cursor-pointer transition-colors w-full ${theme === 'dark' ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
    >
      <RefreshCw size={16} className="mr-1" />
      <span>Refresh Images</span>
    </button>
  </div>
</div>
                </div>
                </motion.div>
                
                {/* Generate Video Section */}
                <motion.div variants={itemVariants} className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                    Generate Video
                    </h2>
                    <div className="flex items-center">
                    <Settings size={16} className="mr-1" />
                    <label className="flex items-center cursor-pointer">
                        <span className={`mr-2 text-sm ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Show Subtitles</span>
                        <input
                        type="checkbox"
                        checked={showSubtitles}
                        onChange={() => setShowSubtitles(!showSubtitles)}
                        className="form-checkbox h-4 w-4 text-purple-500"
                        />
                    </label>
                    </div>
                </div>
                
                <button
                    onClick={generateVideo}
                    disabled={isGenerating || !simplifiedText || !audioUrl || images.length === 0}
                    className={`w-full p-3 rounded-lg flex items-center justify-center transition-colors ${
                    isGenerating || !simplifiedText || !audioUrl || images.length === 0
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : theme === 'dark' ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                >
                    {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Generating...</span>
                    </>
                    ) : (
                    <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Generate Video</span>
                    )}
                </button>
                </motion.div>
                
                {/* Video Display */}
                {videos.length > 0 && (
                <motion.div variants={itemVariants} className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                    Your Videos
                    </h2>
                    
                    <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    {currentVideo && (
                        <div className="relative">
                        <video 
                            controls
                            className="w-full h-auto"
                            src={currentVideo.url}
                            >
                            Your browser does not support the video tag.
                        </video>
                        </div>
                    )}
                    
                    <div className={`p-4 flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                        <p className={`font-medium ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                            {currentVideo?.name || 'No video selected'}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {currentVideo 
                            ? new Date(currentVideo.time).toLocaleString() 
                            : ''}
                        </p>
                        </div>
                        
                        <button
                        onClick={downloadVideo}
                        disabled={!currentVideo}
                        className={`flex items-center py-2 px-4 rounded transition-colors ${
                            !currentVideo
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                            : theme === 'dark' ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        >
                        <Download size={16} className="mr-1" />
                        <span className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>Download</span>
                        </button>
                    </div>
                    </div>
                    
                    {videos.length > 1 && (
                    <div className="mt-4">
                        <h3 className={`text-lg font-medium mb-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                        Previous Videos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {videos.slice(1).map((video) => (
                            <div
                            key={video.name}
                            className={`p-2 rounded-lg cursor-pointer border transition-colors ${
                                currentVideo?.name === video.name 
                                ? theme === 'dark' ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50' 
                                : theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-purple-300'
                            }`}
                            onClick={() => setCurrentVideo(video)}
                            >
                            <p className={`font-medium truncate ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                                {video.name}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(video.time).toLocaleString()}
                            </p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </motion.div>
                )}
                
                {/* Help Text */}
                <motion.div 
                variants={itemVariants} 
                className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                >
                <p className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                    Generate videos from your simplified text, audio narration, and images.
                </p>
                <p className={`mt-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
                    <span className="inline-flex items-center">
                    <CheckCircle size={16} className="mr-1 text-green-500" />
                    First simplify text, create audio, and upload images - then generate your video.
                    </span>
                </p>
                </motion.div>
            </motion.div>
            </main>
        </div>
        </div>
    );
    }