import React, { useEffect, useState, useMemo, useCallback } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Database, Download, Calendar, HardDrive, Search, Filter, Image as ImageIcon, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { S3Service } from '../services/s3Service';
import { format } from 'date-fns';

const DatasetBrowser: React.FC = () => {
  const { rawFiles, setRawFiles, isLoading, setIsLoading, error, setError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedDateObject, setSelectedDateObject] = useState<Date | null>(null);
  const [timeFilter, setTimeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState(new Set<string>());
  const filesPerPage = 20;

  // Echogram specific state
  const [echogramModalOpen, setEchogramModalOpen] = useState(false);
  const [echogramImageUrl, setEchogramImageUrl] = useState<string | null>(null);
  const [echogramLoadingFor, setEchogramLoadingFor] = useState<string | null>(null);
  const [echogramError, setEchogramError] = useState<string | null>(null);


  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await S3Service.fetchFileList();
      setRawFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setRawFiles]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = useMemo(() => rawFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || (file.parsedDate === dateFilter);
    let matchesTime = true;
    if (dateFilter && timeFilter) {
      matchesTime = file.parsedTime.startsWith(timeFilter);
    }
    return matchesSearch && matchesDate && matchesTime;
  }), [rawFiles, searchTerm, dateFilter, timeFilter]);

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const paginatedFiles = useMemo(() => filteredFiles.slice(startIndex, startIndex + filesPerPage), [filteredFiles, startIndex, filesPerPage]);

  const handleDownload = (file: any) => {
    window.open(file.url, '_blank');
  };

  const handleGenerateEchogram = async (file: RawFile) => {
    setEchogramLoadingFor(file.filename);
    setEchogramError(null);
    setEchogramImageUrl(null); // Clear previous image

    try {
      const blob = await S3Service.generateEchogram(file.cruise, file.filename);
      const imageUrl = URL.createObjectURL(blob);
      setEchogramImageUrl(imageUrl);
      setEchogramModalOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate echogram';
      setEchogramError(errorMessage);
      // Optionally, open modal to show error, or use a toast
      setEchogramModalOpen(true);
    } finally {
      setEchogramLoadingFor(null);
    }
  };

  const closeEchogramModal = () => {
    setEchogramModalOpen(false);
    if (echogramImageUrl) {
      URL.revokeObjectURL(echogramImageUrl);
      setEchogramImageUrl(null);
    }
    setEchogramError(null); // Clear error when closing modal
  };


  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (event.target.checked) {
      paginatedFiles.forEach(file => newSelectedFiles.add(file.filename));
    } else {
      paginatedFiles.forEach(file => newSelectedFiles.delete(file.filename));
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleSelectFile = (filename: string, isSelected: boolean) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (isSelected) {
      newSelectedFiles.add(filename);
    } else {
      newSelectedFiles.delete(filename);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleDownloadSelected = () => {
    selectedFiles.forEach(filename => {
      const fileToDownload = rawFiles.find(rawFile => rawFile.filename === filename);
      if (fileToDownload) {
        const link = document.createElement('a');
        link.href = fileToDownload.url;
        link.setAttribute('download', fileToDownload.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-4">Loading Dataset...</h2>
        <p className="text-white/70">Fetching EK80 acoustic files from NOAA S3 bucket</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Dataset</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={loadFiles}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <Database className="h-16 w-16 text-teal-300 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mb-4">EK80 Dataset Browser</h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Browse and download acoustic .raw files from the NOAA Reuben Lasker RL2107 cruise dataset
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <Database className="h-6 w-6 text-teal-300" />
            <span className="text-white/80 font-medium">Total Files</span>
          </div>
          <div className="text-3xl font-bold text-white">{rawFiles.length}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <HardDrive className="h-6 w-6 text-blue-300" />
            <span className="text-white/80 font-medium">Total Size</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {S3Service.formatFileSize(rawFiles.reduce((sum, file) => sum + file.size, 0))}
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="h-6 w-6 text-cyan-300" />
            <span className="text-white/80 font-medium">Date Range</span>
          </div>
          <div className="text-lg font-bold text-white">Aug 2021</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-teal-300" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Search Files</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by filename..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Filter by Date</label>
            <DatePicker
              selected={selectedDateObject}
              onChange={(date: Date | null) => {
                setSelectedDateObject(date);
                if (date) {
                  const year = date.getFullYear();
                  const month = (date.getMonth() + 1).toString().padStart(2, '0');
                  const day = date.getDate().toString().padStart(2, '0');
                  setDateFilter(`${year}-${month}-${day}`);
                } else {
                  setDateFilter("");
                }
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              isClearable={true}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-white/60"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Filter by Time</label>
            <input
              type="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">
            Raw Files ({filteredFiles.length} found)
          </h3>
          <button
            onClick={handleDownloadSelected}
            disabled={selectedFiles.size === 0}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>Download Selected ({selectedFiles.size})</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-4 text-left text-white/80 font-medium">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-teal-400 bg-white/10 border-white/30 rounded focus:ring-teal-500"
                    checked={paginatedFiles.length > 0 && paginatedFiles.every(file => selectedFiles.has(file.filename))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Filename</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Date</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Time</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Size</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiles.map((file, index) => (
                <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-teal-400 bg-white/10 border-white/30 rounded focus:ring-teal-500"
                      checked={selectedFiles.has(file.filename)}
                      onChange={(e) => handleSelectFile(file.filename, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-mono text-sm">{file.filename}</span>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {file.parsedDate ? format(new Date(file.parsedDate + 'T00:00:00'), 'dd/MM/yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {file.parsedTime || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {S3Service.formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(file)}
                        title="Download .raw file"
                        className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      {file.filename.toLowerCase().endsWith('.raw') && (
                        <button
                          onClick={() => handleGenerateEchogram(file)}
                          disabled={echogramLoadingFor !== null}
                          title="Generate and view echogram for this .raw file"
                          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {echogramLoadingFor === file.filename ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                          <span>
                            {echogramLoadingFor === file.filename ? 'Generating...' : 'Echogram'}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/20 flex items-center justify-between">
            <div className="text-white/70 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + filesPerPage, filteredFiles.length)} of {filteredFiles.length} files
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-white">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Echogram Modal */}
      {echogramModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Echogram Viewer</h3>
              <button
                onClick={closeEchogramModal}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
              {echogramError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center mb-4">
                  <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-red-300 mb-1">Echogram Generation Failed</h4>
                  <p className="text-red-300/80 text-sm">{echogramError}</p>
                </div>
              )}
              {echogramImageUrl && !echogramError && (
                <img
                  src={echogramImageUrl}
                  alt="Generated Echogram"
                  className="max-w-full h-auto mx-auto rounded-md shadow-lg"
                />
              )}
              {!echogramImageUrl && !echogramError && echogramLoadingFor && (
                 <div className="text-center py-10">
                    <Loader2 className="h-12 w-12 text-teal-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/80 text-lg">Generating Echogram...</p>
                 </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 text-right">
              <button
                onClick={closeEchogramModal}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DatasetBrowser;