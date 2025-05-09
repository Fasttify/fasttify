import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefinedAIAssistantSheet } from '@/app/store/components/ai-chat/RefinedAiAssistant'
import { GradientSparkles } from '@/app/store/components/ai-chat/GradientSparkles'

export function ChatTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative text-gray-700 hover:bg-gray-100"
      >
        <GradientSparkles className="w-30 h-30" />
      </Button>

      <RefinedAIAssistantSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
