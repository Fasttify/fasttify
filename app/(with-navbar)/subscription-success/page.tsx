'use client'

import { useState } from 'react'
import { WelcomeScreen } from '@/app/(with-navbar)/subscription-success/components/WelcomeScreen'
import { SubscriptionSuccess } from '@/app/(with-navbar)/subscription-success/components/SubscriptionSuccess'
import useUserStore from '@/zustand-states/userStore'

export default function SubscriptionSuccessPage() {
  const [showContent, setShowContent] = useState(false)
  const { user } = useUserStore()

  const userName = user?.nickName || user?.preferredUsername || user?.email || ''

  return (
    <main className="relative">
      <WelcomeScreen userName={userName} onAnimationComplete={() => setShowContent(true)} />
      <SubscriptionSuccess userName={userName} isVisible={showContent} />
    </main>
  )
}
