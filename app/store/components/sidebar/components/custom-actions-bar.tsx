'use client'

import { ChatTrigger } from '@/app/store/components/ai-chat/components/ChatTrigger'
import { NotificationPopover } from '@/app/store/components/notifications/components/NotificationPopover'

export function CustomActionsBar() {
  return (
    <div className="flex h-12 shrink-0 items-center justify-end px-4 bg-white border-b">
      <div className="flex items-center gap-3">
        <ChatTrigger />
        <NotificationPopover />
      </div>
    </div>
  )
}
