import { Slider, Input, Button, Card, CardHeader, CardTitle, CardContent } from '../ui';
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
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            快速预设
          </label>
          <div className="flex gap-2">
            {COMPRESSION_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant={settings.quality === preset.quality ? 'primary' : 'outline'}
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
        <Slider
          label="图片质量"
          value={settings.quality}
          onChange={(quality) => onChange({ quality })}
          min={1}
          max={100}
          step={1}
        />

        {/* Max Size */}
        <Input
          type="number"
          label="目标大小 (MB) - 可选"
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

        {/* Max Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="最大宽度"
            placeholder={MAX_DIMENSION_DEFAULT.toString()}
            value={settings.maxWidth || ''}
            onChange={(e) =>
              onChange({
                maxWidth: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            min={1}
          />
          <Input
            type="number"
            label="最大高度"
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
      </CardContent>
    </Card>
  );
};
