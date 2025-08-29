import compiledTemplates from '../compiled-templates/templates.json';

export interface CompiledTemplate {
  html: string;
  text: string;
  subject: string;
  requiredVariables: string[];
}

export class CompiledTemplateService {
  /**
   * Obtiene los templates compilados
   */
  private static getTemplates(): Record<string, CompiledTemplate> {
    try {
      // Los templates ya están importados como JSON estático
      console.log(`✅ Templates compilados cargados: ${Object.keys(compiledTemplates).length} templates`);
      return compiledTemplates as Record<string, CompiledTemplate>;
    } catch (error) {
      console.error('❌ Error accediendo templates compilados:', error);

      // Fallback: templates básicos
      console.log('⚠️  Usando templates fallback');
      return this.getFallbackTemplates();
    }
  }

  /**
   * Renderiza un template con las variables proporcionadas
   */
  static renderTemplate(
    templateId: string,
    variables: Record<string, any>
  ): {
    html: string;
    text: string;
    subject: string;
  } {
    const templates = this.getTemplates();
    const template = templates[templateId];

    if (!template) {
      throw new Error(
        `Template no encontrado: ${templateId}. Templates disponibles: ${Object.keys(templates).join(', ')}`
      );
    }

    // Validar variables requeridas
    const missingVars = template.requiredVariables.filter(
      (varName) => !(varName in variables) || variables[varName] === undefined || variables[varName] === null
    );

    if (missingVars.length > 0) {
      console.warn(`⚠️  Variables faltantes para ${templateId}: ${missingVars.join(', ')}`);
    }

    // Reemplazar variables en HTML, texto y subject
    const html = this.replaceVariables(template.html, variables);
    const text = this.replaceVariables(template.text, variables);
    const subject = this.replaceVariables(template.subject, variables);

    return { html, text, subject };
  }

  /**
   * Reemplaza variables en un string usando la sintaxis {{variable}}
   */
  private static replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;

    // Reemplazar variables obligatorias
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });

    // Limpiar variables no reemplazadas (opcional)
    result = result.replace(/{{[^}]+}}/g, '');

    return result;
  }

  /**
   * Obtiene la lista de templates disponibles
   */
  static getAvailableTemplates(): string[] {
    const templates = this.getTemplates();
    return Object.keys(templates);
  }

  /**
   * Valida que un template existe
   */
  static isValidTemplate(templateId: string): boolean {
    const templates = this.getTemplates();
    return templateId in templates;
  }

  /**
   * Obtiene información sobre un template
   */
  static getTemplateInfo(templateId: string): CompiledTemplate | null {
    const templates = this.getTemplates();
    return templates[templateId] || null;
  }

  /**
   * Templates de fallback en caso de que no se puedan cargar los compilados
   */
  private static getFallbackTemplates(): Record<string, CompiledTemplate> {
    return {
      'order-confirmation': {
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #333; color: white; padding: 20px; text-align: center;">
                <h1>¡Pedido Confirmado!</h1>
              </div>
              <div style="padding: 20px;">
                <p>Hola {{customerName}},</p>
                <p>Tu pedido <strong>#{{orderId}}</strong> ha sido confirmado.</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
                  <p><strong>Total:</strong> {{total}}</p>
                  <p><strong>Fecha:</strong> {{orderDate}}</p>
                </div>
                <p>Gracias por tu compra,<br>Equipo de {{storeName}}</p>
              </div>
            </body>
          </html>
        `,
        text: 'Pedido Confirmado! Hola {{customerName}}, tu pedido #{{orderId}} ha sido confirmado. Total: {{total}}. Fecha: {{orderDate}}. Gracias por tu compra, Equipo de {{storeName}}',
        subject: 'Pedido confirmado #{{orderId}} - {{storeName}}',
        requiredVariables: ['customerName', 'orderId', 'total', 'orderDate', 'storeName'],
      },
      'shipping-update': {
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
                <h1>¡Tu pedido está en camino!</h1>
              </div>
              <div style="padding: 20px;">
                <p>Hola {{customerName}},</p>
                <p>Tu pedido <strong>#{{orderId}}</strong> ha sido enviado.</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
                  <p><strong>Seguimiento:</strong> {{trackingNumber}}</p>
                  <p><strong>Transportadora:</strong> {{carrier}}</p>
                </div>
                <p>Saludos,<br>Equipo de {{storeName}}</p>
              </div>
            </body>
          </html>
        `,
        text: 'Tu pedido está en camino! Hola {{customerName}}, tu pedido #{{orderId}} ha sido enviado. Seguimiento: {{trackingNumber}}. Transportadora: {{carrier}}. Saludos, Equipo de {{storeName}}',
        subject: 'Tu pedido #{{orderId}} está en camino - {{storeName}}',
        requiredVariables: ['customerName', 'orderId', 'trackingNumber', 'carrier', 'storeName'],
      },
      promotion: {
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
                <h1>{{title}}</h1>
              </div>
              <div style="padding: 20px;">
                <p>Hola {{customerName}},</p>
                <div style="background: #fff3cd; padding: 15px; margin: 20px 0;">
                  {{content}}
                </div>
                <p>Saludos,<br>Equipo de {{storeName}}</p>
              </div>
            </body>
          </html>
        `,
        text: '{{title}} Hola {{customerName}}, {{content}} Saludos, Equipo de {{storeName}}',
        subject: '{{title}} - {{storeName}}',
        requiredVariables: ['customerName', 'title', 'content', 'storeName'],
      },
    };
  }
}

export default CompiledTemplateService;
