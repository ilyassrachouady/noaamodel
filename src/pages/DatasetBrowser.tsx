import React, { useEffect, useState } from 'react';
import { Database, Download, Calendar, HardDrive, Search, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import { S3Service } from '../services/s3Service';
import { format } from 'date-fns';

const DatasetBrowser: React.FC = () => {
  const { rawFiles, setRawFiles, isLoading, setIsLoading, error, setError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 20;

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
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
  };

  const filteredFiles = rawFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || file.filename.includes(dateFilter.replace(/-/g, ''));
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + filesPerPage);

  const handleDownload = (file: any) => {
    window.open(file.url, '_blank');
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white">
            Raw Files ({filteredFiles.length} found)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Filename</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Date/Time</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Size</th>
                <th className="px-6 py-4 text-left text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiles.map((file, index) => (
                <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-mono text-sm">{file.filename}</span>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {format(new Date(file.lastModified), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {S3Service.formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
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
    </div>
  );
};

export default DatasetBrowser;