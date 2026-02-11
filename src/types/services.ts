export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
}

export interface ImageProcessorOptions {
  quality: number;
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: string;
}

export interface FormatConverterOptions {
  format: string;
  quality?: number;
}

export interface CompressorOptions {
  quality: number;
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface DownloadOptions {
  filename: string;
  blob: Blob;
}

export interface BatchDownloadOptions {
  files: Array<{ name: string; blob: Blob }>;
  zipFilename: string;
}
