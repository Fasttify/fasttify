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

import { z } from 'zod';

/**
 * Schema para validar datos de vista de tienda
 */
export const ServerViewDataSchema = z.object({
  storeId: z.string().min(1),
  sessionId: z.string().min(1),
  timestamp: z.string().datetime(),
  ip: z.string().min(1),
  userAgent: z.string().min(1),
  referrer: z.string().optional(),
  country: z.string().optional(),
  url: z.string().url(),
  path: z.string().min(1),
});

/**
 * Schema para la respuesta de la API
 */
export const TrackVisitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  storeId: z.string().optional(),
});

export type ServerViewData = z.infer<typeof ServerViewDataSchema>;
export type TrackVisitResponse = z.infer<typeof TrackVisitResponseSchema>;
