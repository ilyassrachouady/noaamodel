// src/services/S3Service.ts
import { RawFile } from '../context/DataContext';

// API endpoints
const FILE_LIST_API_URL = 'https://noaa-s3-backend.fly.dev/list-all-files';
const ECHOGRAM_API_URL = 'https://noaa-echogram.fly.dev/generate-echogram';

export class S3Service {
  /**
   * Fetches list of raw files from NOAA S3 bucket
   * @param cruise Cruise identifier (e.g., 'RL2107')
   * @returns Promise<RawFile[]> Array of raw files with metadata
   */
  static async fetchFileList(cruise: string = 'RL2107'): Promise<RawFile[]> {
    try {
      // Construct URL with cruise parameter
      const url = new URL(FILE_LIST_API_URL);
      url.searchParams.append('cruise', cruise);
      
      console.log('Fetching files from:', url.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        // Try to parse error details from backend
        let errorDetail = `HTTP error ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch (e) {
          console.warn('Could not parse error response', e);
        }
        
        throw new Error(`Failed to fetch file list: ${errorDetail}`);
      }
      
      const data = await response.json();
      console.log('Received file data:', data);
      
      // Map API response to RawFile format
      return data.files.map((file: any) => ({
        filename: file.filename,
        url: file.url,
        size: file.size,
        lastModified: file.datetime || '',
        parsedDate: file.datetime ? file.datetime.split(' ')[0] : '',
        parsedTime: file.datetime ? file.datetime.split(' ')[1] : '',
        cruise: cruise, // Ensure the collection's cruise ID is used
        mode: this.extractModeFromFilename(file.filename),
        formattedSize: this.formatFileSize(file.size),
        isDownloadable: file.size > 0
      })).sort((a: RawFile, b: RawFile) => 
        a.filename.localeCompare(b.filename)
      );
    } catch (error) {
      console.error('Error fetching S3 file list:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch file list'
      );
    }
  }

  /**
   * Generates an echogram image for a specific file
   * @param cruise Cruise identifier
   * @param filename Name of the .raw file
   * @returns Promise<Blob> Image blob
   */
  static async generateEchogram(cruise: string, filename: string): Promise<Blob> {
  try {
    // Validate parameters
    if (!cruise || !filename) {
      throw new Error(`Invalid parameters: cruise=${cruise}, filename=${filename}`);
    }
    
    const url = new URL(ECHOGRAM_API_URL);
    // url.searchParams.append('cruise', cruise); // Cruise is now part of the hardcoded PREFIX in the backend
    url.searchParams.append('filename', filename);
    
    console.log('Generating echogram with:', { filename }); // Removed cruise from log
    
    const response = await fetch(url.toString(), {
      mode: 'cors',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Full echogram error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate echogram'
    );
  }
}

  /**
   * Formats file size in human-readable format
   * @param bytes File size in bytes
   * @returns string Formatted size (e.g., "1.23 MB")
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extracts transmission mode from filename
   * @param filename NOAA filename
   * @returns 'CW' | 'FM' | 'Unknown'
   */
  static extractModeFromFilename(filename: string): 'CW' | 'FM' | 'Unknown' {
    // Filename format: 2107RL_CW-D20211014-T145513.raw or 2107RL_FM-D20211012-T030639.raw
    const parts = filename.split('_');
    if (parts.length < 2) return 'Unknown';
    
    const modePart = parts[1].split('-')[0];
    return modePart === 'CW' || modePart === 'FM' 
      ? modePart 
      : 'Unknown';
  }

  /**
   * Extracts date from filename
   * @param filename NOAA filename
   * @returns Formatted date string (YYYY-MM-DD) or empty string
   */
  static extractDateFromFilename(filename: string): string {
    // Example: D20211014 from 2107RL_CW-D20211014-T145513.raw
    const dateMatch = filename.match(/D(\d{8})/);
    if (!dateMatch) return '';
    
    const dateStr = dateMatch[1];
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }

  /**
   * Extracts time from filename
   * @param filename NOAA filename
   * @returns Formatted time string (HH:MM:SS) or empty string
   */
  static extractTimeFromFilename(filename: string): string {
    // Example: T145513 from 2107RL_CW-D20211014-T145513.raw
    const timeMatch = filename.match(/T(\d{6})/);
    if (!timeMatch) return '';
    
    const timeStr = timeMatch[1];
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
  }
  
  /**
   * Creates a download URL for a raw file
   * @param cruise Cruise identifier
   * @param filename File name
   * @returns Direct S3 download URL
   */
  static getDownloadUrl(cruise: string, filename: string): string {
    return `https://noaa-wcsd-pds.s3.amazonaws.com/data/raw/Reuben_Lasker/${cruise}/EK80/${filename}`;
  }
}
