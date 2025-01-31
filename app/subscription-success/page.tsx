"use client";

import { useState } from "react";
import { WelcomeScreen } from "@/app/subscription-success/components/WelcomeScreen";
import { SubscriptionSuccess } from "@/app/subscription-success/components/SubscriptionSuccess";
import useUserStore from "@/store/userStore";

export default function Page() {
  const [showContent, setShowContent] = useState(false);
  const { user } = useUserStore();


  const userName = user?.nickName || user?.preferredUsername || user?.email || "";

  return (
    <main className="relative">
      <WelcomeScreen
        userName={userName}
        onAnimationComplete={() => setShowContent(true)}
      />
      <SubscriptionSuccess userName={userName} isVisible={showContent} />
    </main>
  );
}
