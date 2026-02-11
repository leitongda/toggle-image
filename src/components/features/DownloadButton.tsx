import { Button } from '../ui';
import { downloadService } from '@/services/downloadService';
import { formatConverter } from '@/services/formatConverter';
import { ImageFile } from '@/types';
import { useState } from 'react';

interface DownloadButtonProps {
  images: ImageFile[];
  disabled?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ images, disabled }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMode, setDownloadMode] = useState<'flat' | 'byFormat'>('byFormat');

  const completedImages = images.filter((img) => img.status === 'completed' && (img.processedUrl || img.processedFormats));
  const hasMultiFormatImages = completedImages.some(img => img.processedFormats && Object.keys(img.processedFormats).length > 1);

  if (completedImages.length === 0) {
    return (
      <Button disabled variant="primary" className="w-full">
        没有可下载的图片
      </Button>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Check if we have multi-format processed images
      const multiFormatImages = completedImages.filter(img => img.processedFormats && Object.keys(img.processedFormats).length > 0);

      if (multiFormatImages.length > 0 && downloadMode === 'byFormat') {
        // Download by format (organized in folders)
        const downloadData = await Promise.all(
          multiFormatImages.map(async (image) => {
            // Ensure all format blobs are available
            const formats: any = {};
            if (image.processedFormats) {
              for (const [format, data] of Object.entries(image.processedFormats)) {
                if (data.blob) {
                  formats[format] = data;
                } else if (data.url) {
                  const response = await fetch(data.url);
                  const blob = await response.blob();
                  formats[format] = { ...data, blob };
                }
              }
            }
            return {
              file: image,
              formats,
            };
          })
        );

        await downloadService.downloadImagesByFormat(
          downloadData,
          `images-${Date.now()}.zip`
        );
      } else {
        // Flat download (original behavior)
        const downloadImages = await Promise.all(
          completedImages.map(async (image) => {
            // Use the first processed format or processedUrl
            let blob: Blob;
            let targetFormat: string;

            if (image.processedFormats) {
              const firstFormat = Object.keys(image.processedFormats)[0];
              const firstData = image.processedFormats[firstFormat];
              blob = firstData.blob;
              targetFormat = firstFormat;
            } else if (image.processedUrl) {
              const response = await fetch(image.processedUrl);
              blob = await response.blob();
              targetFormat = image.targetFormat;
            } else {
              throw new Error('No processed data available');
            }

            return {
              blob,
              originalName: image.file.name,
              targetFormat,
            };
          })
        );

        await downloadService.downloadImages(
          downloadImages,
          `images-${Date.now()}.zip`
        );
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Download mode selector (only show if we have multi-format images) */}
      {hasMultiFormatImages && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDownloadMode('byFormat')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              downloadMode === 'byFormat'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            按格式分文件夹
          </button>
          <button
            type="button"
            onClick={() => setDownloadMode('flat')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              downloadMode === 'flat'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            平铺下载
          </button>
        </div>
      )}

      <Button
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        isLoading={isDownloading}
        variant="primary"
        className="w-full"
        size="lg"
      >
        {isDownloading
          ? '准备下载...'
          : completedImages.length === 1
          ? '下载图片'
          : `下载 ${completedImages.length} 张图片 (ZIP)${
              hasMultiFormatImages && downloadMode === 'byFormat' ? ' - 按格式' : ''
            }`}
      </Button>
    </div>
  );
};

interface DownloadIndividualButtonProps {
  image: ImageFile;
}

export const DownloadIndividualButton: React.FC<DownloadIndividualButtonProps> = ({ image }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (image.status !== 'completed' || (!image.processedUrl && !image.processedFormats)) {
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      let blob: Blob;
      let extension: string;
      let baseName = image.file.name.replace(/\.[^/.]+$/, '');

      // If we have multiple formats, download all as ZIP
      if (image.processedFormats && Object.keys(image.processedFormats).length > 1) {
        const formats: any = {};

        for (const [format, data] of Object.entries(image.processedFormats)) {
          if (data.blob) {
            formats[format] = data;
          } else if (data.url) {
            const response = await fetch(data.url);
            const blob = await response.blob();
            formats[format] = { ...data, blob };
          }
        }

        await downloadService.downloadImagesByFormat(
          [{ file: image, formats }],
          `${baseName}-all-formats.zip`
        );
        setIsDownloading(false);
        return;
      }

      // Single format download
      if (image.processedUrl) {
        const response = await fetch(image.processedUrl);
        blob = await response.blob();
        extension = formatConverter.getFileExtension(image.targetFormat);
      } else if (image.processedFormats) {
        const firstFormat = Object.keys(image.processedFormats)[0];
        const firstData = image.processedFormats[firstFormat];
        blob = firstData.blob;
        extension = firstFormat;
      } else {
        throw new Error('No processed data available');
      }

      const filename = `${baseName}.${extension}`;
      await downloadService.downloadSingle({ blob, filename });
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const hasMultipleFormats = image.processedFormats && Object.keys(image.processedFormats).length > 1;

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      isLoading={isDownloading}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {isDownloading
        ? '下载中...'
        : hasMultipleFormats
        ? `下载全部 (${Object.keys(image.processedFormats!).length} 格式)`
        : '下载'}
    </Button>
  );
};
