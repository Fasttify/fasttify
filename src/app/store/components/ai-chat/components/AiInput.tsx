'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAutoResizeTextarea } from '@/hooks/ui/use-auto-resize-textare';
import { Button } from '@shopify/polaris';
import { SendIcon, StopCircleIcon } from '@shopify/polaris-icons';

interface AIInputWithSearchProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string, withSearch: boolean) => void;
  onFileSelect?: (file: File) => void;
  className?: string;
  loading?: boolean;
  onStop?: () => void;
}

export function AIInputWithSearch({
  id = 'ai-input-with-search',
  placeholder = 'Search the web...',
  minHeight = 48,
  maxHeight = 164,
  onSubmit: _onSubmit,
  onFileSelect: _onFileSelect,
  className,
  loading = false,
  onStop,
}: AIInputWithSearchProps) {
  const [value, setValue] = useState('');
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });
  const [showSearch, _setShowSearch] = useState(true);

  const handleSubmit = () => {
    if (value.trim()) {
      _onSubmit?.(value, showSearch);
      setValue('');
      adjustHeight(true);
    }
  };

  return (
    <div className={cn('w-full py-4', className)}>
      <div className="relative max-w-xl w-full mx-auto">
        <div className="relative flex flex-col">
          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
            <Textarea
              id={id}
              value={value}
              placeholder={placeholder}
              className="w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 leading-[1.2]"
              ref={textareaRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
            />
          </div>

          <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
            <div className="absolute right-3 bottom-3">
              {loading ? (
                <Button
                  variant="plain"
                  size="slim"
                  onClick={onStop}
                  icon={StopCircleIcon}
                  accessibilityLabel="Detener respuesta"
                />
              ) : (
                <Button
                  variant="plain"
                  size="slim"
                  onClick={handleSubmit}
                  icon={SendIcon}
                  accessibilityLabel="Enviar mensaje"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
