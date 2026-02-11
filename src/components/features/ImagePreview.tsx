import { ImageFile } from '@/types';
import { formatFileSize } from '@/utils/imageLoader';
import { Card, Button, Badge } from '@/components/shadcn/ui';
import { UPLOAD_ICONS } from '@/utils/uploadIcons';
import { useState } from 'react';
import { ImagePreviewModal } from './ImagePreviewModal';

interface ImagePreviewProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onProcess?: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onRemove, onProcess }) => {
  const [showModal, setShowModal] = useState(false);

  const compressionRatio =
    image.processedSize && image.originalSize > 0
      ? ((image.originalSize - image.processedSize) / image.originalSize) * 100
      : 0;

  const getStatusBadge = () => {
    switch (image.status) {
      case 'pending':
        return <Badge variant="default">待处理</Badge>;
      case 'processing':
        return <Badge variant="secondary">处理中...</Badge>;
      case 'completed':
        return <Badge variant="default">完成</Badge>;
      case 'error':
        return <Badge variant="destructive">失败</Badge>;
    }
  };

  const getFormattedTargetFormats = () => {
    if (image.processedFormats) {
      return Object.keys(image.processedFormats).map((f) => f.toUpperCase()).join(', ');
    }
    return image.targetFormat?.toUpperCase() || 'ORIGINAL';
  };

  const hasMultipleFormats = image.processedFormats && Object.keys(image.processedFormats).length > 1;
  const processedFormatCount = image.processedFormats ? Object.keys(image.processedFormats).length : 0;

  return (
    <>
      <Card className="overflow-hidden gap-0 py-0">
        <div className="relative">
          <img
            src={image.previewUrl || image.originalUrl}
            alt={image.file.name}
            className="w-full h-48 object-cover cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          <button
            onClick={() => onRemove(image.id)}
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
            aria-label="删除"
          >
            {UPLOAD_ICONS.close}
          </button>
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
          {hasMultipleFormats && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary">
                {processedFormatCount} 种格式
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-medium text-gray-900 truncate mb-2" title={image.file.name}>
            {image.file.name}
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>原始尺寸:</span>
              <span className="font-medium">
                {image.originalWidth} × {image.originalHeight}
              </span>
            </div>
            <div className="flex justify-between">
              <span>原始大小:</span>
              <span className="font-medium">{formatFileSize(image.originalSize)}</span>
            </div>
            {image.processedSize && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>压缩后:</span>
                  <span className="font-medium">{formatFileSize(image.processedSize)}</span>
                </div>
                {compressionRatio > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>压缩率:</span>
                    <span className="font-medium">-{compressionRatio.toFixed(1)}%</span>
                  </div>
                )}
              </>
            )}
            {image.targetFormat && image.targetFormat !== 'original' && (
              <div className="flex justify-between">
                <span>目标格式:</span>
                <span className="font-medium uppercase">{getFormattedTargetFormats()}</span>
              </div>
            )}
            {/* Show multi-format sizes */}
            {image.processedFormats && Object.keys(image.processedFormats).length > 1 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">生成的格式:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(image.processedFormats).map(([format, data]) => (
                    <div key={format} className="flex justify-between text-gray-600">
                      <span className="uppercase">{format}:</span>
                      <span>{formatFileSize(data.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {image.status === 'pending' && onProcess && (
            <Button
              onClick={() => onProcess(image.id)}
              className="w-full mt-4"
              size="sm"
            >
              开始处理
            </Button>
          )}
          {image.error && (
            <p className="mt-2 text-sm text-red-600">{image.error}</p>
          )}
        </div>
      </Card>

      {showModal && (
        <ImagePreviewModal
          image={image}
          formats={image.processedFormats}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

interface ImagePreviewListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onProcess?: (id: string) => void;
  onClearAll: () => void;
}

export const ImagePreviewList: React.FC<ImagePreviewListProps> = ({
  images,
  onRemove,
  onProcess,
  onClearAll,
}) => {
  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">
          已上传 {images.length} 张图片
        </h3>
        <Button variant="ghost" size="sm" onClick={onClearAll} className="w-full sm:w-auto">
          清空全部
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <ImagePreview
            key={image.id}
            image={image}
            onRemove={onRemove}
            onProcess={onProcess}
          />
        ))}
      </div>
    </div>
  );
};
