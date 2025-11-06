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

/**
 * Entidad de dominio: Section
 * Representa una sección de tema con su schema y configuración
 * Entidad pura sin dependencias externas
 */

/**
 * Tipos de settings disponibles en el schema de Shopify
 */
export type SettingType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'html'
  | 'color'
  | 'number'
  | 'range'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'image_picker'
  | 'video'
  | 'url'
  | 'header'
  | 'paragraph'
  | 'inline_richtext';

/**
 * Definición de un setting individual
 */
export interface SettingDefinition {
  type: SettingType;
  id: string;
  label: string;
  default?: unknown;
  info?: string;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

/**
 * Definición de un block dentro de una sección o dentro de otro bloque
 */
export interface BlockDefinition {
  type: string;
  name: string;
  settings?: SettingDefinition[];
  blocks?: BlockDefinition[];
}

/**
 * Preset de configuración predefinida
 */
export interface Preset {
  name: string;
  settings: Record<string, unknown>;
}

/**
 * Schema completo de una sección
 */
export interface SectionSchema {
  name: string;
  settings?: SettingDefinition[];
  blocks?: BlockDefinition[];
  max_blocks?: number;
  presets?: Preset[];
  tag?: string;
  class?: string;
  limit?: number;
}

/**
 * Entidad Section completa
 */
export interface Section {
  name: string;
  type: string;
  schema: SectionSchema;
  content?: string;
}
