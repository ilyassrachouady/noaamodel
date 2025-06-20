import React, { useEffect, useState } from 'react';
import { Search, Fish, Target, MapPin, Clock, Download, Filter, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { S3Service } from '../services/s3Service';
import { CSVService } from '../services/csvService';
import { format } from 'date-fns';

const DetectionAnalyzer: React.FC = () => {
  const { 
    rawFiles, setRawFiles, 
    detections, setDetections, 
    matchedFiles, setMatchedFiles,
    isLoading, setIsLoading, 
    error, setError,
    filters, setFilters 
  } = useData();

  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    loadDataAndAnalyze();
  }, []);

  const loadDataAndAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load raw files and detections in parallel
      const [files, detectionData] = await Promise.all([
        S3Service.fetchFileList(),
        CSVService.generateMockDetections() // Using mock data for demo
      ]);

      setRawFiles(files);
      setDetections(detectionData);

      // Match files with detections
      const matched = files
        .map(file => {
          const detection = detectionData.find(d => d.filename === file.filename);
          return detection ? { ...file, detection } : null;
        })
        .filter(Boolean) as any[];

      setMatchedFiles(matched);
      setAnalysisComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = matchedFiles.filter(file => 
    file.detection.sardine_density >= filters.minDensity &&
    file.detection.confidence >= filters.minConfidence
  ).sort((a, b) => {
    const aVal = a.detection[filters.sortBy];
    const bVal = b.detection[filters.sortBy];
    const multiplier = filters.sortOrder === 'desc' ? -1 : 1;
    return (aVal > bVal ? 1 : -1) * multiplier;
  });

  const stats = {
    totalFiles: rawFiles.length,
    detectedFiles: matchedFiles.length,
    highConfidence: matchedFiles.filter(f => f.detection.confidence > 0.8).length,
    avgDensity: matchedFiles.length > 0 
      ? matchedFiles.reduce((sum, f) => sum + f.detection.sardine_density, 0) / matchedFiles.length 
      : 0
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-4">Analyzing Dataset...</h2>
        <p className="text-white/70">Loading files and matching with species detections</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <Search className="h-16 w-16 text-teal-300 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mb-4">Sardine Detection Analyzer</h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          AI-powered analysis matching EK80 acoustic files with species detection data
        </p>
      </div>

      {/* Analysis Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <Fish className="h-6 w-6 text-blue-300" />
            <span className="text-white/80 font-medium">Total Files</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalFiles}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="h-6 w-6 text-teal-300" />
            <span className="text-white/80 font-medium">Detections</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.detectedFiles}</div>
          <div className="text-sm text-teal-300">
            {((stats.detectedFiles / stats.totalFiles) * 100).toFixed(1)}% match rate
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-6 w-6 text-green-300" />
            <span className="text-white/80 font-medium">High Confidence</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.highConfidence}</div>
          <div className="text-sm text-green-300">&gt;80% confidence</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <Fish className="h-6 w-6 text-cyan-300" />
            <span className="text-white/80 font-medium">Avg Density</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {(stats.avgDensity * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-teal-300" />
          <h3 className="text-lg font-semibold text-white">Analysis Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Min Density: {(filters.minDensity * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minDensity}
              onChange={(e) => setFilters({...filters, minDensity: parseFloat(e.target.value)})}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Min Confidence: {(filters.minConfidence * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minConfidence}
              onChange={(e) => setFilters({...filters, minConfidence: parseFloat(e.target.value)})}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="density">Sardine Density</option>
              <option value="confidence">Confidence</option>
              <option value="timestamp">Timestamp</option>
              <option value="filename">Filename</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({...filters, sortOrder: e.target.value as any})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detection Results */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Fish className="h-6 w-6 text-teal-300" />
            <span>Sardine Detection Results ({filteredMatches.length} files)</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Filename</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Timestamp</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Density</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Confidence</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Location</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((file, index) => (
                <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-mono text-sm">{file.filename}</span>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {format(new Date(file.detection.timestamp), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-teal-400 to-blue-400 h-2 rounded-full"
                          style={{ width: `${file.detection.sardine_density * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {(file.detection.sardine_density * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.detection.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                      file.detection.confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {(file.detection.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {file.detection.latitude && file.detection.longitude ? (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{file.detection.latitude.toFixed(2)}, {file.detection.longitude.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-white/40">No location</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="flex items-center space-x-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                      >
                        <Download className="h-3 w-3" />
                        <span>Raw</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMatches.length === 0 && analysisComplete && (
        <div className="text-center py-12">
          <Fish className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
          <p className="text-white/70">Try adjusting your filters to see more results</p>
        </div>
      )}
    </div>
  );
};

export default DetectionAnalyzer;