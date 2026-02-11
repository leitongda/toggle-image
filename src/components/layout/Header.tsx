import { Button } from '@/components/shadcn/ui';

interface HeaderProps {
  canInstall?: boolean;
  onInstall?: () => void;
}

export const Header = ({ canInstall = false, onInstall }: HeaderProps) => {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">图片格式转换与压缩工具</h1>
              <p className="text-sm text-muted-foreground">纯前端处理，保护隐私</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            所有处理在浏览器中完成
          </div>
          {canInstall && (
            <Button
              onClick={onInstall}
              size="sm"
              className="h-10 px-3 sm:px-4 whitespace-nowrap"
            >
              安装应用
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
