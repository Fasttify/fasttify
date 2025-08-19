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

import { TagToken, Context, Emitter, Tag, TopLevelToken, TokenKind, Liquid } from 'liquidjs';

/**
 * Tag para manejar formularios de Shopify
 * Sintaxis: {% form 'type', object %}...{% endform %}
 *
 * Tipos soportados:
 * - 'contact' : Formulario de contacto
 * - 'newsletter' : Formulario de newsletter
 * - 'product' : Formulario de producto (add to cart)
 * - 'login' : Formulario de login
 * - 'register' : Formulario de registro
 * - 'recover_password' : Formulario de recuperar contraseña
 */
export class FormTag extends Tag {
  private formType: string = '';
  private formObject: any = null;
  private formAttributes: Record<string, string> = {};
  private templateContent: string = '';

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    // Parsear argumentos del tag
    this.parseArguments(tagToken.args);

    // Parsear contenido hasta endform
    this.parseTemplateContent(remainTokens);
  }

  /**
   * Parsea el contenido del template hasta encontrar endform
   */
  private parseTemplateContent(remainTokens: TopLevelToken[]): void {
    const contentTokens: string[] = [];
    let closed = false;

    while (remainTokens.length) {
      const token = remainTokens.shift();
      if (!token) break;

      if (token.kind === TokenKind.Tag && (token as any).name === 'endform') {
        closed = true;
        break;
      }

      if (token.kind === TokenKind.HTML) {
        // Acceder correctamente al contenido HTML
        const htmlToken = token as any;
        const tokenContent = htmlToken.input ? htmlToken.input.substring(htmlToken.begin, htmlToken.end) : '';
        contentTokens.push(tokenContent);
      } else if (token.kind === TokenKind.Output) {
        const outputToken = token as any;
        const tokenContent = outputToken.content || outputToken.value || '';
        contentTokens.push(`{{ ${tokenContent} }}`);
      } else if (token.kind === TokenKind.Tag) {
        const tagToken = token as any;
        const tokenContent = tagToken.content || tagToken.value || '';
        contentTokens.push(`{% ${tokenContent} %}`);
      }
    }

    if (!closed) {
      throw new Error('tag {% form %} not closed');
    }

    this.templateContent = contentTokens.join('');
  }

  /**
   * Parsea los argumentos del tag form
   */
  private parseArguments(args: string): void {
    // Remover espacios y dividir argumentos
    const cleanArgs = args.trim();

    // Ejemplo: 'contact', object, class: 'my-form'
    const parts = cleanArgs.split(',').map((part) => part.trim());

    if (parts.length > 0) {
      // El primer argumento es el tipo de formulario (entre comillas)
      this.formType = parts[0].replace(/['"`]/g, '');
    }

    if (parts.length > 1) {
      // El segundo argumento puede ser un objeto
      this.formObject = parts[1];
    }

    // Parsear atributos adicionales (class, id, etc.)
    for (let i = 2; i < parts.length; i++) {
      const attr = parts[i];
      const [key, value] = attr.split(':').map((s) => s.trim());
      if (key && value) {
        this.formAttributes[key] = value.replace(/['"`]/g, '');
      }
    }
  }

  /**
   * Renderiza el tag form
   */
  *render(ctx: Context, emitter: Emitter): Generator<any, void, unknown> {
    const formAction = this.getFormAction(this.formType);
    const formMethod = this.getFormMethod(this.formType);
    const formClass = this.getFormClass(this.formType);
    const formId = this.getFormId(this.formType);

    // Construir atributos del formulario
    let attributes = `action="${formAction}" method="${formMethod}"`;

    if (formClass) {
      attributes += ` class="${formClass}"`;
    }

    if (formId) {
      attributes += ` id="${formId}"`;
    }

    // Agregar atributos personalizados
    Object.entries(this.formAttributes).forEach(([key, value]) => {
      attributes += ` ${key}="${value}"`;
    });

    // Abrir el formulario
    emitter.write(`<form ${attributes}>`);

    // Agregar campos ocultos necesarios
    this.addHiddenFields(emitter, this.formType);

    // Renderizar contenido interno del formulario
    // Por ahora renderizamos el contenido como texto simple
    // TODO: Procesar el contenido Liquid correctamente
    emitter.write(this.templateContent);

    // Cerrar el formulario
    emitter.write('</form>');
  }

  /**
   * Obtiene la acción del formulario según el tipo
   */
  private getFormAction(type: string): string {
    const actions: Record<string, string> = {
      contact: '/contact',
      newsletter: '/newsletter',
      product: '/cart/add',
      login: '/account/login',
      register: '/account/register',
      recover_password: '/account/recover',
      customer: '/customer',
      storefront_password: '/password',
    };

    return actions[type] || '/contact';
  }

  /**
   * Obtiene el método HTTP del formulario
   */
  private getFormMethod(type: string): string {
    // La mayoría de formularios de Shopify usan POST
    return 'post';
  }

  /**
   * Obtiene la clase CSS del formulario
   */
  private getFormClass(type: string): string {
    const classes: Record<string, string> = {
      contact: 'contact-form',
      newsletter: 'newsletter-form',
      product: 'product-form',
      login: 'login-form',
      register: 'register-form',
      recover_password: 'recover-form',
      customer: 'customer-form',
    };

    return classes[type] || 'form';
  }

  /**
   * Obtiene el ID del formulario
   */
  private getFormId(type: string): string {
    return `${type}-form`;
  }

  /**
   * Agrega campos ocultos necesarios según el tipo de formulario
   */
  private addHiddenFields(emitter: Emitter, type: string): void {
    // Token CSRF (simulado para desarrollo)
    emitter.write('<input type="hidden" name="form_type" value="' + type + '">');
    emitter.write('<input type="hidden" name="utf8" value="✓">');

    // Campos específicos por tipo
    switch (type) {
      case 'contact':
        emitter.write('<input type="hidden" name="contact[subject]" value="General Inquiry">');
        break;

      case 'newsletter':
        emitter.write('<input type="hidden" name="contact[tags]" value="newsletter">');
        break;

      case 'product':
        emitter.write('<input type="hidden" name="return_to" value="/cart">');
        break;

      case 'login':
        emitter.write('<input type="hidden" name="checkout_url" value="">');
        break;
    }
  }
}

// EndFormTag no es necesario ya que FormTag se encarga de abrir y cerrar el formulario
