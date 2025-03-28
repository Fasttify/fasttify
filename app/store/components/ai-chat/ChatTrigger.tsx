import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RefinedAIAssistantSheet } from '@/app/store/components/ai-chat/RefinedAiAssistant'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function ChatTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative text-gray-700 hover:bg-gray-100"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Asistente AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <RefinedAIAssistantSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
