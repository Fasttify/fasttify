import type { Schema } from '../../resource';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { PRODUCT_DESCRIPTION_SYSTEM_PROMPT, createUserPrompt } from './systemPrompt';

const client = new BedrockRuntimeClient();

export const handler: Schema['generateProductDescription']['functionHandler'] = async (event, context) => {
  const { productName, category } = event.arguments;

  const prompt = createUserPrompt(productName, category || undefined);

  const conversation = [
    {
      role: 'user' as const,
      content: [{ text: prompt }],
    },
  ];

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

  return response.output?.message?.content?.[0]?.text || '';
};
