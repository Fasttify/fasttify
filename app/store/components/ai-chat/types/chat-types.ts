export interface Suggestion {
  id: string;
  text: string;
}

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

export interface RefinedAIAssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
  loading: boolean;
  onSubmit: (value: string) => Promise<void>;
  onSuggestionClick: (suggestion: string) => void;
}

export interface ConversationOption {
  label: string;
  value: string;
  timestamp?: string;
  category?: 'today' | 'yesterday' | 'this-week' | 'older';
}

export interface ChatHeaderProps {
  onConversationSelect?: (conversationId: string) => void;
  onNewConversation?: () => void;
  onClose?: () => void;
  conversations?: ConversationOption[];
  loading?: boolean;
  conversationName?: string | null;
}

export interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export interface MessageListProps {
  messages: Message[];
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollRef?: React.RefObject<HTMLDivElement>;
  hasMoreMessages?: boolean;
  loadingMoreMessages?: boolean;
  onLoadMore?: () => Promise<void>;
}
