import { EmptyStateProps } from '@/app/store/components/ai-chat/types/chat-types'
import { SUGGESTIONS } from '@/app/store/components/ai-chat/constants/chat-constants'
import Orb from '@/app/store/components/ai-chat/components/Orb'

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="mb-6 relative">
        <Orb rotateOnHover={false} hoverIntensity={0.0} />
      </div>
      <p className="text-gray-600 text-center mb-6">
        ¿Qué te gustaría saber sobre ecommerce o dropshipping?
      </p>
      <div className="flex flex-col items-end gap-2 w-full">
        {SUGGESTIONS.map(suggestion => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="bg-gray-50 py-2 px-4 rounded-full text-sm shadow-sm transition-all hover:bg-gray-100"
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  )
}
