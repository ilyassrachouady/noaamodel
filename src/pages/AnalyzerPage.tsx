import React, { useState, useEffect } from 'react';
import { Search, Database, CheckCircle, Download, Fish, Clock, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AnalyzerPage: React.FC = () => {
  const { uploadedFile, analysisData, isProcessing, setIsProcessing } = useApp();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [s3Files, setS3Files] = useState<string[]>([]);

  useEffect(() => {
    if (uploadedFile && analysisData.length > 0) {
      // Simulate S3 connection
      setConnectionStatus('connecting');
      setIsProcessing(true);
      
      setTimeout(() => {
        setConnectionStatus('connected');
        setS3Files([
          'D20210815-T093000.raw',
          'D20210815-T103000.raw',
          'D20210815-T113000.raw',
          'D20210815-T120000.raw',
          'D20210815-T130000.raw',
          'D20210816-T090000.raw',
          'D20210816-T100000.raw',
        ]);
        setIsProcessing(false);
      }, 2000);
    }
  }, [uploadedFile, analysisData, setIsProcessing]);

  const matchedFiles = analysisData.filter(data => 
    s3Files.includes(data.filename)
  );

  const handleDownload = (filename: string) => {
    // Simulate file download
    console.log(`Downloading ${filename}`);
    alert(`Download initiated for ${filename}`);
  };

  if (!uploadedFile) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <Fish className="h-16 w-16 text-white/40 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Dataset Analyzer</h1>
        <p className="text-xl text-white/60 mb-8">
          Please upload a CSV file first to begin analysis.
        </p>
        <a
          href="/upload"
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
        >
          Upload File
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <Search className="h-16 w-16 text-teal-300 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mb-4">Dataset Analyzer</h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Analyzing uploaded data and matching with NOAA RL2107 acoustic files.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-6 w-6 text-teal-300" />
            <h3 className="text-lg font-semibold text-white">S3 Connection</h3>
          </div>
          <div className={`flex items-center space-x-2 ${
            connectionStatus === 'connected' ? 'text-green-400' :
            connectionStatus === 'connecting' ? 'text-yellow-400' :
            connectionStatus === 'error' ? 'text-red-400' : 'text-white/60'
          }`}>
            {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5" />}
            {connectionStatus === 'connecting' && <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            <span className="font-medium">
              {connectionStatus === 'idle' && 'Ready to connect'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'error' && 'Connection failed'}
            </span>
          </div>
        </div>

        {/* File Count */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Fish className="h-6 w-6 text-blue-300" />
            <h3 className="text-lg font-semibold text-white">Matched Files</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {matchedFiles.length}
            <span className="text-lg text-white/60 ml-2">/ {analysisData.length}</span>
          </div>
          <p className="text-white/60 text-sm">Files with sardine detections</p>
        </div>

        {/* Processing Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">Processing</h3>
          </div>
          <div className={`flex items-center space-x-2 ${
            isProcessing ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {isProcessing && <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {!isProcessing && <CheckCircle className="h-5 w-5" />}
            <span className="font-medium">
              {isProcessing ? 'Processing...' : 'Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* Matched Files Table */}
      {matchedFiles.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Fish className="h-6 w-6 text-teal-300" />
              <span>Files with Sardine Detections</span>
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
                {matchedFiles.map((file, index) => (
                  <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-mono text-sm">{file.filename}</td>
                    <td className="px-6 py-4 text-white/80 text-sm">
                      {new Date(file.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-teal-400 to-blue-400 h-2 rounded-full"
                            style={{ width: `${file.sardineDensity * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{(file.sardineDensity * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        file.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                        file.confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {(file.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/80 text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{file.location.lat.toFixed(2)}, {file.location.lon.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownload(file.filename)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No matches message */}
      {connectionStatus === 'connected' && matchedFiles.length === 0 && analysisData.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <Fish className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Matching Files</h3>
          <p className="text-white/70">
            No acoustic files in the S3 bucket match your uploaded detection data.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyzerPage;