import type { Schema } from '../../resource';
import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime';
import { PRODUCT_DESCRIPTION_SYSTEM_PROMPT, createUserPrompt } from './systemPrompt';

const client = new BedrockRuntimeClient();

export const handler: Schema['generateProductDescription']['functionHandler'] = async (event, context) => {
  const { productName, category } = event.arguments;

  // Crear el prompt del usuario usando la función helper
  const prompt = createUserPrompt(productName, category || undefined);

  // Invoke model
  const input = {
    modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      system: PRODUCT_DESCRIPTION_SYSTEM_PROMPT,
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
