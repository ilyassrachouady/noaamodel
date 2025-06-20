import Papa from 'papaparse';
import { SpeciesDetection } from '../context/DataContext';

export class CSVService {
  static async loadDetectionsFromURL(url: string): Promise<SpeciesDetection[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      console.error('Error loading CSV from URL:', error);
      // Return mock data for demonstration
      return this.generateMockDetections();
    }
  }

  static parseCSV(csvText: string): SpeciesDetection[] {
    const result = Papa.parse<any>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
    });

    if (result.errors.length > 0) {
      console.warn('CSV parsing errors:', result.errors);
    }

    return result.data.map((row: any) => ({
      filename: row.filename || row.file_name || '',
      timestamp: row.timestamp || row.time || new Date().toISOString(),
      sardine_density: parseFloat(row.sardine_density || row.density || '0'),
      confidence: parseFloat(row.confidence || '0'),
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      depth: row.depth ? parseFloat(row.depth) : undefined,
      notes: row.notes || undefined,
    })).filter(detection => detection.filename && detection.sardine_density > 0);
  }

  static generateMockDetections(): SpeciesDetection[] {
    const detections: SpeciesDetection[] = [];
    const baseDate = new Date('2021-08-13');
    
    // Generate detections for various files with realistic patterns
    const detectionPatterns = [
      { density: 0.85, confidence: 0.92, lat: 32.8, lon: -117.2 },
      { density: 0.73, confidence: 0.88, lat: 32.7, lon: -117.3 },
      { density: 0.91, confidence: 0.95, lat: 32.6, lon: -117.4 },
      { density: 0.67, confidence: 0.79, lat: 32.5, lon: -117.5 },
      { density: 0.82, confidence: 0.87, lat: 32.4, lon: -117.6 },
      { density: 0.76, confidence: 0.83, lat: 32.3, lon: -117.7 },
      { density: 0.89, confidence: 0.91, lat: 32.2, lon: -117.8 },
      { density: 0.71, confidence: 0.85, lat: 32.1, lon: -117.9 },
      { density: 0.94, confidence: 0.97, lat: 32.0, lon: -118.0 },
      { density: 0.68, confidence: 0.81, lat: 31.9, lon: -118.1 },
    ];

    detectionPatterns.forEach((pattern, index) => {
      const day = Math.floor(index / 2);
      const hour = 8 + (index % 12);
      const minute = (index * 17) % 60;
      
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + day);
      
      const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
      
      detections.push({
        filename: `2107RL_FM-D${dateStr}-T${timeStr}.raw`,
        timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, minute).toISOString(),
        sardine_density: pattern.density,
        confidence: pattern.confidence,
        latitude: pattern.lat,
        longitude: pattern.lon,
        depth: 50 + Math.random() * 100,
        notes: `Sardine school detected with ${(pattern.density * 100).toFixed(0)}% density`
      });
    });

    return detections;
  }
}