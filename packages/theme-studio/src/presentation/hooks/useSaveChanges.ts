/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { SaveChangesUseCase } from '../../application/use-cases/save-changes.use-case';
import { TemplateManagerAdapter } from '../../infrastructure/adapters/template-manager.adapter';
import { TemplateRepositoryAdapter } from '../../infrastructure/adapters/template-repository.adapter';
import type { TemplateType } from '../../domain/entities/template.entity';

interface UseSaveChangesParams {
  storeId: string;
  apiBaseUrl: string;
  templateManager: TemplateManagerAdapter | null;
  templateType: TemplateType;
}

interface UseSaveChangesResult {
  save: () => Promise<void>;
  isSaving: boolean;
}

/**
 * Hook de presentación: useSaveChanges
 * Proporciona funcionalidad para guardar cambios
 */
export function useSaveChanges({
  storeId,
  apiBaseUrl,
  templateManager,
  templateType,
}: UseSaveChangesParams): UseSaveChangesResult {
  const saveChangesUseCaseRef = useRef<SaveChangesUseCase | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar caso de uso cuando el template manager esté disponible
  useEffect(() => {
    if (templateManager) {
      const templateRepository = new TemplateRepositoryAdapter(apiBaseUrl);
      saveChangesUseCaseRef.current = new SaveChangesUseCase(templateManager, templateRepository);
    }
  }, [templateManager, apiBaseUrl]);

  const save = useCallback(async () => {
    if (!saveChangesUseCaseRef.current || !templateManager) {
      return;
    }

    if (!templateManager.hasPendingChanges()) {
      return; // No hay cambios para guardar
    }

    setIsSaving(true);
    try {
      await saveChangesUseCaseRef.current.execute(storeId, templateType);
    } catch (error) {
      console.error('Error saving changes:', error);
      // No limpiar pendingChanges si hay error
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [storeId, templateType, templateManager]);

  return {
    save,
    isSaving,
  };
}
