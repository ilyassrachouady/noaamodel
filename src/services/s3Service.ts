// S3Service.ts
import { RawFile } from '../context/DataContext';

// Base URLs for your backend services
const FILE_LIST_API_URL = 'https://noaa-s3-backend.fly.dev/list-all-files';
const ECHOGRAM_API_URL = 'https://noaa-echogram.fly.dev/generate-echogram';

export class S3Service {
  /**
   * Fetches list of raw files from a specific cruise
   * @param cruise Cruise identifier (e.g., 'RL2107', 'RL1907')
   * @returns Promise<RawFile[]> Array of raw files with metadata
   */
  static async fetchFileList(cruise: string = 'RL2107'): Promise<RawFile[]> {
    try {
      const response = await fetch(`${FILE_LIST_API_URL}?cruise=${cruise}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to fetch file list'
        }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      return data.files.map((file: any) => {
        const [parsedDate, parsedTime] = file.datetime 
          ? file.datetime.split(' ') 
          : ['', ''];

        return {
          filename: file.filename,
          url: file.url,
          size: file.size,
          lastModified: file.datetime,
          parsedDate: parsedDate,
          parsedTime: parsedTime,
          cruise: file.cruise || cruise // Fallback to parameter if not in response
        };
      }).sort((a: RawFile, b: RawFile) => 
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
   * Generates file download URL
   * @param cruise Cruise identifier
   * @param filename Name of the file
   * @returns string Direct S3 URL
   */
  static getFileUrl(cruise: string, filename: string): string {
    return `https://noaa-wcsd-pds.s3.amazonaws.com/data/raw/Reuben_Lasker/${cruise}/EK80/${filename}`;
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
   * Generates an echogram image for a specific file
   * @param cruise Cruise identifier
   * @param filename Name of the .raw file
   * @returns Promise<Blob> Image blob
   */
  static async generateEchogram(cruise: string, filename: string): Promise<Blob> {
    try {
      const url = new URL(ECHOGRAM_API_URL);
      url.searchParams.append('cruise', cruise);
      url.searchParams.append('filename', filename);

      const response = await fetch(url.toString(), {
        headers: {
          'Cache-Control': 'no-cache' // Prevent caching for fresh results
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Failed to generate echogram (Status: ${response.status})`
        }));
        throw new Error(errorData.message);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating echogram:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to generate echogram'
      );
    }
  }

  /**
   * Extracts cruise identifier from filename
   * @param filename EK80 filename (e.g., "1907RL_CW-D20211014-T145513.raw")
   * @returns string Cruise identifier (e.g., "RL1907")
   */
  static extractCruiseFromFilename(filename: string): string {
    const match = filename.match(/^(\d{2})(\d{2})RL_/);
    if (match) {
      return `RL${match[1]}${match[2]}`; // Converts "1907RL" to "RL1907"
    }
    return 'RL2107'; // Default fallback
  }
}
