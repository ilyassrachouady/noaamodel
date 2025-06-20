import React from 'react';
import { Link } from 'react-router-dom';
import { Fish, Database, Search, BarChart3, Download, Waves, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Database,
      title: 'Browse EK80 Dataset',
      description: 'Explore hundreds of acoustic .raw files from the NOAA RL2107 cruise',
      link: '/browser',
      color: 'from-blue-500 to-blue-600',
      stats: '500+ Files'
    },
    {
      icon: Search,
      title: 'Sardine Detection AI',
      description: 'Intelligent matching of acoustic files with species detection data',
      link: '/analyzer',
      color: 'from-teal-500 to-teal-600',
      stats: 'AI Powered'
    },
    {
      icon: BarChart3,
      title: 'Spectrogram Viewer',
      description: 'Visualize and download acoustic spectrograms for machine learning',
      link: '/spectrograms',
      color: 'from-cyan-500 to-cyan-600',
      stats: 'ML Ready'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-full">
            <Fish className="h-16 w-16 text-white animate-bounce-slow" />
          </div>
          <div className="absolute -top-2 -right-2 flex space-x-1">
            <Waves className="h-4 w-4 text-teal-300 animate-ping" />
            <Zap className="h-3 w-3 text-blue-300 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
          <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            AI Agent
          </span>
          <br />
          <span className="text-4xl md:text-5xl">for Acoustic Sardine Detection</span>
        </h1>
        
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed">
            Explore the <strong>NOAA Reuben Lasker RL2107 EK80</strong> dataset with intelligent species detection
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            Load predefined species detection data, browse acoustic files, and generate labeled spectrograms for machine learning research
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            to="/browser"
            className="group bg-gradient-to-r from-teal-500 to-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            <span className="flex items-center space-x-3">
              <Database className="h-6 w-6 group-hover:animate-pulse" />
              <span>Explore Dataset</span>
            </span>
          </Link>
          
          <a
            href="https://noaa-wcsd-pds.s3.amazonaws.com/index.html#data/raw/Reuben_Lasker/RL2107/EK80/"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/20 hover:border-white/40"
          >
            <span className="flex items-center space-x-3">
              <Download className="h-6 w-6 group-hover:animate-bounce" />
              <span>View Raw Data</span>
            </span>
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  <span className="text-xs font-semibold text-teal-300 bg-teal-500/20 px-2 py-1 rounded-full">
                    {feature.stats}
                  </span>
                </div>
                
                <p className="text-white/80 leading-relaxed text-lg">{feature.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dataset Info Section */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/20 mb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">RL2107 Cruise Dataset</h2>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            High-resolution acoustic data collected during the Reuben Lasker research cruise, 
            featuring EK80 echosounder recordings optimized for sardine detection and analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">RL2107</div>
            <div className="text-white/70">Cruise Identifier</div>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Waves className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">EK80</div>
            <div className="text-white/70">Acoustic System</div>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Fish className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-white/70">Raw Files</div>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Download className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">Open</div>
            <div className="text-white/70">Access Data</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-sm rounded-3xl p-8 border border-teal-400/30">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Analyzing?</h3>
          <p className="text-white/80 mb-6 text-lg">
            Begin exploring the dataset and discover sardine detection patterns in acoustic data
          </p>
          <Link
            to="/analyzer"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Search className="h-5 w-5" />
            <span>Start Analysis</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;