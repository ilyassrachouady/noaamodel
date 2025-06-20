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
        return {
          filename: filename,
          size: file.size,
          lastModified: file.last_modified,
          url: `${S3_BASE_URL}/${file.key}`,
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
