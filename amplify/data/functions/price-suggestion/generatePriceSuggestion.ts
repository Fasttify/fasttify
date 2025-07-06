import type { Schema } from '../../resource';
import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime';

// Initialize bedrock runtime client
const client = new BedrockRuntimeClient();

export const handler: Schema['generatePriceSuggestion']['functionHandler'] = async (event, context) => {
  // Get product details from arguments
  const { productName, category } = event.arguments;

  try {
    // Prepare the prompt for the AI model - simplified for more reliable parsing
    const prompt = `
Eres un experto en comercio electrónico y dropshipping en Colombia. Necesito un precio de venta competitivo para:

PRODUCTO: ${productName}
${category ? `CATEGORÍA: ${category}` : ''}

Considera:
- Necesitamos un margen de ganancia mínimo del 10% sobre el costo
- El precio debe ser competitivo en el mercado colombiano
- Proporciona precios en pesos colombianos (COP)

Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta (sin texto adicional):
{
  "suggestedPrice": [precio sugerido en COP],
  "minPrice": [precio mínimo en COP],
  "maxPrice": [precio máximo en COP],
  "confidence": "[high|medium|low]",
  "explanation": "[breve análisis]",
}
`;

    // Prepare the input for the model
    const input = {
      modelId: process.env.MODEL_ID || 'us.anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        system:
          'Eres un experto en precios para dropshipping en Colombia. Responde ÚNICAMENTE con el JSON solicitado, sin texto adicional.',
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
        max_tokens: 1000,
        temperature: 0.2,
      }),
    } as InvokeModelCommandInput;

    // Invoke the model
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const data = JSON.parse(Buffer.from(response.body).toString());

    // Extract the response text
    const responseText = data.content[0].text.trim();

    // Try to parse the JSON directly first
    try {
      // Remove any markdown code block syntax if present
      let jsonString = responseText;
      if (responseText.includes('```json')) {
        jsonString = responseText.replace(/```json\n|\n```/g, '');
      } else if (responseText.includes('```')) {
        jsonString = responseText.replace(/```\n|\n```/g, '');
      }

      // Parse the JSON
      const result = JSON.parse(jsonString);

      // Return a standardized response
      return {
        suggestedPrice: typeof result.suggestedPrice === 'number' ? result.suggestedPrice : 100000,
        minPrice: typeof result.minPrice === 'number' ? result.minPrice : 90000,
        maxPrice: typeof result.maxPrice === 'number' ? result.maxPrice : 120000,
        confidence: ['high', 'medium', 'low'].includes(result.confidence) ? result.confidence : 'low',
        explanation: result.explanation || 'Precio basado en análisis de mercado colombiano.',
      };
    } catch (error) {
      console.error('Error parsing AI response:', error, 'Response:', responseText);

      // Fallback response
      return {
        suggestedPrice: 100000,
        minPrice: 90000,
        maxPrice: 120000,
        confidence: 'low',
        explanation: 'No pudimos analizar este producto específicamente. Este es un precio estimado genérico.',
      };
    }
  } catch (error) {
    console.error('Error generating price suggestion:', error);

    // Return a fallback response instead of throwing an error
    return {
      suggestedPrice: 100000,
      minPrice: 90000,
      maxPrice: 120000,
      confidence: 'low',
      explanation: 'Ocurrió un error al generar la sugerencia de precio. Este es un precio estimado genérico.',
    };
  }
};
