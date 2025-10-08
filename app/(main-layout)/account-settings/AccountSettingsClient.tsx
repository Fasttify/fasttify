'use client';

import { AccountSettings } from '@/app/(main-layout)/account-settings/components/AccountSettings';
import { ActiveSessions } from '@/app/(main-layout)/account-settings/components/ActiveSessions';
import { PaymentSettings } from '@/app/(main-layout)/account-settings/components/PaymentSettings';
import { Sidebar } from '@/app/(main-layout)/account-settings/components/SideBar';
import { useAuth } from '@/context/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function AccountSettingsContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [currentView, setCurrentView] = useState(sectionParam || 'cuenta');
  const { user, loading } = useAuth();

  const isGoogleUser = user?.identities?.some(
    (identity) => identity.providerType === 'Google' || identity.providerName === 'Google'
  );

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        hideSessionsOption={isGoogleUser}
        isUserLoading={loading}
      />
      <div className="p-6">
        {currentView === 'cuenta' && <AccountSettings />}
        {currentView === 'pagos' && <PaymentSettings />}
        {!isGoogleUser && currentView === 'sesiones' && <ActiveSessions />}
        {/* Si es Google user y está en sesiones, mostrar cuenta */}
        {isGoogleUser && currentView === 'sesiones' && <AccountSettings />}
      </div>
    </div>
  );
}

export default function AccountSettingsClient() {
  return (
    <div className="overflow-x-hidden">
      <Suspense>
        <AccountSettingsContent />
      </Suspense>
    </div>
  );
}
