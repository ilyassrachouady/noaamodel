import React, { useState } from 'react';
import { BarChart3, Download, Eye, Fish, Zap, Waves } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VisualizationPage: React.FC = () => {
  const { analysisData } = useApp();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'echogram' | 'spectrogram'>('echogram');

  const handleVisualize = (filename: string) => {
    setSelectedFile(filename);
  };

  const generateMockEchogram = () => {
    // Generate mock echogram data for visualization
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, '#1e40af');
      gradient.addColorStop(0.3, '#3b82f6');
      gradient.addColorStop(0.6, '#06b6d4');
      gradient.addColorStop(1, '#14b8a6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 200);
      
      // Add some noise pattern
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 400;
        const y = Math.random() * 200;
        const intensity = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Add sardine school representation
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.fillRect(100, 80, 150, 40);
      ctx.fillRect(120, 60, 100, 20);
    }
    
    return canvas.toDataURL();
  };

  if (analysisData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Visualization</h1>
        <p className="text-xl text-white/60 mb-8">
          No data available for visualization. Please upload and analyze a dataset first.
        </p>
        <a
          href="/upload"
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
        >
          Upload Data
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <BarChart3 className="h-16 w-16 text-teal-300 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mb-4">Acoustic Visualization</h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Explore echograms and spectrograms of detected sardine schools in the RL2107 dataset.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* File List */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Fish className="h-6 w-6 text-teal-300" />
              <h3 className="text-lg font-semibold text-white">Detection Files</h3>
            </div>
            
            <div className="space-y-3">
              {analysisData.map((file, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                    selectedFile === file.filename
                      ? 'bg-teal-500/20 border-teal-400'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                  onClick={() => handleVisualize(file.filename)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-mono text-sm truncate">
                      {file.filename}
                    </span>
                    <Eye className="h-4 w-4 text-white/60 flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-12 bg-white/20 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full"
                        style={{ width: `${file.sardineDensity * 100}%` }}
                      />
                    </div>
                    <span className="text-white/70 text-xs">
                      {(file.sardineDensity * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="text-white/60 text-xs">
                    {new Date(file.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {selectedFile ? `Visualizing: ${selectedFile}` : 'Select a file to visualize'}
              </h3>
              
              {selectedFile && (
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('echogram')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'echogram'
                        ? 'bg-teal-500 text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Waves className="h-4 w-4" />
                    <span>Echogram</span>
                  </button>
                  <button
                    onClick={() => setViewMode('spectrogram')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'spectrogram'
                        ? 'bg-teal-500 text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Spectrogram</span>
                  </button>
                </div>
              )}
            </div>

            {/* Visualization Content */}
            {selectedFile ? (
              <div className="space-y-6">
                {/* Mock Visualization */}
                <div className="bg-black/30 rounded-lg p-4 aspect-[2/1] flex items-center justify-center">
                  <img 
                    src={generateMockEchogram()} 
                    alt={`${viewMode} visualization`}
                    className="max-w-full max-h-full rounded-lg border border-white/20"
                  />
                </div>

                {/* File Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Detection Details</h4>
                    {analysisData
                      .filter(file => file.filename === selectedFile)
                      .map((file, index) => (
                        <div key={index} className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Density:</span>
                            <span className="text-white">{(file.sardineDensity * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Confidence:</span>
                            <span className="text-white">{(file.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Location:</span>
                            <span className="text-white">{file.location.lat.toFixed(2)}, {file.location.lon.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Download Options</h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-blue-600 transition-all">
                        <Download className="h-4 w-4" />
                        <span>Raw File (.raw)</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/20">
                        <Download className="h-4 w-4" />
                        <span>Spectrogram (.png)</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/20">
                        <Download className="h-4 w-4" />
                        <span>Metadata (.json)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 rounded-lg p-12 text-center aspect-[2/1] flex items-center justify-center">
                <div>
                  <Fish className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">Select a file from the list to view its visualization</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;