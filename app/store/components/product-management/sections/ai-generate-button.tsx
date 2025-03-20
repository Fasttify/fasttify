import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AIGenerateButtonProps {
  onClick: () => Promise<void>
  isLoading: boolean
  isDisabled?: boolean
  label?: string
  loadingLabel?: string
}

export function AIGenerateButton({
  onClick,
  isLoading,
  isDisabled = false,
  label = 'Generar con IA',
  loadingLabel = 'Generando',
}: AIGenerateButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      {/* Glow effect behind button */}
      {!isLoading && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-blue-100/30 rounded-md blur-md"
          animate={{ opacity: isHovered ? 0.7 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <Button
        type="button"
        variant={isLoading ? 'outline' : 'default'}
        size="sm"
        onClick={onClick}
        disabled={isLoading || isDisabled}
        className={cn(
          'h-8 gap-1.5 text-xs relative overflow-hidden transition-all duration-300',
          isLoading ? 'bg-muted' : 'bg-white border border-gray-200',
          !isLoading && !isDisabled && 'hover:shadow-md hover:scale-105 hover:bg-gray-50',
          !isLoading && 'text-gray-800'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isLoading ? (
          <div className="flex items-center">
            <span className="mr-1">{loadingLabel}</span>
            <div className="flex space-x-0.5 overflow-hidden">
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0 }}
                className="inline-block"
              >
                .
              </motion.span>
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2 }}
                className="inline-block"
              >
                .
              </motion.span>
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4 }}
                className="inline-block"
              >
                .
              </motion.span>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            </motion.div>
            <span>{label}</span>

            {/* Subtle particle effect on hover */}
            {isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-300 rounded-full"
                    initial={{
                      x: '50%',
                      y: '50%',
                      opacity: 0.8,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.8 + Math.random(),
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: Math.random() * 0.5,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </Button>
    </div>
  )
}
