import { Slider, Input, Button, Card, CardHeader, CardTitle, CardContent, Label } from '@/components/shadcn/ui';
import { CompressionSettings as CompressionSettingsType, CompressionPreset } from '@/types';
import { COMPRESSION_PRESETS, MAX_DIMENSION_DEFAULT } from '@/constants';
import { MultiFormatSelector } from './MultiFormatSelector';

interface CompressionSettingsProps {
  settings: CompressionSettingsType;
  onChange: (updates: Partial<CompressionSettingsType>) => void;
}

export const CompressionSettings: React.FC<CompressionSettingsProps> = ({ settings, onChange }) => {
  const handlePresetClick = (preset: CompressionPreset) => {
    onChange({ quality: preset.quality });
  };

  const handleFormatChange = (formats: typeof settings.targetFormats) => {
    onChange({
      targetFormats: formats,
      // Also update single targetFormat for backward compatibility
      targetFormat: formats && formats.length > 0 ? formats[0] : 'original',
    });
  };

  const currentFormats = settings.targetFormats || [settings.targetFormat];

  return (
    <Card>
      <CardHeader>
        <CardTitle>压缩设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Multi-Format Selector */}
        <MultiFormatSelector
          values={currentFormats}
          onChange={handleFormatChange}
        />

        {/* Presets */}
        <div>
          <Label className="mb-2 block">
            快速预设
          </Label>
          <div className="flex flex-wrap gap-2">
            {COMPRESSION_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant={settings.quality === preset.quality ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                title={preset.description}
              >
                {preset.name === 'high' && '高质量'}
                {preset.name === 'medium' && '中等质量'}
                {preset.name === 'low' && '低质量'}
              </Button>
            ))}
          </div>
        </div>

        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>图片质量</Label>
            <span className="text-sm text-muted-foreground">{settings.quality}%</span>
          </div>
          <Slider
            value={[settings.quality]}
            onValueChange={(value) => onChange({ quality: value[0] ?? settings.quality })}
            min={1}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Max Size */}
        <div className="space-y-2">
          <Label htmlFor="max-size">目标大小 (MB) - 可选</Label>
          <Input
            id="max-size"
            type="number"
            placeholder="不限制"
            value={settings.maxSizeMB || ''}
            onChange={(e) =>
              onChange({
                maxSizeMB: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            min={0.01}
            step={0.01}
          />
        </div>

        {/* Max Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max-width">最大宽度</Label>
            <Input
              id="max-width"
              type="number"
              placeholder={MAX_DIMENSION_DEFAULT.toString()}
              value={settings.maxWidth || ''}
              onChange={(e) =>
                onChange({
                  maxWidth: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-height">最大高度</Label>
            <Input
              id="max-height"
              type="number"
              placeholder={MAX_DIMENSION_DEFAULT.toString()}
              value={settings.maxHeight || ''}
              onChange={(e) =>
                onChange({
                  maxHeight: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              min={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
