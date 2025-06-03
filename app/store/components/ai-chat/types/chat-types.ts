export interface Suggestion {
  id: string
  text: string
}

export interface RefinedAIAssistantSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface ChatHeaderProps {
  isMobile: boolean
  onClose: () => void
}

export interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

export interface MessageListProps {
  messages: Array<{
    id: string
    content: string
    type: 'user' | 'ai'
    timestamp: Date
  }>
  loading: boolean
  expandedMessages: Record<string, boolean>
  onToggleExpansion: (messageId: string) => void
  scrollRef: React.RefObject<HTMLDivElement>
  messagesEndRef: React.RefObject<HTMLDivElement>
}
