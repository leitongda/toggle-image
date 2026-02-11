import { ImageFile, ProcessedImageFormats, ImageFormat, ViewMode } from '@/types';
import { formatFileSize } from '@/utils/imageLoader';
import { Button } from '../ui';
import { FORMAT_LABELS } from '@/constants';
import { useState, useEffect, useRef, useCallback } from 'react';
import { UPLOAD_ICONS } from '@/utils/uploadIcons';

interface ImagePreviewModalProps {
  image: ImageFile;
  formats?: ProcessedImageFormats;
  onClose: () => void;
}

// View Mode Selector Component
const ViewModeSelector: React.FC<{
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}> = ({ current, onChange }) => {
  const modes: Array<{ value: ViewMode; label: string; icon: string }> = [
    { value: 'single', label: '单图', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' },
    { value: 'sideBySide', label: '并排对比', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="18" rx="2"/><rect x="13" y="3" width="8" height="18" rx="2"/></svg>' },
    { value: 'slider', label: '滑块对比', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="12" cy="12" r="2"/></svg>' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-1">视图模式:</span>
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${current === mode.value
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          title={mode.label}
        >
          <span dangerouslySetInnerHTML={{ __html: mode.icon }} />
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

// Side by Side Comparison View
const SideBySideView: React.FC<{
  image: ImageFile;
  formats?: ProcessedImageFormats;
  selectedFormat: ImageFormat | 'original';
  zoom: number;
}> = ({ image, formats, selectedFormat, zoom }) => {
  const originalSrc = image.originalUrl;
  const processedSrc = selectedFormat === 'original'
    ? originalSrc
    : formats?.[selectedFormat]?.url || originalSrc;

  const originalSize = image.originalSize;
  const processedSize = selectedFormat === 'original'
    ? originalSize
    : formats?.[selectedFormat]?.size || originalSize;

  const processedFormat = selectedFormat === 'original' ? image.format : selectedFormat;

  // Calculate compression rate if viewing processed image
  const compressionRate = selectedFormat !== 'original' && processedSize && originalSize
    ? -((originalSize - processedSize) / originalSize * 100).toFixed(1)
    : null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Original Image */}
      <div className="flex flex-col">
        <div className="bg-blue-50 px-3 py-1.5 rounded-t-lg border-b border-blue-200">
          <h4 className="text-sm font-semibold text-blue-700">原图</h4>
        </div>
        <div className="flex-1 bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden flex items-center justify-center p-2">
          <div style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}>
            <img
              src={originalSrc}
              alt="原图"
              className="max-w-full max-h-[45vh] object-contain rounded"
            />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 px-2 py-1.5 rounded">
            <span className="text-gray-500">格式:</span>
            <span className="ml-1 font-medium text-gray-800">{image.format.toUpperCase()}</span>
          </div>
          <div className="bg-gray-50 px-2 py-1.5 rounded">
            <span className="text-gray-500">大小:</span>
            <span className="ml-1 font-medium text-gray-800">{formatFileSize(originalSize)}</span>
          </div>
        </div>
      </div>

      {/* Processed Image */}
      <div className="flex flex-col">
        <div className="bg-green-50 px-3 py-1.5 rounded-t-lg border-b border-green-200">
          <h4 className="text-sm font-semibold text-green-700">
            处理后 {selectedFormat !== 'original' && `(${FORMAT_LABELS[selectedFormat as ImageFormat]})`}
          </h4>
        </div>
        <div className="flex-1 bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden flex items-center justify-center p-2">
          <div style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}>
            <img
              src={processedSrc}
              alt="处理后"
              className="max-w-full max-h-[45vh] object-contain rounded"
            />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-50 px-2 py-1.5 rounded">
            <span className="text-gray-500">格式:</span>
            <span className="ml-1 font-medium text-gray-800">{processedFormat.toUpperCase()}</span>
          </div>
          <div className="bg-gray-50 px-2 py-1.5 rounded">
            <span className="text-gray-500">大小:</span>
            <span className="ml-1 font-medium text-gray-800">{formatFileSize(processedSize)}</span>
          </div>
          {compressionRate && (
            <div className="bg-gray-50 px-2 py-1.5 rounded">
              <span className="text-gray-500">压缩:</span>
              <span className="ml-1 font-medium text-green-600">{compressionRate}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Slider Comparison View
const SliderCompareView: React.FC<{
  image: ImageFile;
  formats?: ProcessedImageFormats;
  selectedFormat: ImageFormat | 'original';
  zoom: number;
}> = ({ image, formats, selectedFormat, zoom }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const originalSrc = image.originalUrl;
  const processedSrc = selectedFormat === 'original'
    ? originalSrc
    : formats?.[selectedFormat]?.url || originalSrc;

  const originalSize = image.originalSize;
  const processedSize = selectedFormat === 'original'
    ? originalSize
    : formats?.[selectedFormat]?.size || originalSize;

  const processedFormat = selectedFormat === 'original' ? image.format : selectedFormat;

  const compressionRate = selectedFormat !== 'original' && processedSize && originalSize
    ? -((originalSize - processedSize) / originalSize * 100).toFixed(1)
    : null;

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove as any);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove as any);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="flex flex-col">
      {/* Slider Comparison */}
      <div
        ref={containerRef}
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
        style={{ height: '50vh' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Original Image (Background) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}>
            <img
              src={originalSrc}
              alt="原图"
              className="max-w-full max-h-[50vh] object-contain"
            />
          </div>
        </div>

        {/* Processed Image (Foreground, clipped) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}>
            <img
              src={processedSrc}
              alt="处理后"
              className="max-w-full max-h-[50vh] object-contain"
            />
          </div>
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-medium pointer-events-none">
          原图
        </span>
        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-medium pointer-events-none">
          处理后 {selectedFormat !== 'original' && `(${FORMAT_LABELS[selectedFormat as ImageFormat]})`}
        </span>

        {/* Slider Handle */}
        <div
          className={`absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 ${isDragging ? 'bg-blue-400' : ''}`}
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Handle Circle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-300 hover:border-blue-500 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
        <div className="bg-blue-50 px-3 py-2 rounded">
          <span className="text-blue-600">原图格式:</span>
          <span className="ml-1 font-medium text-blue-800">{image.format.toUpperCase()}</span>
        </div>
        <div className="bg-blue-50 px-3 py-2 rounded">
          <span className="text-blue-600">原图大小:</span>
          <span className="ml-1 font-medium text-blue-800">{formatFileSize(originalSize)}</span>
        </div>
        <div className="bg-green-50 px-3 py-2 rounded">
          <span className="text-green-600">处理后格式:</span>
          <span className="ml-1 font-medium text-green-800">{processedFormat.toUpperCase()}</span>
        </div>
        <div className="bg-green-50 px-3 py-2 rounded">
          <span className="text-green-600">处理后大小:</span>
          <span className="ml-1 font-medium text-green-800">{formatFileSize(processedSize)}</span>
        </div>
        {compressionRate && (
          <div className="col-span-4 bg-gray-50 px-3 py-2 rounded mt-1">
            <span className="text-gray-600">压缩率:</span>
            <span className="ml-1 font-bold text-green-600">{compressionRate}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Image Preview Modal Component
export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  formats,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat | 'original'>('original');
  const [zoom, setZoom] = useState(100);
  const [imageSrc, setImageSrc] = useState(image.originalUrl);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        // Switch to previous format
        const availableFormats: Array<ImageFormat | 'original'> = ['original'];
        if (formats) {
          Object.keys(formats).forEach((format) => {
            if (!availableFormats.includes(format as ImageFormat)) {
              availableFormats.push(format as ImageFormat);
            }
          });
        }
        const currentIndex = availableFormats.indexOf(selectedFormat);
        if (currentIndex > 0) {
          setSelectedFormat(availableFormats[currentIndex - 1]);
        }
      } else if (e.key === 'ArrowRight') {
        // Switch to next format
        const availableFormats: Array<ImageFormat | 'original'> = ['original'];
        if (formats) {
          Object.keys(formats).forEach((format) => {
            if (!availableFormats.includes(format as ImageFormat)) {
              availableFormats.push(format as ImageFormat);
            }
          });
        }
        const currentIndex = availableFormats.indexOf(selectedFormat);
        if (currentIndex < availableFormats.length - 1) {
          setSelectedFormat(availableFormats[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFormat, formats, onClose]);

  useEffect(() => {
    if (selectedFormat === 'original') {
      setImageSrc(image.originalUrl);
    } else if (formats?.[selectedFormat]?.url) {
      setImageSrc(formats[selectedFormat].url!);
    }
  }, [selectedFormat, formats, image.originalUrl]);

  const availableFormats: Array<ImageFormat | 'original'> = ['original'];
  if (formats) {
    Object.keys(formats).forEach((format) => {
      if (!availableFormats.includes(format as ImageFormat)) {
        availableFormats.push(format as ImageFormat);
      }
    });
  }

  const currentFormat =
    selectedFormat === 'original' ? image.format : selectedFormat;
  const currentSize =
    selectedFormat === 'original'
      ? image.originalSize
      : formats?.[selectedFormat]?.size || image.processedSize;

  const compressionRate = selectedFormat !== 'original' && currentSize && image.originalSize
    ? -((image.originalSize - currentSize) / image.originalSize * 100).toFixed(1)
    : null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDownload = async () => {
    let blob: Blob;
    let extension: string;

    if (selectedFormat === 'original') {
      blob = image.file;
      extension = image.format;
    } else if (formats?.[selectedFormat]?.blob) {
      blob = formats[selectedFormat].blob;
      extension = selectedFormat;
    } else {
      return;
    }

    const baseName = image.file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.${extension}`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-4" title={image.file.name}>
            {image.file.name}
          </h3>
          <ViewModeSelector current={viewMode} onChange={setViewMode} />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
            aria-label="关闭"
          >
            {UPLOAD_ICONS.close}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {viewMode === 'single' && (
            <div className="flex items-center justify-center">
              <div
                className="relative"
                style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}
              >
                <img
                  src={imageSrc}
                  alt={image.file.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}

          {viewMode === 'sideBySide' && (
            <SideBySideView
              image={image}
              formats={formats}
              selectedFormat={selectedFormat}
              zoom={zoom}
            />
          )}

          {viewMode === 'slider' && (
            <SliderCompareView
              image={image}
              formats={formats}
              selectedFormat={selectedFormat}
              zoom={zoom}
            />
          )}
        </div>

        {/* Format Tabs */}
        {formats && Object.keys(formats).length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">选择格式:</span>
              <div className="flex gap-2">
                {availableFormats.map((format) => {
                  const formatKey = format as string;
                  const hasFormat =
                    format === 'original' || formats[formatKey]?.blob;

                  return (
                    <button
                      key={format}
                      onClick={() => hasFormat && setSelectedFormat(format as ImageFormat | 'original')}
                      disabled={!hasFormat}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                        ${selectedFormat === format
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                        ${!hasFormat ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      title={format === 'original' ? '原图' : FORMAT_LABELS[format as ImageFormat]}
                    >
                      {format === 'original' ? '原图' : FORMAT_LABELS[format as ImageFormat]}
                    </button>
                  );
                })}
              </div>
              {/* Size difference indicator */}
              {selectedFormat !== 'original' && compressionRate && currentSize && (
                <div className="ml-auto flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-gray-600">压缩率:</span>
                  <span className="text-sm font-bold text-green-600">{compressionRate}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info & Controls */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* File Info (only in single view mode) */}
          {viewMode === 'single' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">尺寸</p>
                <p className="text-sm font-medium text-gray-900">
                  {image.originalWidth} × {image.originalHeight}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">格式</p>
                <p className="text-sm font-medium text-gray-900 uppercase">
                  {currentFormat}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">文件大小</p>
                <p className="text-sm font-medium text-gray-900">
                  {currentSize ? formatFileSize(currentSize) : '-'}
                </p>
              </div>
              {compressionRate && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">压缩率</p>
                  <p className="text-sm font-medium text-green-600">
                    {compressionRate}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          {viewMode === 'single' && (
            <div className="mb-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">→</kbd>
                切换格式
              </span>
              <span className="mx-2">|</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Esc</kbd>
                关闭
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="缩小"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="放大"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <button
                onClick={handleZoomReset}
                className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
              >
                重置
              </button>
            </div>

            {/* Download Button */}
            <Button onClick={handleDownload} variant="primary" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              下载 {selectedFormat === 'original' ? '原图' : FORMAT_LABELS[selectedFormat as ImageFormat]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
