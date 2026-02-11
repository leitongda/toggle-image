import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui';
import { formatConverter } from '@/services/formatConverter';
import { FORMAT_LABELS } from '@/constants';
import { ImageFormat } from '@/types';

interface FormatSelectorProps {
  value: ImageFormat;
  onChange: (format: ImageFormat) => void;
  label?: string;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  value,
  onChange,
  label = '输出格式',
}) => {
  const supportedFormats = formatConverter.getSupportedFormats();
  const availableFormats = ['original', ...supportedFormats] as ImageFormat[];
  const selectId = 'format-selector';

  return (
    <div className="space-y-2">
      <Label htmlFor={selectId}>{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next as ImageFormat)}>
        <SelectTrigger id={selectId}>
          <SelectValue placeholder="请选择输出格式" />
        </SelectTrigger>
        <SelectContent>
          {availableFormats.map((format) => (
            <SelectItem key={format} value={format}>
              {FORMAT_LABELS[format]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
