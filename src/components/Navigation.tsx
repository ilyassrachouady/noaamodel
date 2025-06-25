import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Fish, Database, Search, BarChart3, Menu, X, Waves, FileSearch } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Fish },
    { path: '/browser', label: 'Dataset', icon: Database },
    { path: '/analyzer', label: 'Analyzer', icon: Search },
    { path: '/spectrograms', label: 'Spectrograms', icon: BarChart3 },
    { path: '/spectrogram-extractor', label: 'Extractor', icon: FileSearch },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-white hover:text-teal-300 transition-colors group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-full">
                <Fish className="h-6 w-6 text-white transform group-hover:scale-110 transition-transform" />
              </div>
              <Waves className="absolute -bottom-1 -right-1 h-3 w-3 text-teal-400 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg hidden sm:block">NOAA RL2107</span>
              <span className="text-xs text-teal-300 hidden sm:block">Sardine Detection AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/30 to-blue-500/30 text-white border border-teal-400/50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-teal-300 transition-colors p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500/30 to-blue-500/30 text-white border border-teal-400/50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;