// src/app/chat-with-ai/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, ArrowLeft, Sparkles, Paperclip, 
  Mic, Moon, Sun, Download, Brain, PanelLeftOpen, 
  PanelLeftClose, MessageCircle, User, Loader, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function ChatWithAI() {
  const [theme, setTheme] = useState('light');
  const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);
  const [fontZoom, setFontZoom] = useState(100);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'assistant', 
      content: "Hello! I'm your AI assistant. I can help simplify content, explain concepts, or answer questions about accessibility. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const [apiStatus, setApiStatus] = useState({
    isInitialized: false,
    isConnected: false,
    error: null,
    displayMessage: null
  });
  const geminiRef = useRef(null);
  
// Initialize Gemini API
useEffect(() => {
  async function initializeGemini() {
    try {
      console.log("Initializing Gemini API...");
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        console.error("API key is missing or invalid");
        setApiStatus({
          isInitialized: false,
          isConnected: false,
          error: "Missing API key",
          displayMessage: "API key not configured. Please add your Gemini API key to .env.local"
        });
        return;
      }
      
      // Initialize the Gemini API client
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      try {
        // First, try to list available models
        console.log("Fetching available models...");
        const modelList = await genAI.listModels();
        console.log("Available models:", modelList);
        
        // Find a suitable model for text generation
        let modelName = null;
        
        // Look for models in this priority order
        const preferredModels = [
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-pro",
          "gemini-1.0-pro"
        ];
        
        // Find the first available preferred model
        for (const model of preferredModels) {
          if (modelList.models.some(m => m.name.includes(model))) {
            modelName = model;
            console.log(`Found preferred model: ${modelName}`);
            break;
          }
        }
        
        // If no preferred model is found, use the first text model available
        if (!modelName) {
          const textModel = modelList.models.find(m => 
            !m.name.includes('vision') && 
            m.supportedGenerationMethods.includes('generateContent')
          );
          
          if (textModel) {
            modelName = textModel.name.split('/').pop();
            console.log(`Using available text model: ${modelName}`);
          }
        }
        
        if (!modelName) {
          throw new Error("No suitable text generation models found");
        }
        
        // Initialize with the found model
        const model = genAI.getGenerativeModel({ model: modelName });
        geminiRef.current = model;
        
        // Test the API with a simple query
        const result = await model.generateContent("Respond with 'Connected' if you can receive this message.");
        const text = result.response.text();
        
        if (text.includes("Connected")) {
          console.log("Gemini API connected successfully using model:", modelName);
          setApiStatus({
            isInitialized: true,
            isConnected: true,
            error: null,
            displayMessage: null
          });
        } else {
          throw new Error("Unexpected response from API");
        }
      } catch (listError) {
        console.error("Error listing models or testing:", listError);
        
        // Fall back to trying specific model names directly
        console.log("Falling back to direct model testing...");
        
        const modelNames = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];
        let connectedModel = null;
        
        for (const name of modelNames) {
          try {
            console.log(`Trying model: ${name}`);
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("Respond with 'Connected' if you can receive this message.");
            const text = result.response.text();
            
            if (text.includes("Connected")) {
              console.log(`Successfully connected using model: ${name}`);
              geminiRef.current = model;
              connectedModel = name;
              break;
            }
          } catch (err) {
            console.log(`Failed to connect using model: ${name}`);
          }
        }
        
        if (connectedModel) {
          setApiStatus({
            isInitialized: true,
            isConnected: true,
            error: null,
            displayMessage: null
          });
        } else {
          // All attempts failed
          setApiStatus({
            isInitialized: true,
            isConnected: false,
            error: "All model connection attempts failed",
            displayMessage: "Could not connect to any available AI models"
          });
        }
      }
    } catch (error) {
      console.error("Failed to initialize Gemini API:", error);
      setApiStatus({
        isInitialized: false,
        isConnected: false,
        error: error.message,
        displayMessage: "Failed to connect to Gemini API. Check console for details."
      });
    }
  }
  
  initializeGemini();
}, []);
  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedDyslexiaMode = localStorage.getItem('dyslexiaMode') === 'true';
    const savedFontZoom = localStorage.getItem('fontZoom') || '100';
    
    setTheme(savedTheme);
    setIsDyslexiaFriendly(savedDyslexiaMode);
    setFontZoom(parseInt(savedFontZoom));
    
    // Apply theme to document body as well for full-page theming
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme to document body as well for full-page theming
    document.body.classList.toggle('dark-theme', newTheme === 'dark');
  };

  const toggleDyslexiaFriendly = () => {
    const newMode = !isDyslexiaFriendly;
    setIsDyslexiaFriendly(newMode);
    localStorage.setItem('dyslexiaMode', newMode.toString());
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? fontZoom + 10 : fontZoom - 10;
    const clampedZoom = Math.max(80, Math.min(150, newZoom));
    setFontZoom(clampedZoom);
    localStorage.setItem('fontZoom', clampedZoom.toString());
  };

  // Generate a context string from previous messages
  const generateContextFromMessages = () => {
    const lastFewMessages = messages.slice(-5); // Get the last 5 messages
    return lastFewMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    const userMessage = userInput.trim();
    const newUserMessage = {
      id: messages.length + 1,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsProcessing(true);
    
    // Create context from previous messages
    const conversationContext = generateContextFromMessages();
    
    try {
      let responseText;
      
      // Check if we have a working API connection
      if (apiStatus.isConnected && geminiRef.current) {
        console.log("Sending message to Gemini API", {
          userMessage,
          conversationContext
        });
        
        try {
          // Build a prompt that includes conversation context and accessibility instructions
          const prompt = `
  You are an AI assistant specialized in accessibility and creating inclusive content. 
  Your goal is to help users understand and implement accessible design principles, 
  simplify complex content, and make information more accessible to people with various disabilities.
  
  Previous conversation:
  ${conversationContext}
  
  User's latest message: ${userMessage}
  
  Please provide a concise and brief response. Provide helpful, practical advice with specific examples when possible.`;
          
          // Generate content with the prompt - direct approach
          const result = await geminiRef.current.generateContent(prompt);
          responseText = result.response.text();
          console.log("Received response from Gemini API:", responseText);
          
          // If the response is empty, throw an error
          if (!responseText || responseText.trim() === '') {
            throw new Error("Empty response from API");
          }
        } catch (apiError) {
          console.error("API request failed:", apiError);
          
          // Try again with a simpler prompt if we got a complex error
          try {
            const result = await geminiRef.current.generateContent(`Help with this accessibility question: ${userMessage}`);
            responseText = result.response.text();
            
            if (!responseText || responseText.trim() === '') {
              throw new Error("Empty response from API");
            }
          } catch (retryError) {
            console.error("Retry API request failed:", retryError);
            // Use intelligent fallback
            responseText = getIntelligentFallbackResponse(userMessage);
          }
        }
      } else {
        // Use intelligent fallback when API is unavailable
        console.log("API not connected. Using fallback response.");
        responseText = getIntelligentFallbackResponse(userMessage);
      }
      
      // Add the response to messages
      const newAIMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAIMessage]);
    } catch (error) {
      console.error("Error handling submission:", error);
      
      // Add a friendly error message
      const errorResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: "I'm having trouble generating a response right now. Could you try asking your question again, perhaps with different wording?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };
  // Get a more intelligent fallback response based on the question
  const getIntelligentFallbackResponse = (userMessage) => {
    const lowercaseInput = userMessage.toLowerCase();
    
    // Check for specific accessibility principles question
    if (lowercaseInput.includes('princip') && 
        (lowercaseInput.includes('accessib') || lowercaseInput.includes('design'))) {
      return `
The key principles of accessible design include:

1. Perceivable: Information must be presentable in ways all users can perceive, including alternatives for text, audio, and visual content.

2. Operable: User interface components must be operable by everyone, including keyboard accessibility and enough time to read content.

3. Understandable: Information and interface operation must be understandable, with readable text and predictable functionality.

4. Robust: Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

These principles form the foundation of the Web Content Accessibility Guidelines (WCAG), which are internationally recognized standards for web accessibility.

Would you like me to explain any of these principles in more detail?`;
    }
    
    // Check for color contrast questions
    if (lowercaseInput.includes('color') && 
        (lowercaseInput.includes('contrast') || lowercaseInput.includes('accessibility'))) {
      return `
Color contrast is crucial for accessibility. Here are the key guidelines:

1. Text contrast: Maintain a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text against its background.

2. Don't rely solely on color: Always provide additional indicators beyond color (like patterns, icons, or text) to convey information.

3. Color blindness considerations: Ensure your design works for various types of color blindness by avoiding problematic color combinations.

4. Tools for checking: Use tools like WebAIM's Contrast Checker or the Accessible Color Matrix to verify your color choices.

Would you like some specific examples of accessible color combinations?`;
    }
    
    // Check for screen reader questions
    if (lowercaseInput.includes('screen reader') || 
        lowercaseInput.includes('blind') || 
        lowercaseInput.includes('visual impairment')) {
      return `
To make content accessible to screen reader users:

1. Use proper HTML semantics: Structure your content with semantic HTML elements like <header>, <nav>, <main>, <section>, etc.

2. Add descriptive alt text to images: Describe the purpose and content of images.

3. Create accessible forms: Label form fields properly and provide clear error messages.

4. Ensure keyboard navigation: Make sure all functionality can be accessed using only a keyboard.

5. Use ARIA attributes when necessary: ARIA roles, states, and properties can enhance accessibility when standard HTML isn't sufficient.

Would you like more specific information about any of these techniques?`;
    }
    
    // Check for dyslexia questions
    if (lowercaseInput.includes('dyslex') || lowercaseInput.includes('reading difficult')) {
      return `
For creating dyslexia-friendly content:

1. Use sans-serif fonts like Arial, Open Sans, or specifically designed fonts like OpenDyslexic.

2. Increase text size (at least 12pt) and line spacing (1.5x is recommended).

3. Use left-aligned text rather than justified text which creates uneven spacing.

4. Avoid italics, underlining, and ALL CAPS, which can make text harder to read.

5. Break content into smaller chunks with clear headings and use bulleted lists when possible.

6. Ensure good contrast but consider that bright white backgrounds can cause visual stress.

Would you like more specific recommendations for making your content dyslexia-friendly?`;
    }
    
    // Default response for any other accessibility questions
    return `
When designing for accessibility, consider these key areas:

1. Visual: Support users with vision impairments through proper contrast, scalable text, and screen reader compatibility.

2. Auditory: Provide captions and transcripts for audio content.

3. Motor: Ensure all functionality works with keyboard-only navigation and supports various input methods.

4. Cognitive: Create clear layouts, consistent navigation, and plain language content.

For comprehensive guidance, reference the Web Content Accessibility Guidelines (WCAG), which provide testable success criteria across these areas.

Could you tell me more specifically what aspect of accessibility you're most interested in?`;
  };

  const setPrompt = (prompt) => {
    setUserInput(prompt);
    toggleSidebar();
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-indigo-50 to-white text-gray-900'}`}>
      {/* Header stays the same */}
      <header className={`py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50 backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
          </motion.button>

          <Link href="/" className="flex items-center gap-2">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} flex items-center gap-1`}
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </motion.div>
          </Link>

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

      {/* Sidebar with API status indicator */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black z-40"
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 0.5, display: "block" },
            closed: { opacity: 0, display: "none" }
          }}
          onClick={toggleSidebar}
        ></motion.div>

        <motion.aside
          className={`fixed left-0 top-0 h-full w-80 pt-20 z-40 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
          variants={{
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
          }}
        >
          <div className="px-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold mb-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              Chat with AI
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}>
              Get help with content accessibility
            </p>
            
            {/* API Status indicator */}
            <div className={`mt-3 p-2 rounded-md flex items-center gap-2 ${
              apiStatus.isConnected 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
            }`}>
              {apiStatus.isConnected 
                ? <div className="h-2 w-2 rounded-full bg-green-500"></div>
                : <AlertTriangle size={16} />
              }
              <span className="text-xs font-medium">
                {apiStatus.isConnected 
                  ? "Connected to Gemini API" 
                  : apiStatus.displayMessage || "API not connected - using fallback responses"
                }
              </span>
            </div>
          </div>

          <div className="py-4 px-4">
            <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                Suggested Prompts
              </h4>
              <div className="space-y-2">
                {
                  [
                    "What are the key principles of accessible design?", 
                    "How can I make my website more dyslexia-friendly?", 
                    "Explain WCAG guidelines in simple terms", 
                    "Tips for creating screen reader friendly content"
                  ].map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ x: 3 }}
                      onClick={() => setPrompt(prompt)}
                      className={`w-full text-left p-2 rounded-md text-sm ${theme === 'dark' ? 'hover:bg-gray-600 bg-gray-800' : 'hover:bg-indigo-100 bg-white'}`}
                    >
                      {prompt}
                    </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2 px-1">
                <MessageCircle size={18} className="text-indigo-500" />
                Recent Conversations
              </h4>
              <p className="text-sm text-gray-500 italic px-1">No recent conversations</p>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Chat Interface */}
      <main className="container mx-auto px-4 py-4 max-w-4xl flex flex-col" style={{ height: "calc(100vh - 73px)" }}>
        <div className="mb-4 flex justify-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xl font-semibold flex items-center gap-2 ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}
            style={{ fontSize: `calc(1.25rem * ${fontZoom/100})` }}
          >
            <MessageCircle className="text-indigo-500" size={20} />
            Chat with AI Assistant
          </motion.h2>
        </div>

        {/* Messages Container */}
        <motion.div 
          className={`flex-1 overflow-y-auto mb-4 rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.5 }
                }
              }}
              className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user' 
                ? `${theme === 'dark' ? 'bg-indigo-700' : 'bg-indigo-500'} text-white` 
                : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded-full ${message.role === 'user' 
                    ? 'bg-indigo-400' 
                    : `${theme === 'dark' ? 'bg-gray-600' : 'bg-indigo-100'}`}`}
                  >
                    {message.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                  </div>
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-xs opacity-70 ml-auto">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <p className={`${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}`}
                   style={{ fontSize: `calc(1rem * ${fontZoom/100})` }}
                >
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className={`max-w-[80%] rounded-2xl p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-indigo-100'}`}>
                    <Sparkles size={14} />
                  </div>
                  <span className="text-xs font-medium">AI Assistant</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm opacity-70">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Chat Input Form */}
        <motion.form 
          onSubmit={handleSubmit}
          className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <button 
              type="button"
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Attach file"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder="Type your message here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-full border ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''} ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-100 border-gray-200 text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              style={{ fontSize: `calc(1rem * ${fontZoom/100})` }}
            />
            <button 
              type="button"
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Voice input"
            >
              <Mic size={20} />
            </button>
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!userInput.trim() || isProcessing}
              className={`p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white ${(!userInput.trim() || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send size={20} />
            </motion.button>
          </div>
        </motion.form>
      </main>

      {/* Add global style for dark theme */}
      <style jsx global>{`
        body.dark-theme {
          background-color: #111827;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}