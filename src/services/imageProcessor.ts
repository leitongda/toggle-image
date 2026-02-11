import { ImageFile, ProcessResult, ProcessedImageFormats, ImageFormat } from '@/types';
import { loadImage, createCanvas, calculateDimensions } from '@/utils/imageLoader';
import { FORMAT_MIME_TYPES } from '@/constants';
import type { ImageProcessorOptions } from '@/types/services';

class ImageProcessor {
  async process(
    image: ImageFile,
    options: ImageProcessorOptions
  ): Promise<ProcessResult> {
    const img = await loadImage(image.originalUrl);

    const { width, height } = calculateDimensions(
      img.width,
      img.height,
      options.maxWidth,
      options.maxHeight
    );

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);

    // Determine output format
    const targetFormat = options.format || image.targetFormat;
    const mimeType =
      targetFormat === 'original'
        ? image.file.type
        : FORMAT_MIME_TYPES[targetFormat] || 'image/jpeg';

    // Convert to blob with compression
    const blob = await this.canvasToBlob(canvas, mimeType, options.quality);

    // If max size is specified and blob is too large, reduce quality
    if (options.maxSizeMB && blob.size > options.maxSizeMB * 1024 * 1024) {
      return this.processWithMaxSize(canvas, mimeType, options.maxSizeMB);
    }

    return { blob, width, height };
  }

  private async canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        mimeType,
        quality / 100
      );
    });
  }

  private async processWithMaxSize(
    canvas: HTMLCanvasElement,
    mimeType: string,
    maxSizeMB: number
  ): Promise<ProcessResult> {
    const maxBytes = maxSizeMB * 1024 * 1024;
    let quality = 0.9;
    let blob: Blob | null = null;

    // Binary search for optimal quality
    let minQ = 0.1;
    let maxQ = 1.0;

    while (minQ <= maxQ) {
      quality = (minQ + maxQ) / 2;

      blob = await this.canvasToBlob(canvas, mimeType, quality * 100);

      if (blob.size <= maxBytes) {
        // Try higher quality
        minQ = quality + 0.05;
      } else {
        // Reduce quality
        maxQ = quality - 0.05;
      }

      if (Math.abs(maxQ - minQ) < 0.05) break;
    }

    // Get final blob at the found quality
    blob = await this.canvasToBlob(canvas, mimeType, quality * 100);

    if (!blob) {
      throw new Error('Failed to process image');
    }

    return {
      blob,
      width: canvas.width,
      height: canvas.height,
    };
  }

  async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    URL.revokeObjectURL(url);

    return {
      width: img.width,
      height: img.height,
      size: file.size,
      type: file.type,
    };
  }

  async processMultipleFormats(
    image: ImageFile,
    formats: ImageFormat[],
    options: ImageProcessorOptions
  ): Promise<ProcessedImageFormats> {
    const results: ProcessedImageFormats = {};

    // Process each format
    for (const format of formats) {
      try {
        // Skip 'original' - we'll handle it separately
        if (format === 'original') {
          results.original = {
            format: 'original',
            blob: image.file,
            size: image.file.size,
          };
          continue;
        }

        const result = await this.process(image, {
          ...options,
          format,
        });

        const url = URL.createObjectURL(result.blob);

        results[format] = {
          format,
          blob: result.blob,
          size: result.blob.size,
          url,
        };
      } catch (error) {
        console.error(`Failed to process format ${format}:`, error);
        // Continue with other formats even if one fails
      }
    }

    return results;
  }
}

export const imageProcessor = new ImageProcessor();
