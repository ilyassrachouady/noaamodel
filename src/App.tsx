import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DatasetBrowser from './pages/DatasetBrowser';
import DetectionAnalyzer from './pages/DetectionAnalyzer';
import SpectrogramViewer from './pages/SpectrogramViewer';
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
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
}

export default App;