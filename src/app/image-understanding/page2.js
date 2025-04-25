'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Download, Sparkles, 
  Loader2, RefreshCw, AlertCircle, Settings
} from 'lucide-react';

export default function ImageGenerationTab({ theme, isDyslexiaFriendly }) {
  const [selectedOption, setSelectedOption] = useState('previous');
  const [previousText, setPreviousText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [newText, setNewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingText, setIsFetchingText] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState('');
  const [imageCount, setImageCount] = useState(4); // Default image count
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);
  
  // Fetch previous text when selectedOption is 'previous'
  useEffect(() => {
    if (selectedOption === 'previous') {
      fetchPreviousText();
    }
  }, [selectedOption]);
  
  const fetchPreviousText = async () => {
    setIsFetchingText(true);
    try {
      console.log('Fetching previous text...');
      const response = await fetch('/api/get-previous-text');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch previous text: ${response.status}`);
      }
      
      
      const data = await response.json();
    console.log('Fetched data:', data);
    if (data.text && data.text.trim()) {
      setPreviousText(data.text);
    } else {
      setPreviousText('No simplified text found. Please go to the Text Simplification page and process some text first.');
    }
  } catch (error) {
    console.error('Error fetching previous text:', error);
    setPreviousText(`Failed to load previous text. Error: ${error.message}`);
  } finally {
    setIsFetchingText(false);
  }
};
  
  const handleTextFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewText(e.target.result);
      };
      reader.readAsText(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewText(e.target.result);
      };
      reader.readAsText(file);
    }
  };
  
  const generateImages = async () => {
    setError('');
    setIsLoading(true);
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedImages([]);
    
    try {
      const textToUse = selectedOption === 'previous' ? previousText : newText;
      
      if (!textToUse || textToUse.trim() === '') {
        throw new Error('Please provide text to generate images from.');
      }
      
      console.log(`About to request ${imageCount} images for text: ${textToUse.substring(0, 50)}...`);
      
      // Create loading placeholders
      const loadingPlaceholders = Array(imageCount).fill().map((_, index) => ({
        id: `loading-${index}`,
        url: `/api/placeholder/${400 + (index % 3) * 50}/${300 + (index % 2) * 50}?text=Generating...`,
        alt: `Generating image ${index + 1}...`,
        isLoading: true
      }));
      setGeneratedImages(loadingPlaceholders);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + Math.random() * 8;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 1000);
      
      try {
        // Prepare the request body properly
        const requestBody = {
          text: textToUse,
          count: imageCount  // Add this line to pass the selected count
        };

        // Call our backend API which will handle the Clipdrop request
        const response = await fetch('/api/generate-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        console.log('Sending request with body:', JSON.stringify(requestBody));

        
        clearInterval(progressInterval);  
        setGenerationProgress(100);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Error status: ${response.status}` }));
          throw new Error(errorData.error || `Failed to generate images: ${response.status}`);
        }
       
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.images && data.images.length > 0) {
          // Format the received images
          setGeneratedImages(data.images.map(img => ({
            ...img,
            alt: `Clipdrop generated image based on your text`,
            isLoading: false
          })));
        } else {
          throw new Error('No images were generated by the API.');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        clearInterval(progressInterval);
        setGenerationProgress(0);
        throw new Error(`Failed to generate images: ${apiError.message}`);
      }
      
    } catch (error) {
      console.error('Error generating images:', error);
      setError(error.message || 'Failed to generate images. Please try again.');
      setGeneratedImages([]);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };
  
  const renderProgressBar = () => {
    if (!isGenerating) return null;
    
    return (
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {/* Generating {imageCount} images with Clipdrop... */}
            Generating images 
          </span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {Math.round(generationProgress)}%
          </span>
        </div>
        <div 
          className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
        >
          <div 
            className={`h-full transition-all duration-300 ease-out ${
              theme === 'dark' ? 'bg-purple-600' : 'bg-blue-500'
            }`}
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      </div>
    );
  };
  
  const handleDownloadImage = (imageUrl, index) => {
    // For data URL images
    if (imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `clipdrop-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // For regular URL images
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clipdrop-image-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading image:', error);
        setError('Failed to download image. Please try again.');
      });
  };

  const downloadAllImages = () => {
    if (generatedImages.length === 0) return;
    
    generatedImages.forEach((image, index) => {
      if (!image.isLoading) {
        setTimeout(() => {
          handleDownloadImage(image.url, index);
        }, index * 500); // Stagger downloads to prevent browser issues
      }
    });
  };
  
  return (
    <div className={`p-8 ${theme === 'dark' ? 'text-gray-200' : ''}`}>
      {/* Option Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Text Source
          </label>
          <button
            type="button"
            className={`
              text-sm px-3 py-1 rounded-md flex items-center gap-1
              ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
            `}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={14} />
            Settings
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`
              px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2
              ${selectedOption === 'previous' 
                ? `${theme === 'dark' 
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-opacity-50' 
                  : 'bg-blue-500 text-white ring-2 ring-blue-300'}`
                : `${theme === 'dark' 
                  ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            `}
            onClick={() => setSelectedOption('previous')}
          >
            <FileText size={16} />
            Use Previous Text
          </button>
          <button
            type="button"
            className={`
              px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2
              ${selectedOption === 'new' 
                ? `${theme === 'dark' 
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-opacity-50' 
                  : 'bg-blue-500 text-white ring-2 ring-blue-300'}`
                : `${theme === 'dark' 
                  ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            `}
            onClick={() => setSelectedOption('new')}
          >
            <Upload size={16} />
            Add New Text
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className={`
          mb-8 p-6 rounded-lg shadow-sm
          ${theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}
        `}>
          <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Generation Settings
          </h3>
          <div>
            <label className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Number of Images to Generate: {imageCount}
            </label>
            <input 
              type="range" 
              min="1" 
              max="30"
              value={imageCount} 
              onChange={(e) => setImageCount(parseInt(e.target.value))}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>1</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Previous Text Display */}
      {selectedOption === 'previous' && (
        <div className="mb-8">
          <div className={`
            p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} 
            border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} 
            shadow-sm
          `}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Previous Text Content
              </h3>
              <button
                type="button"
                className={`text-sm px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                onClick={fetchPreviousText}
              >
                <RefreshCw size={14} className="inline mr-1" />
                Refresh
              </button>
            </div>
            <div className={`
              p-4 rounded-md min-h-40 max-h-60 overflow-y-auto
              ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}
              ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}
            `}>
              {isFetchingText ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                previousText || 'No previous text found.'
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* New Text Input */}
      {selectedOption === 'new' && (
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Enter or Upload Text
              </label>
              <button
                type="button"
                className={`text-sm px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Upload size={14} className="inline mr-1" />
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                className="hidden"
                onChange={handleTextFileUpload}
              />
            </div>
            <div 
              className={`
                mt-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} 
                border rounded-lg transition-all
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <textarea
                className={`
                  w-full px-4 py-3 rounded-lg 
                  ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  ${isDyslexiaFriendly ? 'font-mono tracking-wide' : ''}
                `}
                rows="6"
                placeholder="Enter text here or drag and drop a text file..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              ></textarea>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Supported file formats: .txt, .doc, .docx, .pdf
            </p>
          </div>
        </div>
      )}
      
      {/* Generate Button - UPDATED to use dynamic imageCount */}
      <button
        type="button"
        className={`
          w-full inline-flex justify-center items-center px-6 py-3 border border-transparent 
          text-base font-medium rounded-lg shadow-sm text-white transition-colors 
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500'} 
          focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        `}
        onClick={generateImages}
        disabled={isLoading || (selectedOption === 'new' && !newText.trim())}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating images...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Images
          </>
        )}
      </button>
      
      {renderProgressBar()}
      
      {/* Error Display */}
      {error && (
        <div className={`
          mt-4 p-3 rounded-md flex items-center gap-2
          ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}
        `}>
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Generated Images Display */}
      {generatedImages.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
               Generated Images ({generatedImages.length})
            </h3>
            {generatedImages.length > 1 && (
              <button
                type="button"
                className={`
                  text-sm px-4 py-2 rounded-md flex items-center gap-2
                  ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
                `}
                onClick={downloadAllImages}
              >
                <Download size={16} />
                Download All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {generatedImages.map((image, index) => (
              <div 
                key={image.id || `image-${index}`}
                className={`
                  rounded-lg overflow-hidden shadow-md 
                  ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}
                  border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}
                `}
              >
                <div className="relative w-full h-48">
                  {image.isLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">Generating with Clipdrop...</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      // alt={image.alt || `Generated image ${index + 1}`}
                      alt={image.alt || 'Generated Image'}
                      className="w-full h-full object-contain transition-opacity hover:opacity-90"
                      onError={(e) => {
                        console.error("Image failed to load:", image.url);
                        e.target.onerror = null;
                        e.target.src = `/api/placeholder/400/300?text=Error loading`;
                      }}
                    />
                  )}
                </div>
                <div className="p-3">
                  <button
                    type="button"
                    className={`
                      w-full flex items-center justify-center gap-2 px-4 py-2 
                      text-sm font-medium rounded-md transition-colors
                      ${theme === 'dark' 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                    `}
                    onClick={() => handleDownloadImage(image.url, index)}
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}