export const Footer = () => {
  return (
    <footer className="bg-muted/20 border-t border-border mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 图片格式转换与压缩工具. 所有处理均在本地浏览器完成.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>支持格式:</span>
            <span className="font-medium text-foreground">JPEG</span>
            <span>•</span>
            <span className="font-medium text-foreground">PNG</span>
            <span>•</span>
            <span className="font-medium text-foreground">WebP</span>
            <span>•</span>
            <span className="font-medium text-foreground">AVIF</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
