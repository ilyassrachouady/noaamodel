import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Fish } from 'lucide-react';
import { useApp } from '../context/AppContext';

const UploadPage: React.FC = () => {
  const { uploadedFile, setUploadedFile, setAnalysisData } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [filePreview, setFilePreview] = useState<string>('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const preview = lines.slice(0, 10).join('\n');
      setFilePreview(preview);

      // Parse CSV and create mock analysis data
      const mockData = [
        {
          filename: 'D20210815-T093000.raw',
          timestamp: '2021-08-15T09:30:00Z',
          sardineDensity: 0.75,
          confidence: 0.89,
          location: { lat: 32.8, lon: -117.2 }
        },
        {
          filename: 'D20210815-T103000.raw',
          timestamp: '2021-08-15T10:30:00Z',
          sardineDensity: 0.92,
          confidence: 0.94,
          location: { lat: 32.7, lon: -117.3 }
        },
        {
          filename: 'D20210815-T113000.raw',
          timestamp: '2021-08-15T11:30:00Z',
          sardineDensity: 0.63,
          confidence: 0.76,
          location: { lat: 32.6, lon: -117.4 }
        }
      ];
      setAnalysisData(mockData);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      setUploadedFile(csvFile);
      setUploadStatus('success');
      processCSVFile(csvFile);
    } else {
      setUploadStatus('error');
    }
  }, [setUploadedFile, setAnalysisData]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadedFile(file);
      setUploadStatus('success');
      processCSVFile(file);
    } else {
      setUploadStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Fish className="h-16 w-16 text-teal-300 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mb-4">Upload Detection Data</h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Upload your species detection CSV file containing sardine density measurements and acoustic file references.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-teal-400 bg-teal-400/10'
                : 'border-white/30 hover:border-white/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-white/60 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Drop your CSV file here
            </h3>
            <p className="text-white/70 mb-6">
              Or click to browse files
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer hover:from-teal-600 hover:to-blue-600 transition-all duration-300 inline-block"
            >
              Choose File
            </label>
          </div>

          {/* Upload Status */}
          {uploadStatus === 'success' && uploadedFile && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">File uploaded successfully!</p>
                <p className="text-green-300/80 text-sm">{uploadedFile.name}</p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Please upload a valid CSV file</p>
                <p className="text-red-300/80 text-sm">Only .csv files are supported</p>
              </div>
            </div>
          )}
        </div>

        {/* File Preview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-6 w-6 text-teal-300" />
            <h3 className="text-lg font-semibold text-white">File Preview</h3>
          </div>
          
          {filePreview ? (
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/80 overflow-auto max-h-64">
              <pre>{filePreview}</pre>
            </div>
          ) : (
            <div className="bg-black/20 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">No file uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">CSV File Requirements</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-2">Required Columns:</h4>
            <ul className="text-white/70 space-y-1 text-sm">
              <li>• filename (acoustic file reference)</li>
              <li>• timestamp (ISO format preferred)</li>
              <li>• sardine_density (0.0 to 1.0)</li>
              <li>• confidence (detection confidence)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Optional Columns:</h4>
            <ul className="text-white/70 space-y-1 text-sm">
              <li>• latitude (decimal degrees)</li>
              <li>• longitude (decimal degrees)</li>
              <li>• depth (meters)</li>
              <li>• notes (additional information)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;