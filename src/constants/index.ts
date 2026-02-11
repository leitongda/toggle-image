import { CompressionPreset, ImageFormat } from '@/types';

export const SUPPORTED_FORMATS: ImageFormat[] = ['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'ico', 'tiff', 'original'];

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  jpeg: 'JPEG',
  jpg: 'JPG',
  png: 'PNG',
  webp: 'WebP',
  avif: 'AVIF',
  gif: 'GIF',
  bmp: 'BMP',
  ico: 'ICO',
  tiff: 'TIFF',
  tif: 'TIFF',
  heif: 'HEIF',
  heic: 'HEIC',
  original: '原格式',
};

export const FORMAT_MIME_TYPES: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  heif: 'image/heif',
  heic: 'image/heic',
};

export const FORMAT_DESCRIPTIONS: Record<string, string> = {
  jpeg: '最常用，适合照片',
  png: '支持透明，适合图标',
  webp: '现代格式，体积小',
  avif: '最新格式，压缩率最高',
  gif: '支持动画（静态）',
  bmp: '无压缩，文件大',
  ico: '网站图标专用',
  tiff: '专业印刷格式',
  heif: 'Apple 设备格式',
};

// Common formats for quick selection
export const COMMON_FORMATS: ImageFormat[] = ['jpeg', 'png', 'webp'];

export const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    name: 'high',
    quality: 90,
    description: '高质量 - 文件较大',
  },
  {
    name: 'medium',
    quality: 70,
    description: '中等质量 - 平衡大小与质量',
  },
  {
    name: 'low',
    quality: 50,
    description: '低质量 - 文件最小',
  },
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/avif',
  'image/x-icon',
  'image/heif',
  'image/heic',
];

export const QUALITY_MIN = 1;
export const QUALITY_MAX = 100;
export const QUALITY_DEFAULT = 80;

export const MAX_DIMENSION_DEFAULT = 4096;
