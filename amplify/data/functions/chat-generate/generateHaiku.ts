import type { Schema } from '../../resource';
import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime';
import { CHAT_GENERATION_SYSTEM_PROMPT, createChatPrompt, processChatResponse } from './systemPrompt';

// initialize bedrock runtime client
const client = new BedrockRuntimeClient();

export const handler: Schema['generateHaiku']['functionHandler'] = async (event, context) => {
  // User prompt
  const userPrompt = event.arguments.prompt;

  // Crear el prompt del usuario usando la función helper
  const prompt = createChatPrompt(userPrompt);

  // Invoke model
  const input = {
    modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      system: CHAT_GENERATION_SYSTEM_PROMPT,
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
      max_tokens: 2000,
      temperature: 0.5,
    }),
  } as InvokeModelCommandInput;

  const command = new InvokeModelCommand(input);

  const response = await client.send(command);

  // Parse the response and return the generated chat response
  const data = JSON.parse(Buffer.from(response.body).toString());
  const rawResponse = data.content[0].text;

  // Process the response using the helper function
  return processChatResponse(rawResponse);
};
