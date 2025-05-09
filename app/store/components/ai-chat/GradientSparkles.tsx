import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type GradientSparklesProps = {
  className?: string
}

export function GradientSparkles({ className }: GradientSparklesProps) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <Sparkles stroke="url(#gradient)" className="w-full h-full" />
    </svg>
  )
}
