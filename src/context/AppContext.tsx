import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnalysisData {
  filename: string;
  timestamp: string;
  sardineDensity: number;
  confidence: number;
  location: { lat: number; lon: number };
}

interface AppContextType {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  analysisData: AnalysisData[];
  setAnalysisData: (data: AnalysisData[]) => void;
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const value = {
    uploadedFile,
    setUploadedFile,
    analysisData,
    setAnalysisData,
    selectedFiles,
    setSelectedFiles,
    isProcessing,
    setIsProcessing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};