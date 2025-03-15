import { Sparkles } from 'lucide-react'

export function GradientSparkles() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" /> {/* Indigo-500 */}
          <stop offset="50%" stopColor="#A855F7" /> {/* Purple-500 */}
          <stop offset="100%" stopColor="#EC4899" /> {/* Pink-500 */}
        </linearGradient>
      </defs>
      <Sparkles stroke="url(#gradient)" className="h-5 w-5" />
    </svg>
  )
}
