import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../ui';
import { UPLOAD_ICONS } from '@/utils/uploadIcons';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, maxFiles = 50 }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff', '.tif'],
      'image/avif': ['.avif'],
    },
    maxFiles,
    multiple: true,
  });

  return (
    <Card
      {...getRootProps()}
      className={`
        cursor-pointer transition-all duration-200
        ${isDragActive ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500' : 'border-dashed border-2 border-gray-300 hover:border-primary-400'}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 text-primary-600">
          {UPLOAD_ICONS.upload}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isDragActive ? '释放以上传图片' : '拖拽图片到这里'}
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          或点击选择文件
        </p>
        <p className="text-xs text-gray-400">
          支持 JPG、PNG、WebP、AVIF、GIF、BMP、TIFF 格式
          <br />
          最大 {maxFiles} 个文件，单文件最大 50MB
        </p>
      </div>
    </Card>
  );
};
