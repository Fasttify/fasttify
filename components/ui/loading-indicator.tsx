import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type LoadingIndicatorProps = {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showBackdrop?: boolean;
  className?: string;
  textClassName?: string;
};

export function LoadingIndicator({
  text = 'Loading',
  size = 'md',
  showBackdrop = true,
  className,
  textClassName,
}: LoadingIndicatorProps) {
  // Size mappings for dots
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  // Text size mappings
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md dark:bg-background/30',
        className
      )}>
      {/* Loading indicator content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex flex-col items-center ">
        {/* Dots animation */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn('rounded-full bg-primary', dotSizes[size])}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>

        {/* Text with animation if provided */}
        {text && (
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              repeat: Number.POSITIVE_INFINITY,
            }}
            className={cn('font-medium text-foreground mt-4', textSizeClasses[size], textClassName)}>
            {text}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
