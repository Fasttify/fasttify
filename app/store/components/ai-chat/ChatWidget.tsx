'use client'

import { useState, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'
import { RefinedAIAssistant } from './RefinedAiAssistant'

Amplify.configure(outputs)

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={widgetRef}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      ) : (
        <RefinedAIAssistant onClose={() => setIsOpen(false)} />
      )}
    </div>
  )
}
