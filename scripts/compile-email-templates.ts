import { render } from '@react-email/render';
import React from 'react';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import OrderConfirmationEmail, { type OrderConfirmationEmailProps } from '@/emails/templates/OrderConfirmationEmail';
import OrderStatusUpdateEmail, { type OrderStatusUpdateEmailProps } from '@/emails/templates/OrderStatusUpdateEmail';
import ShippingUpdateEmail, { type ShippingUpdateEmailProps } from '@/emails/templates/ShippingUpdateEmail';
import PromotionEmail, { type PromotionEmailProps } from '@/emails/templates/PromotionEmail';
import WelcomeEmail, { type WelcomeEmailProps } from '@/emails/templates/WelcomeEmail';
import PasswordResetEmail, { type PasswordResetEmailProps } from '@/emails/templates/PasswordResetEmail';

/**
 * Define los tipos de variables esperados para cada plantilla de correo electrónico.
 */
export type TemplateVariables = {
  'order-confirmation': OrderConfirmationEmailProps;
  'order-status-update': OrderStatusUpdateEmailProps;
  'shipping-update': ShippingUpdateEmailProps;
  promotion: PromotionEmailProps;
  welcome: WelcomeEmailProps;
  'password-reset': PasswordResetEmailProps;
};

/**
 * Mapeo de IDs de plantilla a sus componentes React correspondientes.
 */
const TEMPLATES = {
  'order-confirmation': OrderConfirmationEmail,
  'order-status-update': OrderStatusUpdateEmail,
  'shipping-update': ShippingUpdateEmail,
  promotion: PromotionEmail,
  welcome: WelcomeEmail,
  'password-reset': PasswordResetEmail,
} as const;

/**
 * Asuntos de correo electrónico predefinidos para cada plantilla, con marcadores de posición.
 */
const SUBJECTS = {
  'order-confirmation': 'Pedido confirmado #{{orderId}} - {{storeName}}',
  'order-status-update': 'Estado del pedido actualizado #{{orderId}} - {{storeName}}',
  'shipping-update': 'Tu pedido #{{orderId}} está en camino - {{storeName}}',
  promotion: '{{title}} - {{storeName}}',
  welcome: '¡Bienvenido a Fasttify! Tu prueba gratuita del plan {{planName}} está activa',
  'password-reset': 'Restablecer contraseña - {{storeName}}',
} as const;

/**
 * Interfaz para la estructura de una plantilla de correo electrónico compilada.
 */
interface CompiledTemplate {
  html: string;
  text: string;
  subject: string;
  requiredVariables: string[];
}

/**
 * Convierte HTML a texto plano eliminando etiquetas y normalizando espacios.
 * @param html El contenido HTML a convertir.
 * @returns El contenido en texto plano.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Obtiene las variables requeridas para una plantilla específica.
 * @param templateId El ID de la plantilla.
 * @returns Un array de nombres de variables requeridas.
 */
function getRequiredVariables(templateId: keyof TemplateVariables): string[] {
  const variables = {
    'order-confirmation': [
      'customerName',
      'orderId',
      'total',
      'orderDate',
      'storeName',
      'orderStatus',
      'paymentStatus',
      'shippingAddress',
      'billingAddress',
    ],
    'order-status-update': [
      'customerName',
      'orderId',
      'total',
      'orderDate',
      'storeName',
      'previousOrderStatus',
      'newOrderStatus',
      'previousPaymentStatus',
      'newPaymentStatus',
      'shippingAddress',
      'billingAddress',
      'updateNotes',
    ],
    'shipping-update': ['customerName', 'orderId', 'trackingNumber', 'carrier', 'storeName'],
    promotion: ['customerName', 'title', 'content', 'storeName'],
    welcome: ['customerName', 'trialEndDate', 'storeName', 'planName', 'currentYear'],
    'password-reset': ['customerName', 'resetCode', 'storeName', 'currentYear'],
  };
  return variables[templateId];
}

/**
 * Crea un objeto de datos con marcadores de posición para las variables de la plantilla.
 * Si la plantilla requiere variables adicionales no estándar, se añaden aquí.
 * @param templateId El ID de la plantilla.
 * @returns Un objeto con variables y sus marcadores de posición, listo para ser renderizado.
 */
function createTemplateWithPlaceholders(templateId: keyof TemplateVariables): any {
  const variables = getRequiredVariables(templateId);
  const data: any = {};

  variables.forEach((variable) => {
    data[variable] = `{{${variable}}}`;
  });

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

/**
 * Genera y escribe un archivo de plantilla de correo electrónico específico.
 * Esta función se utiliza para plantillas como la de bienvenida y restablecimiento de contraseña,
 * que requieren archivos .ts separados con funciones auxiliares.
 * @param templateId El ID de la plantilla ('welcome' o 'password-reset').
 * @param compiledTemplate La plantilla compilada que contiene HTML, texto y asunto.
 * @param outputPathDir El directorio donde se guardará el archivo generado.
 * @param functionNamePrefix Un prefijo para los nombres de las funciones generadas (e.g., 'post-confirmation').
 * @param templateName El nombre de la constante que contendrá la plantilla compilada en el archivo generado.
 * @param replaceVariablesFunctionName El nombre de la función generada para reemplazar variables en el template.
 * @param generateHtmlFunctionName El nombre de la función generada para obtener el HTML con variables reemplazadas.
 * @param generateSubjectFunctionName El nombre de la función generada para obtener el asunto con variables reemplazadas.
 */
function generateAndWriteSpecificTemplate(
  templateId: 'welcome' | 'password-reset',
  compiledTemplate: CompiledTemplate,
  outputPathDir: string,
  functionNamePrefix: string,
  templateName: string,
  replaceVariablesFunctionName: string,
  generateHtmlFunctionName: string,
  generateSubjectFunctionName: string
) {
  mkdirSync(outputPathDir, { recursive: true });

  const templateContent = `// Template de ${templateId.replace('-', ' ')} compilado para ${functionNamePrefix.toLowerCase()}
// Este archivo se genera automáticamente - no editar manualmente

export const ${templateName} = {
  html: \`${compiledTemplate.html.replace(/`/g, '\\`')}\`,
  text: \`${compiledTemplate.text.replace(/`/g, '\\`')}\`,
  subject: \`${compiledTemplate.subject.replace(/`/g, '\\`')}\`,
  requiredVariables: ${JSON.stringify(compiledTemplate.requiredVariables)}
};

/**
 * Reemplaza variables en el template HTML.
 * @param html El contenido HTML original.
 * @param variables Un objeto con las variables a reemplazar.
 * @returns El HTML con las variables reemplazadas.
 */
export function ${replaceVariablesFunctionName}(html: string, variables: Record<string, any>): string {
  let result = html;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(\`{{\${key}}}\`, 'g');
    result = result.replace(regex, String(value || ''));
  });

  // Limpiar variables no reemplazadas
  result = result.replace(/{{[^}]+}}/g, '');

  return result;
}

/**
 * Genera el HTML del email de ${templateId.replace('-', ' ')}.
 * @param variables Las variables necesarias para el email.
 * @returns El HTML final del email.
 */
export function ${generateHtmlFunctionName}(variables: {
  ${compiledTemplate.requiredVariables.map((v) => `${v}?: string;`).join('\n  ')}
}): string {
  return ${replaceVariablesFunctionName}(${templateName}.html, variables);
}

/**
 * Genera el asunto del email de ${templateId.replace('-', ' ')}.
 * @param variables Las variables necesarias para el asunto.
 * @returns El asunto final del email.
 */
export function ${generateSubjectFunctionName}(variables: {
  ${compiledTemplate.requiredVariables.map((v) => `${v}?: string;`).join('\n  ')}
}): string {
  return ${replaceVariablesFunctionName}(${templateName}.subject, variables);
}
`;

  const outputPath = join(outputPathDir, `${templateId}-email-compiled.ts`);
  writeFileSync(outputPath, templateContent);
  console.log(`Template de ${templateId.replace('-', ' ')} generado en: ${outputPath}`);
}

/**
 * Compila todas las plantillas de correo electrónico y las guarda en los formatos necesarios.
 * Las plantillas de bienvenida y restablecimiento de contraseña se guardan en archivos separados.
 * El resto se compila en un único archivo JSON para uso general.
 * @returns Un objeto con todas las plantillas compiladas.
 */
async function compileTemplates() {
  console.log('Compilando templates de React Email...');

  const compiled: Record<string, CompiledTemplate> = {};

  for (const [templateId, Component] of Object.entries(TEMPLATES)) {
    try {
      console.log(`Compilando: ${templateId}`);

      const templateData = createTemplateWithPlaceholders(templateId as keyof TemplateVariables);

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

      console.log(`${templateId} compilado exitosamente`);
    } catch (error) {
      console.error(`Error compilando ${templateId}:`, error);
      throw error;
    }
  }

  const outputDir = join(process.cwd(), 'amplify/functions/bulk-email/compiled-templates');
  mkdirSync(outputDir, { recursive: true });

  // Guardar templates compilados (excluyendo welcome y password-reset que se manejan por separado)
  const bulkEmailTemplates = { ...compiled };
  delete bulkEmailTemplates.welcome;
  delete bulkEmailTemplates['password-reset'];

  const outputPath = join(outputDir, 'templates.json');
  writeFileSync(outputPath, JSON.stringify(bulkEmailTemplates, null, 2));

  if (compiled.welcome) {
    generateAndWriteSpecificTemplate(
      'welcome',
      compiled.welcome,
      join(process.cwd(), 'amplify/auth/post-confirmation/services/templates'),
      'post-confirmation',
      'welcomeEmailTemplate',
      'replaceWelcomeEmailVariables',
      'generateWelcomeEmailHTML',
      'generateWelcomeEmailSubject'
    );
  }

  // Generar archivo específico para el template de restablecimiento de contraseña (custom-message)
  if (compiled['password-reset']) {
    generateAndWriteSpecificTemplate(
      'password-reset',
      compiled['password-reset'],
      join(process.cwd(), 'amplify/auth/custom-message/services/templates'),
      'custom-message',
      'passwordResetEmailTemplate',
      'replacePasswordResetEmailVariables',
      'generatePasswordResetEmailHTML',
      'generatePasswordResetEmailSubject'
    );
  }

  console.log('Todos los templates compilados exitosamente!');
  console.log(`Guardado en: ${outputPath}`);
  console.log(`Total templates: ${Object.keys(compiled).length}`);

  return compiled;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  compileTemplates().catch(console.error);
}

export { compileTemplates };
