import type { Schema } from '../../resource';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { CHAT_GENERATION_SYSTEM_PROMPT, createChatPrompt, processChatResponse } from './systemPrompt';

// initialize bedrock runtime client
const client = new BedrockRuntimeClient();

export const handler: Schema['generateHaiku']['functionHandler'] = async (event, context) => {
  // User prompt
  const userPrompt = event.arguments.prompt;

  // Crear el prompt del usuario usando la función helper
  const prompt = createChatPrompt(userPrompt);

  // Create conversation with the user message
  const conversation = [
    {
      role: 'user' as const,
      content: [{ text: prompt }],
    },
  ];

  // Create a command with the model ID, the message, and configuration
  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    messages: conversation,
    system: [{ text: CHAT_GENERATION_SYSTEM_PROMPT }],
    inferenceConfig: {
      maxTokens: 2000,
      temperature: 0.5,
    },
  });

  const response = await client.send(command);

  // Extract the response text
  const rawResponse = response.output?.message?.content?.[0]?.text || '';

  // Process the response using the helper function
  return processChatResponse(rawResponse);
};
