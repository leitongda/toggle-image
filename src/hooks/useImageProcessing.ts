import { useImageStore } from '@/stores/imageStore';

export const useImageProcessing = () => {
  const {
    images,
    settings,
    isProcessing,
    addImages,
    removeImage,
    clearImages,
    updateImage,
    updateSettings,
    processImage,
    processAllImages,
  } = useImageStore();

  const completedImages = images.filter((img) => img.status === 'completed');
  const pendingImages = images.filter((img) => img.status === 'pending');
  const processingImages = images.filter((img) => img.status === 'processing');
  const errorImages = images.filter((img) => img.status === 'error');

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalProcessedSize = completedImages.reduce(
    (sum, img) => sum + (img.processedSize || 0),
    0
  );

  const totalSaved = totalOriginalSize - totalProcessedSize;
  const compressionRatio =
    totalOriginalSize > 0 ? (totalSaved / totalOriginalSize) * 100 : 0;

  return {
    images,
    settings,
    isProcessing,
    completedImages,
    pendingImages,
    processingImages,
    errorImages,
    totalOriginalSize,
    totalProcessedSize,
    totalSaved,
    compressionRatio,
    addImages,
    removeImage,
    clearImages,
    updateImage,
    updateSettings,
    processImage,
    processAllImages,
  };
};
