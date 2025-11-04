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
 * Exportaciones de entidades del dominio
 * Barrel export para facilitar las importaciones
 */

export type { Theme } from './theme.entity';
export type { Template, TemplateType, TemplateSection, TemplateBlock } from './template.entity';
export type { Section, SectionSchema, SettingDefinition, SettingType, BlockDefinition, Preset } from './section.entity';
export type { EditorSession, TemplateChange, AppliedChange, ChangeType } from './editor-session.entity';
