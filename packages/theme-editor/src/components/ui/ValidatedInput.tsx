import { forwardRef, useCallback } from 'react';

interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  autoFocus?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ value, onChange, onKeyDown, placeholder, error, className = '', autoFocus }, ref) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    return (
      <div className="space-y-1">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full text-xs py-1 px-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${error ? 'border-red-300' : ''} ${className}`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';
