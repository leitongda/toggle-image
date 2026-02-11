export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 图片格式转换与压缩工具. 所有处理均在本地浏览器完成.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>支持格式:</span>
            <span className="font-medium">JPEG</span>
            <span>•</span>
            <span className="font-medium">PNG</span>
            <span>•</span>
            <span className="font-medium">WebP</span>
            <span>•</span>
            <span className="font-medium">AVIF</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
