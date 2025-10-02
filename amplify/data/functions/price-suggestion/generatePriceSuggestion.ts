import type { Schema } from '../../resource';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import {
  PRICE_SUGGESTION_SYSTEM_PROMPT,
  createPricePrompt,
  parsePriceResponse,
  createFallbackResponse,
} from './systemPrompt';

// Initialize bedrock runtime client
const client = new BedrockRuntimeClient();

export const handler: Schema['generatePriceSuggestion']['functionHandler'] = async (event, context) => {
  // Get product details from arguments
  const { productName, category } = event.arguments;

  try {
    // Crear el prompt del usuario usando la función helper
    const prompt = createPricePrompt(productName, category || undefined);

    // Create conversation with the user message
    const conversation = [
      {
        role: 'user' as const,
        content: [{ text: prompt }],
      },
    ];

    // Create a command with the model ID, the message, and configuration
    const command = new ConverseCommand({
      modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
      messages: conversation,
      system: [{ text: PRICE_SUGGESTION_SYSTEM_PROMPT }],
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.2,
      },
    });

    const response = await client.send(command);

    // Extract the response text
    const responseText = response.output?.message?.content?.[0]?.text?.trim() || '';

    // Try to parse the JSON using the helper function
    const result = parsePriceResponse(responseText);

    if (result) {
      // Return a standardized response
      return {
        suggestedPrice: typeof result.suggestedPrice === 'number' ? result.suggestedPrice : 100000,
        minPrice: typeof result.minPrice === 'number' ? result.minPrice : 90000,
        maxPrice: typeof result.maxPrice === 'number' ? result.maxPrice : 120000,
        confidence: ['high', 'medium', 'low'].includes(result.confidence) ? result.confidence : 'low',
        explanation: result.explanation || 'Precio basado en análisis de mercado colombiano.',
      };
    } else {
      console.error('Error parsing AI response. Response:', responseText);
      return createFallbackResponse(
        'No pudimos analizar este producto específicamente. Este es un precio estimado genérico.'
      );
    }
  } catch (error) {
    console.error('Error generating price suggestion:', error);
    return createFallbackResponse(
      'Ocurrió un error al generar la sugerencia de precio. Este es un precio estimado genérico.'
    );
  }
};
