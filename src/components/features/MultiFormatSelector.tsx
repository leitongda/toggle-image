import { useEffect } from 'react';
import { ImageFormat } from '@/types';
import { FORMAT_LABELS } from '@/constants';
import { formatConverter } from '@/services/formatConverter';
import { Button, Checkbox, Label } from '@/components/shadcn/ui';

interface MultiFormatSelectorProps {
  values: ImageFormat[];
  onChange: (formats: ImageFormat[]) => void;
  label?: string;
}

// Group formats by category
const COMMON_FORMATS_LIST: ImageFormat[] = ['jpeg', 'png', 'webp'];
const ADDITIONAL_FORMATS: ImageFormat[] = ['avif', 'gif', 'bmp', 'ico'];

const isFormatSupported = (format: ImageFormat): boolean => {
  if (format === 'original') return true;
  return formatConverter.isFormatSupportedInBrowser(format);
};

export const MultiFormatSelector: React.FC<MultiFormatSelectorProps> = ({
  values,
  onChange,
  label = '输出格式（可多选）',
}) => {
  const commonFormats = COMMON_FORMATS_LIST.filter((format) => isFormatSupported(format));
  const additionalFormats = ADDITIONAL_FORMATS.filter((format) => isFormatSupported(format));

  useEffect(() => {
    const sanitized = values.filter((format) => format === 'original' || isFormatSupported(format));

    if (sanitized.length === values.length) {
      return;
    }

    onChange(sanitized.length > 0 ? sanitized : ['original']);
  }, [values, onChange]);

  const handleFormatToggle = (format: ImageFormat) => {
    if (format === 'original') {
      // If original is selected, clear all other formats
      onChange(values.includes(format) ? [] : ['original']);
      return;
    }

    // If a regular format is selected, remove 'original' if present
    let newValues: ImageFormat[] = values.filter((f) => f !== 'original');

    if (newValues.includes(format)) {
      // Remove the format if already selected (but keep at least one)
      newValues = newValues.filter((f) => f !== format);
      if (newValues.length === 0) {
        newValues = ['original' as ImageFormat];
      }
    } else {
      // Add the format
      newValues = [...newValues, format];
    }

    onChange(newValues);
  };

  const handleCommonFormatsSelect = () => {
    onChange(commonFormats.length > 0 ? [...commonFormats] : ['original']);
  };

  const renderCheckbox = (format: ImageFormat) => {
    const isChecked = values.includes(format);
    const checkboxId = `format-${format}`;

    return (
      <Label
        htmlFor={checkboxId}
        key={format}
        className={`
          flex items-start p-3 rounded-lg border cursor-pointer transition-all
          ${isChecked
            ? 'border-ring bg-accent'
            : 'border-border hover:border-ring bg-card'
          }
        `}
      >
        <Checkbox
          id={checkboxId}
          className="mt-0.5"
          checked={isChecked}
          onCheckedChange={() => handleFormatToggle(format)}
        />
        <span className="ml-3 flex-1 font-medium text-foreground">
          {FORMAT_LABELS[format]}
        </span>
      </Label>
    );
  };

  const renderCommonButton = (format: ImageFormat) => {
    const isChecked = values.includes(format);

    return (
      <Button
        key={format}
        type="button"
        size="sm"
        variant={isChecked ? 'default' : 'outline'}
        onClick={() => handleFormatToggle(format)}
        className="h-8"
      >
        {FORMAT_LABELS[format]}
      </Button>
    );
  };

  return (
    <div>
      <Label className="mb-2 block">
        {label}
      </Label>

      {/* Quick select buttons */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleCommonFormatsSelect}
        >
          常用格式 (JPEG/PNG/WebP)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onChange(['original'])}
        >
          原格式
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onChange([])}
        >
          清空
        </Button>
      </div>

      {/* Common formats */}
      <div className="mb-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase">常用格式</p>
        <div className="flex flex-wrap gap-2">
          {commonFormats.map((format) => renderCommonButton(format))}
        </div>
      </div>

      {/* Additional formats */}
      {additionalFormats.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">其他格式</p>
          {additionalFormats.map((format) => renderCheckbox(format))}
        </div>
      )}

      {/* Original format option */}
      <div className="mt-3 pt-3 border-t border-border">
        {renderCheckbox('original')}
      </div>

      {/* Selected count */}
      {values.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          已选择 {values.length} 种格式
        </p>
      )}
    </div>
  );
};
