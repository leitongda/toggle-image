import { create } from 'zustand';
import { ImageFile, CompressionSettings, ImageFormat } from '@/types';
import { QUALITY_DEFAULT } from '@/constants';

interface ImageStore {
  images: ImageFile[];
  settings: CompressionSettings;
  isProcessing: boolean;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  updateSettings: (updates: Partial<CompressionSettings>) => void;
  setProcessing: (processing: boolean) => void;
  processImage: (id: string, formats?: ImageFormat[]) => Promise<void>;
  processAllImages: () => Promise<void>;
}

const createImageFile = async (file: File): Promise<ImageFile> => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const originalUrl = URL.createObjectURL(file);

  // Get image dimensions
  const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = originalUrl;
  });

  return {
    id,
    file,
    originalUrl,
    originalSize: file.size,
    originalWidth: dimensions.width,
    originalHeight: dimensions.height,
    format: file.type.split('/')[1] || 'unknown',
    targetFormat: 'original',
    targetFormats: ['original'],
    status: 'pending',
  };
};

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  settings: {
    quality: QUALITY_DEFAULT,
    targetFormat: 'original',
  },
  isProcessing: false,

  addImages: async (files: File[]) => {
    const imageFiles = await Promise.all(files.map(createImageFile));
    set((state) => ({
      images: [...state.images, ...imageFiles],
    }));
  },

  removeImage: (id: string) => {
    set((state) => {
      const image = state.images.find((img) => img.id === id);
      if (image?.originalUrl) URL.revokeObjectURL(image.originalUrl);
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
      if (image?.processedUrl) URL.revokeObjectURL(image.processedUrl);

      // Clean up processedFormats URLs
      if (image?.processedFormats) {
        Object.values(image.processedFormats).forEach((format) => {
          if (format.url) URL.revokeObjectURL(format.url);
        });
      }

      return {
        images: state.images.filter((img) => img.id !== id),
      };
    });
  },

  clearImages: () => {
    const { images } = get();
    images.forEach((img) => {
      if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);

      // Clean up processedFormats URLs
      if (img.processedFormats) {
        Object.values(img.processedFormats).forEach((format) => {
          if (format.url) URL.revokeObjectURL(format.url);
        });
      }
    });
    set({ images: [] });
  },

  updateImage: (id: string, updates: Partial<ImageFile>) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    }));
  },

  updateSettings: (updates: Partial<CompressionSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
  },

  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },

  processImage: async (id: string, formats?: ImageFormat[]) => {
    const { images, settings } = get();
    const image = images.find((img) => img.id === id);
    if (!image) return;

    // Use provided formats or fall back to settings
    const targetFormats = formats || settings.targetFormats || [settings.targetFormat];

    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status: 'processing' as const } : img
      ),
      isProcessing: true,
    }));

    try {
      const { imageProcessor } = await import('@/services/imageProcessor');

      // Check if we should use multi-format processing
      if (targetFormats.length > 1 || (targetFormats.length === 1 && targetFormats[0] !== 'original')) {
        // Multi-format processing
        const processedFormats = await imageProcessor.processMultipleFormats(
          image,
          targetFormats,
          settings
        );

        // Use the first format as the primary processedUrl for backward compatibility
        const firstFormat = Object.keys(processedFormats)[0];
        const firstResult = processedFormats[firstFormat];

        set((state) => ({
          images: state.images.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'completed' as const,
                  processedUrl: firstResult?.url,
                  processedSize: firstResult?.size,
                  previewUrl: firstResult?.url || img.previewUrl,
                  processedFormats,
                  targetFormats,
                }
              : img
          ),
        }));
      } else {
        // Single format processing (original or backward compatibility)
        const result = await imageProcessor.process(image, settings);
        const processedUrl = URL.createObjectURL(result.blob);

        set((state) => ({
          images: state.images.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'completed' as const,
                  processedUrl,
                  processedSize: result.blob.size,
                  previewUrl: processedUrl,
                  targetFormats: [settings.targetFormat],
                }
              : img
          ),
        }));
      }
    } catch (error) {
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? {
                ...img,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Processing failed',
              }
            : img
        ),
      }));
    } finally {
      set({ isProcessing: false });
    }
  },

  processAllImages: async () => {
    const { images, processImage } = get();
    const pendingImages = images.filter((img) => img.status !== 'completed');

    for (const image of pendingImages) {
      await processImage(image.id);
    }
  },
}));
