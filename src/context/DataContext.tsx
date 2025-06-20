import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RawFile {
  filename: string;
  size: number;
  lastModified: string;
  url: string;
}

export interface SpeciesDetection {
  filename: string;
  timestamp: string;
  sardine_density: number;
  confidence: number;
  latitude?: number;
  longitude?: number;
  depth?: number;
  notes?: string;
}

export interface MatchedFile extends RawFile {
  detection: SpeciesDetection;
  hasSpectogram?: boolean;
}

interface DataContextType {
  rawFiles: RawFile[];
  setRawFiles: (files: RawFile[]) => void;
  detections: SpeciesDetection[];
  setDetections: (detections: SpeciesDetection[]) => void;
  matchedFiles: MatchedFile[];
  setMatchedFiles: (files: MatchedFile[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  filters: {
    minDensity: number;
    minConfidence: number;
    sortBy: 'density' | 'confidence' | 'timestamp' | 'filename';
    sortOrder: 'asc' | 'desc';
  };
  setFilters: (filters: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [rawFiles, setRawFiles] = useState<RawFile[]>([]);
  const [detections, setDetections] = useState<SpeciesDetection[]>([]);
  const [matchedFiles, setMatchedFiles] = useState<MatchedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minDensity: 0,
    minConfidence: 0,
    sortBy: 'density' as const,
    sortOrder: 'desc' as const,
  });

  const value = {
    rawFiles,
    setRawFiles,
    detections,
    setDetections,
    matchedFiles,
    setMatchedFiles,
    isLoading,
    setIsLoading,
    error,
    setError,
    filters,
    setFilters,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};