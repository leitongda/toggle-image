import { ImageFile } from '@/types';
import { loadImage, createCanvas } from '@/utils/imageLoader';
import { FORMAT_MIME_TYPES } from '@/constants';
import type { FormatConverterOptions } from '@/types/services';

class FormatConverter {
  private readonly supportedFormats = new Set(['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'ico', 'tiff', 'tif']);

  // Formats that are read-only (need special handling for export)
  private readonly readOnlyFormats = new Set(['gif', 'ico', 'tiff', 'tif', 'heif', 'heic']);

  isFormatSupported(format: string): boolean {
    return this.supportedFormats.has(format.toLowerCase());
  }

  isFormatSupportedInBrowser(format: string): boolean {
    const canvas = document.createElement('canvas');
    const mimeType = FORMAT_MIME_TYPES[format.toLowerCase()];
    if (!mimeType) return false;

    // Check for AVIF support
    if (format.toLowerCase() === 'avif') {
      return canvas.toDataURL('image/avif').startsWith('data:image/avif');
    }

    return canvas.toDataURL(mimeType).startsWith(`data:${mimeType}`);
  }

  getSupportedFormats(): string[] {
    return Array.from(this.supportedFormats).filter((format) =>
      this.isFormatSupportedInBrowser(format)
    );
  }

  async convert(image: ImageFile, options: FormatConverterOptions): Promise<Blob> {
    const format = options.format.toLowerCase();
    const img = await loadImage(image.originalUrl);

    let width = img.width;
    let height = img.height;

    // ICO format requires square sizing, typically 16x16, 32x32, 48x48, or 256x256
    if (format === 'ico') {
      const size = Math.min(Math.max(Math.min(width, height), 32), 256);
      // Round to nearest power of 2-ish common size
      const icoSizes = [16, 32, 48, 64, 128, 256];
      const closestSize = icoSizes.reduce((prev, curr) =>
        Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
      );
      width = closestSize;
      height = closestSize;
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, 0, 0, width, height);

    const mimeType = FORMAT_MIME_TYPES[format] || 'image/jpeg';

    // Check if format is supported for canvas export
    if (this.isReadOnlyFormat(format)) {
      throw new Error(`Format "${format}" is read-only and cannot be exported directly`);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image format'));
          }
        },
        mimeType,
        options.quality ? options.quality / 100 : 0.9
      );
    });
  }

  isReadOnlyFormat(format: string): boolean {
    return this.readOnlyFormats.has(format.toLowerCase());
  }

  canExportFormat(format: string): boolean {
    const f = format.toLowerCase();
    return !this.readOnlyFormats.has(f) || f === 'gif';
  }

  getOutputFormat(inputFormat: string, targetFormat: string): string {
    if (targetFormat === 'original') {
      return inputFormat;
    }
    return targetFormat;
  }

  getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      jpeg: 'jpg',
      jpg: 'jpg',
      png: 'png',
      webp: 'webp',
      avif: 'avif',
      gif: 'gif',
      bmp: 'bmp',
      ico: 'ico',
      tiff: 'tif',
      tif: 'tif',
      heif: 'heif',
      heic: 'heic',
    };
    return extensions[format.toLowerCase()] || 'jpg';
  }
}

export const formatConverter = new FormatConverter();
