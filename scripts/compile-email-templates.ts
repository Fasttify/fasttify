import { render } from '@react-email/render';
import React from 'react';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Importar templates
import OrderConfirmationEmail, { type OrderConfirmationEmailProps } from '../emails/templates/OrderConfirmationEmail';
import ShippingUpdateEmail, { type ShippingUpdateEmailProps } from '../emails/templates/ShippingUpdateEmail';
import PromotionEmail, { type PromotionEmailProps } from '../emails/templates/PromotionEmail';

// Tipos de templates
export type TemplateVariables = {
  'order-confirmation': OrderConfirmationEmailProps;
  'shipping-update': ShippingUpdateEmailProps;
  promotion: PromotionEmailProps;
};

// Components map
const TEMPLATES = {
  'order-confirmation': OrderConfirmationEmail,
  'shipping-update': ShippingUpdateEmail,
  promotion: PromotionEmail,
} as const;

// Subjects templates
const SUBJECTS = {
  'order-confirmation': 'Pedido confirmado #{{orderId}} - {{storeName}}',
  'shipping-update': 'Tu pedido #{{orderId}} está en camino - {{storeName}}',
  promotion: '{{title}} - {{storeName}}',
} as const;

interface CompiledTemplate {
  html: string;
  text: string;
  subject: string;
  requiredVariables: string[];
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRequiredVariables(templateId: keyof TemplateVariables): string[] {
  const variables = {
    'order-confirmation': [
      'customerName',
      'orderId',
      'total',
      'orderDate',
      'storeName',
      'shippingAddress',
      'billingAddress',
    ],
    'shipping-update': ['customerName', 'orderId', 'trackingNumber', 'carrier', 'storeName'],
    promotion: ['customerName', 'title', 'content', 'storeName'],
  };
  return variables[templateId];
}

function createTemplateWithPlaceholders(templateId: keyof TemplateVariables): any {
  const variables = getRequiredVariables(templateId);
  const data: any = {};

  // Crear placeholders para cada variable
  variables.forEach((variable) => {
    data[variable] = `{{${variable}}}`;
  });

  // Agregar variables opcionales comunes con placeholders
  if (templateId === 'shipping-update') {
    data.trackingUrl = '{{trackingUrl}}';
  }
  if (templateId === 'promotion') {
    data.discountCode = '{{discountCode}}';
    data.discountPercentage = '{{discountPercentage}}';
    data.ctaText = '{{ctaText}}';
    data.ctaUrl = '{{ctaUrl}}';
    data.expirationDate = '{{expirationDate}}';
  }

  return data;
}

async function compileTemplates() {
  console.log('🚀 Compilando templates de React Email...');

  const compiled: Record<string, CompiledTemplate> = {};

  for (const [templateId, Component] of Object.entries(TEMPLATES)) {
    try {
      console.log(`📧 Compilando: ${templateId}`);

      // Crear data con placeholders
      const templateData = createTemplateWithPlaceholders(templateId as keyof TemplateVariables);

      // Renderizar template usando type assertion
      const html = render(React.createElement(Component as any, templateData));
      const text = htmlToText(html);
      const subject = SUBJECTS[templateId as keyof TemplateVariables];
      const requiredVariables = getRequiredVariables(templateId as keyof TemplateVariables);

      compiled[templateId] = {
        html,
        text,
        subject,
        requiredVariables,
      };

      console.log(`✅ ${templateId} compilado exitosamente`);
    } catch (error) {
      console.error(`❌ Error compilando ${templateId}:`, error);
      throw error;
    }
  }

  // Crear directorio de salida
  const outputDir = join(process.cwd(), 'amplify/functions/bulk-email/compiled-templates');
  mkdirSync(outputDir, { recursive: true });

  // Guardar templates compilados
  const outputPath = join(outputDir, 'templates.json');
  writeFileSync(outputPath, JSON.stringify(compiled, null, 2));

  console.log('✅ Todos los templates compilados exitosamente!');
  console.log(`📁 Guardado en: ${outputPath}`);
  console.log(`📊 Total templates: ${Object.keys(compiled).length}`);

  return compiled;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  compileTemplates().catch(console.error);
}

export { compileTemplates };
