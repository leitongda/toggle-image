import { useImageStore } from './stores/imageStore';
import { Header, Footer } from './components/layout';
import {
  ImageUploader,
  ImagePreviewList,
  CompressionSettings,
  DownloadButton,
} from './components/features';
import { Button } from './components/ui';

function App() {
  const {
    images,
    settings,
    isProcessing,
    addImages,
    removeImage,
    clearImages,
    updateSettings,
    processImage,
    processAllImages,
  } = useImageStore();

  const handleProcessAll = async () => {
    await processAllImages();
  };

  const hasImages = images.length > 0;
  const hasCompletedImages = images.some((img) => img.status === 'completed');
  const hasPendingImages = images.some((img) => img.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Upload and Images */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Area */}
            {!hasImages && (
              <div className="mb-8">
                <ImageUploader onUpload={addImages} />
              </div>
            )}

            {/* Image List */}
            {hasImages && (
              <>
                <ImagePreviewList
                  images={images}
                  onRemove={removeImage}
                  onProcess={processImage}
                  onClearAll={clearImages}
                />

                {/* Add More Button */}
                <div className="mt-6">
                  <label htmlFor="add-more" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-400">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span className="text-sm text-gray-600">添加更多图片</span>
                    </div>
                  </label>
                  <input
                    id="add-more"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,image/x-icon,image/heif,image/heic"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        addImages(Array.from(e.target.files));
                      }
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Settings */}
          <div className="space-y-6">
            {/* Compression Settings (includes multi-format selector) */}
            <CompressionSettings
              settings={settings}
              onChange={updateSettings}
            />

            {/* Process All Button */}
            {hasPendingImages && (
              <Button
                onClick={handleProcessAll}
                disabled={isProcessing}
                isLoading={isProcessing}
                variant="primary"
                className="w-full"
                size="lg"
              >
                {isProcessing ? '处理中...' : `处理所有图片 (${images.filter((i) => i.status === 'pending').length})`}
              </Button>
            )}

            {/* Download Button */}
            {hasCompletedImages && (
              <DownloadButton images={images} disabled={isProcessing} />
            )}

            {/* Info Card */}
            {hasImages && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <h4 className="font-medium text-blue-900 mb-2">提示</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 支持多种格式同时导出（JPEG、PNG、WebP、AVIF等）</li>
                  <li>• 点击图片卡片可查看大图和各格式详情</li>
                  <li>• 点击"处理所有图片"批量处理</li>
                  <li>• 处理完成后可选择按格式分文件夹下载</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
