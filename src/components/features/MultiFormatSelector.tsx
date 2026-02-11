import { ImageFormat } from '@/types';
import { FORMAT_LABELS, FORMAT_DESCRIPTIONS } from '@/constants';
import { formatConverter } from '@/services/formatConverter';

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
    onChange([...COMMON_FORMATS_LIST]);
  };

  const renderCheckbox = (format: ImageFormat, description?: string) => {
    const isSupported = isFormatSupported(format);
    const isChecked = values.includes(format);

    return (
      <label
        key={format}
        className={`
          flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all
          ${isChecked
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
          }
          ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={isChecked}
          onChange={() => isSupported && handleFormatToggle(format)}
          disabled={!isSupported}
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">
              {FORMAT_LABELS[format]}
            </span>
            {!isSupported && (
              <span className="text-xs text-gray-500">浏览器不支持</span>
            )}
          </div>
          {description && (
            <span className="text-sm text-gray-500">{description}</span>
          )}
        </div>
      </label>
    );
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </label>

      {/* Quick select buttons */}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={handleCommonFormatsSelect}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          常用格式 (JPEG/PNG/WebP)
        </button>
        <button
          type="button"
          onClick={() => onChange(['original'])}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          原格式
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          清空
        </button>
      </div>

      {/* Common formats */}
      <div className="mb-3 space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase">常用格式</p>
        {COMMON_FORMATS_LIST.map((format) =>
          renderCheckbox(format, FORMAT_DESCRIPTIONS[format])
        )}
      </div>

      {/* Additional formats */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase">其他格式</p>
        {ADDITIONAL_FORMATS.map((format) =>
          renderCheckbox(format, FORMAT_DESCRIPTIONS[format])
        )}
      </div>

      {/* Original format option */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        {renderCheckbox('original', '保持原始格式')}
      </div>

      {/* Selected count */}
      {values.length > 0 && (
        <p className="mt-3 text-sm text-gray-600">
          已选择 {values.length} 种格式
        </p>
      )}
    </div>
  );
};
