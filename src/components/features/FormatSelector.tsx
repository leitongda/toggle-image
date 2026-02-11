import { Select } from '../ui';
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

  const options = availableFormats.map((format) => {
    const isSupported = format === 'original' || formatConverter.isFormatSupportedInBrowser(format);
    return {
      value: format,
      label: FORMAT_LABELS[format],
      disabled: !isSupported,
    };
  });

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as ImageFormat)}
      options={options}
    />
  );
};
