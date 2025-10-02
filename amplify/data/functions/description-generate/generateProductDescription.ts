import type { Schema } from '../../resource';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { PRODUCT_DESCRIPTION_SYSTEM_PROMPT, createUserPrompt } from './systemPrompt';

const client = new BedrockRuntimeClient();

export const handler: Schema['generateProductDescription']['functionHandler'] = async (event, context) => {
  const { productName, category } = event.arguments;

  // Crear el prompt del usuario usando la función helper
  const prompt = createUserPrompt(productName, category || undefined);

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
    system: [{ text: PRODUCT_DESCRIPTION_SYSTEM_PROMPT }],
    inferenceConfig: {
      maxTokens: 500,
      temperature: 0.7,
    },
  });

  const response = await client.send(command);

  // Extract and return the response text
  return response.output?.message?.content?.[0]?.text || '';
};
