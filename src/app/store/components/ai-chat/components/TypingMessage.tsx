import { Text, Icon } from '@shopify/polaris';
import { ChatIcon } from '@shopify/polaris-icons';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import '@/app/store/components/ai-chat/styles/chat-markdown.css';

interface TypingMessageProps {
  content: string;
  type: 'user' | 'ai';
  id: string;
}

export function TypingMessage({ content, type, id }: TypingMessageProps) {
  const messageStyles = {
    user: {
      container: 'justify-end',
      background: 'bg-gradient-to-br from-[#2a2a2a] to-[#2f2f2f]',
      textColor: 'text-white',
      borderRadius: 'rounded-2xl rounded-br-none',
      width: 'max-w-[95%]',
      icon: null,
      shadow: 'shadow-lg shadow-black/10',
    },
    ai: {
      container: 'justify-start',
      background: 'bg-transparent',
      textColor: 'text-gray-900',
      borderRadius: 'rounded-none',
      width: 'max-w-full',
      icon: ChatIcon,
      shadow: 'shadow-none',
    },
  };

  const currentStyle = messageStyles[type];

  return (
    <div
      data-message-id={id}
      className={cn(
        'flex w-full py-2',
        type === 'ai' ? 'px-2' : 'px-4',
        currentStyle.container,
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-500'
      )}>
      <div
        className={cn(
          'transition-all duration-200 ease-out message-bubble',
          type === 'ai' ? 'py-2 px-0' : 'p-4',
          currentStyle.background,
          currentStyle.borderRadius,
          currentStyle.width,
          currentStyle.shadow,
          'inline-block',
          type === 'user' ? 'border border-gray-200/50' : 'border-none'
        )}>
        <div className="flex items-start space-x-3">
          {currentStyle.icon && (
            <div className={cn('mt-1', type === 'ai' && 'ai-icon')}>
              <Icon source={currentStyle.icon} tone={type === 'ai' ? 'info' : 'base'} />
            </div>
          )}
          <div
            className={cn(
              'flex-grow break-words',
              currentStyle.textColor,
              type === 'ai' && 'text-base markdown-content'
            )}>
            {type === 'ai' ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  p: ({ children }) => (
                    <Text variant="bodyMd" as="p">
                      {children}
                    </Text>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200">
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => (
                    <Text variant="bodyMd" as="h1" fontWeight="bold">
                      {children}
                    </Text>
                  ),
                  h2: ({ children }) => (
                    <Text variant="bodyMd" as="h2" fontWeight="bold">
                      {children}
                    </Text>
                  ),
                  h3: ({ children }) => (
                    <Text variant="bodyMd" as="h3" fontWeight="semibold">
                      {children}
                    </Text>
                  ),
                  h4: ({ children }) => (
                    <Text variant="bodyMd" as="h4" fontWeight="semibold">
                      {children}
                    </Text>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-800">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2">{children}</pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-300 pl-4 my-2 italic text-gray-600">
                      {children}
                    </blockquote>
                  ),
                }}>
                {content}
              </ReactMarkdown>
            ) : (
              <div className="whitespace-pre-wrap">
                <Text variant="bodyMd" as="p">
                  {content}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
