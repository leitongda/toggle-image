import { ImageFile } from '@/types';
import { loadImage, createCanvas, calculateDimensions } from '@/utils/imageLoader';
import type { CompressorOptions } from '@/types/services';

class Compressor {
  async compress(image: ImageFile, options: CompressorOptions): Promise<{
    blob: Blob;
    width: number;
    height: number;
  }> {
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await this.canvasToBlob(
      canvas,
      image.file.type,
      options.quality / 100
    );

    // If max size is specified and blob is too large, iteratively reduce quality
    if (options.maxSizeMB && blob.size > options.maxSizeMB * 1024 * 1024) {
      return this.compressToMaxSize(canvas, image.file.type, options.maxSizeMB);
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
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  private async compressToMaxSize(
    canvas: HTMLCanvasElement,
    mimeType: string,
    maxSizeMB: number
  ): Promise<{
    blob: Blob;
    width: number;
    height: number;
  }> {
    const maxBytes = maxSizeMB * 1024 * 1024;
    let quality = 0.9;
    let blob: Blob | null = null;

    // Binary search for optimal quality
    let minQ = 0.1;
    let maxQ = 1.0;
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      quality = (minQ + maxQ) / 2;
      blob = await this.canvasToBlob(canvas, mimeType, quality);

      if (blob.size <= maxBytes) {
        minQ = quality + 0.05;
      } else {
        maxQ = quality - 0.05;
      }
    }

    return {
      blob: blob!,
      width: canvas.width,
      height: canvas.height,
    };
  }

  calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize) * 100;
  }
}

export const compressor = new Compressor();
