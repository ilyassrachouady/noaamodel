import { RawFile } from '../context/DataContext';

const BACKEND_API_URL = 'https://noaa-s3-backend.fly.dev/list-all-files';
const S3_BASE_URL = 'https://noaa-wcsd-pds.s3.amazonaws.com';

export class S3Service {
  static async fetchFileList(): Promise<RawFile[]> {
    try {
      const response = await fetch(BACKEND_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch file list from backend');
      }

      const data = await response.json();

      const files: RawFile[] = data.files.map((file: any) => {
        const filename = file.key.split('/').pop(); // just the file name

        // Regex to extract date and time
        const regex = /D(\d{8})-T(\d{6})/;
        const match = filename.match(regex);

        let parsedDate = '';
        let parsedTime = '';

        if (match && match[1] && match[2]) {
          const dateStr = match[1]; // YYYYMMDD
          const timeStr = match[2]; // HHMMSS

          // Format date to YYYY-MM-DD
          parsedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

          // Format time to HH:MM:SS
          parsedTime = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
        }

        return {
          filename: filename,
          size: file.size,
          lastModified: file.last_modified,
          url: `${S3_BASE_URL}/${file.key}`,
          parsedDate: parsedDate,
          parsedTime: parsedTime,
        };
      });

      return files.sort((a, b) => a.filename.localeCompare(b.filename));
    } catch (error) {
      console.error('Error fetching S3 file list:', error);
      throw new Error('Failed to fetch file list');
    }
  }

  static getFileUrl(filename: string): string {
    return `${S3_BASE_URL}/data/raw/Reuben_Lasker/RL2107/EK80/${filename}`;
  }

  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
