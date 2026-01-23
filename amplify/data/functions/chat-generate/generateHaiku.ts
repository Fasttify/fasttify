import type { Schema } from '../../resource';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { CHAT_GENERATION_SYSTEM_PROMPT, createChatPrompt, processChatResponse } from './systemPrompt';

const client = new BedrockRuntimeClient();

export const handler: Schema['generateHaiku']['functionHandler'] = async (event, context) => {
  const userPrompt = event.arguments.prompt;

  const prompt = createChatPrompt(userPrompt);

  const conversation = [
    {
      role: 'user' as const,
      content: [{ text: prompt }],
    },
  ];

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

  const rawResponse = response.output?.message?.content?.[0]?.text || '';

  return processChatResponse(rawResponse);
};
