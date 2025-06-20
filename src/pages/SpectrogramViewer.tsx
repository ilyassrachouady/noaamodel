import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Eye, Zap, Waves, Play, Pause } from 'lucide-react';
import { useData } from '../context/DataContext';

const SpectrogramViewer: React.FC = () => {
  const { matchedFiles } = useData();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'echogram' | 'spectrogram'>('echogram');
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedMatch = matchedFiles.find(f => f.filename === selectedFile);

  const generateMockSpectrogram = (type: 'echogram' | 'spectrogram') => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      if (type === 'echogram') {
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.3, '#3b82f6');
        gradient.addColorStop(0.6, '#06b6d4');
        gradient.addColorStop(1, '#14b8a6');
      } else {
        gradient.addColorStop(0, '#7c3aed');
        gradient.addColorStop(0.3, '#3b82f6');
        gradient.addColorStop(0.6, '#06b6d4');
        gradient.addColorStop(1, '#10b981');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 400);
      
      // Add noise pattern
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 400;
        const intensity = Math.random() * 0.8 + 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Add sardine school representation
      if (selectedMatch) {
        const density = selectedMatch.detection.sardine_density;
        const schoolWidth = 200 * density;
        const schoolHeight = 60 * density;
        const x = 200 + Math.random() * 300;
        const y = 150 + Math.random() * 100;
        
        // Main school
        ctx.fillStyle = `rgba(255, 215, 0, ${0.6 + density * 0.4})`;
        ctx.fillRect(x, y, schoolWidth, schoolHeight);
        
        // Secondary school
        ctx.fillStyle = `rgba(255, 165, 0, ${0.4 + density * 0.3})`;
        ctx.fillRect(x + 20, y - 20, schoolWidth * 0.7, schoolHeight * 0.5);
      }
    }
    
    return canvas.toDataURL();
  };

  if (matchedFiles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Spectrogram Viewer</h1>
        <p className="text-xl text-white/60 mb-8">
          No detection data available. Please run the analyzer first to generate spectrograms.
        </p>
        <a
          href="/analyzer"
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
        >
          Run Analysis
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <BarChart3 className="h-16 w-16 text-teal-300 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mb-4">Spectrogram Viewer</h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Visualize acoustic signatures and generate labeled spectrograms for machine learning
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* File List */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 sticky top-8">
            <div className="flex items-center space-x-3 mb-6">
              <Waves className="h-6 w-6 text-teal-300" />
              <h3 className="text-lg font-semibold text-white">Detection Files</h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {matchedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    selectedFile === file.filename
                      ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 border-teal-400'
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                  }`}
                  onClick={() => setSelectedFile(file.filename)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-mono text-xs truncate">
                      {file.filename.split('-').pop()?.replace('.raw', '')}
                    </span>
                    <Eye className="h-4 w-4 text-white/60 flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full"
                        style={{ width: `${file.detection.sardine_density * 100}%` }}
                      />
                    </div>
                    <span className="text-white/70 text-xs font-medium">
                      {(file.detection.sardine_density * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      file.detection.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                      file.detection.confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {(file.detection.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="lg:col-span-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {selectedFile ? `Analyzing: ${selectedFile}` : 'Select a file to visualize'}
              </h3>
              
              {selectedFile && (
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('echogram')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'echogram'
                          ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Waves className="h-4 w-4" />
                      <span>Echogram</span>
                    </button>
                    <button
                      onClick={() => setViewMode('spectrogram')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'spectrogram'
                          ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Zap className="h-4 w-4" />
                      <span>Spectrogram</span>
                    </button>
                  </div>

                  {/* Playback Control */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Visualization Content */}
            {selectedFile && selectedMatch ? (
              <div className="space-y-6">
                {/* Main Visualization */}
                <div className="bg-black/30 rounded-xl p-4 aspect-[2/1] flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={generateMockSpectrogram(viewMode)} 
                    alt={`${viewMode} visualization`}
                    className="max-w-full max-h-full rounded-lg border border-white/20"
                  />
                  
                  {/* Overlay Info */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-white text-sm space-y-1">
                      <div>Mode: <span className="text-teal-300 font-medium">{viewMode}</span></div>
                      <div>Density: <span className="text-yellow-300 font-medium">{(selectedMatch.detection.sardine_density * 100).toFixed(0)}%</span></div>
                      <div>Confidence: <span className="text-green-300 font-medium">{(selectedMatch.detection.confidence * 100).toFixed(0)}%</span></div>
                    </div>
                  </div>

                  {/* Progress Bar (when playing) */}
                  {isPlaying && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-teal-400 to-blue-400 h-2 rounded-full animate-pulse" style={{ width: '45%' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                      <Waves className="h-5 w-5 text-teal-300" />
                      <span>Detection Analysis</span>
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Sardine Density:</span>
                        <span className="text-white font-medium">{(selectedMatch.detection.sardine_density * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Confidence Score:</span>
                        <span className="text-white font-medium">{(selectedMatch.detection.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">File Size:</span>
                        <span className="text-white font-medium">{(selectedMatch.size / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                      {selectedMatch.detection.depth && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Depth:</span>
                          <span className="text-white font-medium">{selectedMatch.detection.depth.toFixed(0)}m</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                      <Download className="h-5 w-5 text-blue-300" />
                      <span>Download Options</span>
                    </h4>
                    <div className="space-y-3">
                      <button 
                        onClick={() => window.open(selectedMatch.url, '_blank')}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all"
                      >
                        <Download className="h-4 w-4" />
                        <span>Raw File (.raw)</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20">
                        <Download className="h-4 w-4" />
                        <span>Spectrogram (.png)</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20">
                        <Download className="h-4 w-4" />
                        <span>Training Data (.npy)</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20">
                        <Download className="h-4 w-4" />
                        <span>Metadata (.json)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 rounded-xl p-16 text-center aspect-[2/1] flex items-center justify-center">
                <div>
                  <BarChart3 className="h-20 w-20 text-white/30 mx-auto mb-6" />
                  <p className="text-white/60 text-xl mb-2">Select a detection file to view its spectrogram</p>
                  <p className="text-white/40">Choose from the list on the left to begin visualization</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectrogramViewer;