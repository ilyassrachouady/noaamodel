import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DatasetBrowser from './pages/DatasetBrowser';
import DetectionAnalyzer from './pages/DetectionAnalyzer';
import SpectrogramViewer from './pages/SpectrogramViewer';
import SpectrogramExtractorPage from './pages/SpectrogramExtractorPage'; // Import the new page
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browser" element={<DatasetBrowser />} />
            <Route path="/analyzer" element={<DetectionAnalyzer />} />
            <Route path="/spectrograms" element={<SpectrogramViewer />} />
            <Route path="/spectrogram-extractor" element={<SpectrogramExtractorPage />} /> {/* Add new route */}
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
}

export default App;