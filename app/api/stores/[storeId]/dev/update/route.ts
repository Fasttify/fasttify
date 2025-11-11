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

import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { withAuthHandler } from '@/api/_lib/auth-middleware';
import { logger } from '@/liquid-forge';
import { TemplateLoaderAdapter } from '@/app/api/stores/_lib/dev-server/infrastructure/adapters/template-loader.adapter';
import { SectionRendererAdapter } from '@/app/api/stores/_lib/dev-server/infrastructure/adapters/section-renderer.adapter';
import { UpdateSectionSettingUseCase } from '@/app/api/stores/_lib/dev-server/application/use-cases/update-section-setting.use-case';
import { UpdateBlockSettingUseCase } from '@/app/api/stores/_lib/dev-server/application/use-cases/update-block-setting.use-case';
import { UpdateSubBlockSettingUseCase } from '@/app/api/stores/_lib/dev-server/application/use-cases/update-sub-block-setting.use-case';
import { devSessionManager } from '@/app/api/stores/_lib/dev-server/infrastructure/services/dev-session-manager.service';
import { websocketBroadcastService } from '@/app/api/stores/_lib/dev-server/infrastructure/services/websocket-broadcast.service';

const templateLoader = new TemplateLoaderAdapter();
const sectionRenderer = new SectionRendererAdapter();
const updateSectionSettingUseCase = new UpdateSectionSettingUseCase(templateLoader, sectionRenderer);
const updateBlockSettingUseCase = new UpdateBlockSettingUseCase(templateLoader, sectionRenderer);
const updateSubBlockSettingUseCase = new UpdateSubBlockSettingUseCase(templateLoader, sectionRenderer);

/**
 * Endpoint POST para recibir actualizaciones de settings desde el cliente
 * Procesa el cambio y envía la actualización por WebSocket
 */
export const POST = withAuthHandler(
  async (request: NextRequest, { storeId, corsHeaders }) => {
    try {
      const body = await request.json();
      const { type, payload, templateType } = body;

      if (!templateType) {
        return NextResponse.json({ error: 'Missing templateType' }, { status: 400, headers: corsHeaders });
      }

      // Obtener o crear sesión
      let session = devSessionManager.getSession(storeId, templateType);
      if (!session) {
        // Cargar template inicial y crear sesión
        const template = await templateLoader.loadTemplate(storeId, templateType);
        session = devSessionManager.createOrGetSession(storeId, templateType, template);
      }

      let result;

      switch (type) {
        case 'UPDATE_SECTION_SETTING': {
          result = await updateSectionSettingUseCase.execute(payload, templateType, session.template);
          if (result.updatedTemplate) {
            devSessionManager.updateSessionTemplate(storeId, templateType, result.updatedTemplate);
          }
          break;
        }

        case 'UPDATE_BLOCK_SETTING': {
          result = await updateBlockSettingUseCase.execute(payload, templateType, session.template);
          if (result.updatedTemplate) {
            devSessionManager.updateSessionTemplate(storeId, templateType, result.updatedTemplate);
          }
          break;
        }

        case 'UPDATE_SUB_BLOCK_SETTING': {
          result = await updateSubBlockSettingUseCase.execute(payload, templateType, session.template);
          if (result.updatedTemplate) {
            devSessionManager.updateSessionTemplate(storeId, templateType, result.updatedTemplate);
          }
          break;
        }

        default:
          return NextResponse.json({ error: 'Invalid message type' }, { status: 400, headers: corsHeaders });
      }

      // Enviar resultado a través de WebSocket
      if (result.success) {
        websocketBroadcastService.broadcastChangeApplied(storeId, templateType, result).catch((error) => {
          logger.error('Error broadcasting WebSocket message', error, 'UpdateRoute');
        });
      } else {
        websocketBroadcastService
          .broadcastRenderError(storeId, templateType, result.error || 'Unknown error', result.sectionId)
          .catch((error) => {
            logger.error('Error broadcasting WebSocket error', error, 'UpdateRoute');
          });
      }

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
  {
    requireStoreOwnership: true,
    storeIdSource: 'params',
    storeIdParamName: 'storeId',
  }
);

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}
