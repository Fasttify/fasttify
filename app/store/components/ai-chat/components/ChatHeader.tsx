import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { GradientSparkles } from '@/app/store/components/ai-chat/components/GradientSparkles'
import { ChatHeaderProps } from '@/app/store/components/ai-chat/types/chat-types'

export function ChatHeader({ isMobile, onClose }: ChatHeaderProps) {
  return (
    <SheetHeader className="flex items-center bg-white/50 backdrop-blur-sm border-b border-gray-200 shrink-0">
      {isMobile && (
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-2 w-2 rounded-full -ml-96"
          aria-label="Regresar"
        >
          <ChevronLeft className="h-6 w-6 scale-150 text-gray-900" />
        </Button>
      )}
      <div className="flex flex-1 justify-center items-center gap-2">
        <GradientSparkles />
        <SheetTitle className="font-medium text-gray-800">FastBot</SheetTitle>
      </div>
    </SheetHeader>
  )
}
