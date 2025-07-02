import type { Schema } from '../resource';
import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient();

export const handler: Schema['generateProductDescription']['functionHandler'] = async (event, context) => {
  const { productName, category } = event.arguments;

  // Create a prompt for product description generation
  const categoryText = category ? ` en la categoría ${category}` : '';
  const prompt = `Genera una descripción de producto atractiva y persuasiva para un producto llamado "${productName}"${categoryText}. 
  La descripción debe tener entre 100-150 palabras, destacar beneficios clave, características principales y casos de uso. 
  Usa un tono profesional pero amigable. No incluyas precio ni información de envío.`;

  // Invoke model
  const input = {
    modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      system:
        'Eres un experto en copywriting y marketing de productos. Tu tarea es crear descripciones de productos atractivas, persuasivas y optimizadas para SEO. Usa un lenguaje claro, destaca beneficios y características clave, y crea contenido que motive a la compra.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  } as InvokeModelCommandInput;

  const command = new InvokeModelCommand(input);

  const response = await client.send(command);

  // Parse the response and return the generated description
  const data = JSON.parse(Buffer.from(response.body).toString());

  return data.content[0].text;
};
