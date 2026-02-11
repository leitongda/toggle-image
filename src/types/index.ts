export interface ImageFile {
  id: string;
  file: File;
  originalUrl: string;
  previewUrl?: string;
  processedUrl?: string;
  originalSize: number;
  processedSize?: number;
  originalWidth: number;
  originalHeight: number;
  format: string;
  targetFormat: string;
  targetFormats?: ImageFormat[]; // For multi-format support
  processedFormats?: ProcessedImageFormats; // Stored multi-format results
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
}

export type ImageFormat =
  | 'jpeg' | 'jpg'
  | 'png'
  | 'webp'
  | 'avif'
  | 'gif'
  | 'bmp'
  | 'ico'
  | 'tiff' | 'tif'
  | 'heif' | 'heic'
  | 'original';

export interface CompressionSettings {
  quality: number;
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  targetFormat: ImageFormat;
  targetFormats?: ImageFormat[]; // For multi-format export
}

export interface CompressionPreset {
  name: string;
  quality: number;
  description: string;
}

export interface ProcessingOptions {
  quality: number;
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  format: string;
}

export interface DownloadOptions {
  individual: boolean;
  zip?: boolean;
}

// Multi-format export types
export interface MultiFormatResult {
  format: ImageFormat;
  blob: Blob;
  size: number;
  url?: string;
}

export interface ProcessedImageFormats {
  [format: string]: MultiFormatResult;
}

// Image preview comparison view modes
export type ViewMode = 'single' | 'sideBySide' | 'slider';
