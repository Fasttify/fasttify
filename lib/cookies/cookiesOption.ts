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

export const getCookieOptions = () => {
  const isProduction = process.env.APP_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    // Agregar dominio en producción si es necesario (no es necesario en local)
    ...(isProduction &&
      process.env.COOKIE_DOMAIN && {
        domain: process.env.COOKIE_DOMAIN,
      }),
  };
};

// Opciones específicas para cookies de carrito
export const getCartCookieOptions = () => {
  const isProduction = process.env.APP_ENV === 'production';

  return {
    httpOnly: false, // No usar httpOnly para cookies del carrito que necesitan ser accesibles desde JS
    secure: isProduction,
    sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
    maxAge: 60 * 60 * 24 * 90, // 90 days para carritos
    path: '/',
    // Agregar dominio en producción si es necesario (no es necesario en local)
    ...(isProduction &&
      process.env.COOKIE_DOMAIN && {
        domain: process.env.COOKIE_DOMAIN,
      }),
  };
};
