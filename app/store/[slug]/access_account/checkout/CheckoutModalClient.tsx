'use client';

/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CheckoutModal } from '@/app/store/components/checkout-modal/CheckoutModal';
import { CheckoutModalMobile } from '@/app/store/components/checkout-modal/CheckoutModalMobile';
import { useEffect } from 'react';
import useAuthStore from '@/context/core/userStore';

/**
 * Componente cliente que maneja el modal de checkout bloqueante
 * Previene la navegación y aplica efectos visuales al fondo
 */
export function CheckoutModalClient() {
  const { logout } = useAuthStore();
  /**
   * Previene la navegación del usuario mientras está en el modal de checkout
   */
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      // Prevenir navegación hacia atrás
      window.history.pushState(null, '', window.location.href);
    };

    // Agregar el estado actual al historial para prevenir navegación
    window.history.pushState(null, '', window.location.href);

    // Agregar listeners para prevenir navegación
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Bloquear el scroll del body
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = 'unset';
    };
  }, []);

  /**
   * Maneja el cierre de sesión y redirige al login
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Modal para desktop */}
      <div className="hidden lg:block">
        <CheckoutModal open={true} onClose={handleLogout} />
      </div>

      {/* Modal para móvil */}
      <div className="lg:hidden">
        <CheckoutModalMobile open={true} onClose={handleLogout} />
      </div>
    </>
  );
}
