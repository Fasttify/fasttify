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

import { Liquid } from 'liquidjs';
import { LiquidInstanceFactory } from './liquid-instance-factory';

/**
 * Gestor de instancia compartida de Liquid para compilación
 *
 * Mantiene una instancia singleton de Liquid que se reutiliza
 * cuando no se requiere un AssetCollector específico
 */
export class SharedLiquidInstance {
  private static instance: Liquid | null = null;

  /**
   * Obtiene la instancia compartida de Liquid para compilación
   * Solo se usa cuando no se requiere un assetCollector específico
   *
   * @returns Instancia compartida de Liquid
   */
  public static getInstance(): Liquid {
    if (!SharedLiquidInstance.instance) {
      SharedLiquidInstance.instance = LiquidInstanceFactory.create();
    }
    return SharedLiquidInstance.instance;
  }

  /**
   * Resetea la instancia compartida
   * Útil para testing o cuando se necesita forzar una nueva instancia
   */
  public static reset(): void {
    SharedLiquidInstance.instance = null;
  }
}
