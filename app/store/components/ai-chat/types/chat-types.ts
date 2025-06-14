export interface Suggestion {
  id: string
  text: string
}

export interface Message {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
}

export interface RefinedAIAssistantSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: Message[]
  loading: boolean
  onSubmit: (value: string) => Promise<void>
  onSuggestionClick: (suggestion: string) => void
}

export interface ChatHeaderProps {
  isMobile: boolean
  onClose: () => void
}

export interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

export interface MessageListProps {
  messages: Message[]
  loading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  scrollRef?: React.RefObject<HTMLDivElement>
}
