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

import { logger } from '@/renderer-engine/lib/logger';
import { Context, Emitter, Liquid, Tag, TagToken, Template, TopLevelToken } from 'liquidjs';

/**
 * Custom Paginate Tag para Shopify Liquid (Estilo Pasivo).
 * Este tag ya no carga datos. Simplemente busca un objeto `paginate` pre-construido
 * en el contexto y lo pone a disposición de su contenido.
 */
export class PaginateTag extends Tag {
  private templates: Template[] = [];

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    const stream = this.liquid.parser.parseStream(remainTokens);
    stream
      .on('template', (tpl: Template) => this.templates.push(tpl))
      .on('tag:endpaginate', () => stream.stop())
      .on('end', () => {
        throw new Error(`tag ${tagToken.getText()} not closed`);
      });
    stream.start();
  }

  *render(ctx: Context, emitter: Emitter): Generator<unknown, void, unknown> {
    const paginateObject = ctx.getSync(['paginate']);

    if (!paginateObject) {
      logger.warn(
        'Paginate tag was used, but no global paginate object was found in the context. Did you configure pagination in the template schema?',
        undefined,
        'PaginateTag'
      );
      return;
    }

    const scope = { paginate: paginateObject };
    ctx.push(scope);

    try {
      // FIX: No se necesita parseTokens, parseStream ya devuelve templates listos para renderizar.
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
    } finally {
      ctx.pop();
    }
  }
}
