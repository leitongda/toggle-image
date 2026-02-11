import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { formatConverter } from './formatConverter';
import type { DownloadOptions, BatchDownloadOptions } from '@/types/services';
import type { ProcessedImageFormats, ImageFile } from '@/types';

class DownloadService {
  async downloadSingle(options: DownloadOptions): Promise<void> {
    saveAs(options.blob, options.filename);
  }

  async downloadBatch(options: BatchDownloadOptions): Promise<void> {
    const zip = new JSZip();

    for (const file of options.files) {
      zip.file(file.name, file.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, options.zipFilename);
  }

  async downloadImages(
    images: Array<{
      blob: Blob;
      originalName: string;
      targetFormat: string;
    }>,
    zipFilename: string = 'images.zip'
  ): Promise<void> {
    if (images.length === 1) {
      const image = images[0];
      const extension = formatConverter.getFileExtension(image.targetFormat);
      const baseName = image.originalName.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}.${extension}`;
      await this.downloadSingle({ blob: image.blob, filename });
    } else {
      const files = images.map((image) => {
        const extension = formatConverter.getFileExtension(image.targetFormat);
        const baseName = image.originalName.replace(/\.[^/.]+$/, '');
        return {
          name: `${baseName}.${extension}`,
          blob: image.blob,
        };
      });
      await this.downloadBatch({ files, zipFilename });
    }
  }

  async downloadAsZip(
    files: Array<{ name: string; blob: Blob }>,
    filename: string = 'download.zip'
  ): Promise<void> {
    await this.downloadBatch({ files, zipFilename: filename });
  }

  async downloadImagesByFormat(
    images: Array<{
      file: ImageFile;
      formats: ProcessedImageFormats;
    }>,
    zipFilename: string = 'images.zip'
  ): Promise<void> {
    const zip = new JSZip();

    // Create a folder for each format
    for (const image of images) {
      const baseName = image.file.file.name.replace(/\.[^/.]+$/, '');

      for (const [format, data] of Object.entries(image.formats)) {
        const folder = zip.folder(format);
        if (!folder) continue;

        const extension = formatConverter.getFileExtension(format);
        folder.file(`${baseName}.${extension}`, data.blob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, zipFilename);
  }
}

export const downloadService = new DownloadService();
