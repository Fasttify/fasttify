/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { invalidateUserCache } from '@/middlewares/auth/auth';

/**
 * Invalida el cache de autenticación cuando se actualiza el plan del usuario
 *
 * @param userId - ID del usuario cuyo cache debe ser invalidado
 *
 * @example
 * // Cuando se actualiza el plan del usuario
 * await updateUserPlan(userId, 'Royal');
 * invalidateUserCache(userId);
 *
 * // Cuando se cambia el tipo de usuario
 * await updateUserType(userId, 'store_owner');
 * invalidateUserCache(userId);
 */
export function invalidateUserAuthCache(userId: string): void {
  console.log(`Invalidating auth cache for user: ${userId}`);
  invalidateUserCache(userId);
}

/**
 * Invalida el cache de múltiples usuarios
 *
 * @param userIds - Array de IDs de usuarios
 */
export function invalidateMultipleUsersCache(userIds: string[]): void {
  console.log(`Invalidating auth cache for ${userIds.length} users`);
  userIds.forEach((userId) => {
    invalidateUserCache(userId);
  });
}
