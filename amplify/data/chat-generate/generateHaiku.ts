import type { Schema } from '../resource'
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime'

// initialize bedrock runtime client
const client = new BedrockRuntimeClient()

export const handler: Schema['generateHaiku']['functionHandler'] = async (event, context) => {
  // User prompt
  const prompt = event.arguments.prompt

  // Invoke model
  const input = {
    modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      system:
        'Eres un experto en e-commerce y dropshipping. Tu tarea es responder de forma clara, detallada y profesional a consultas relacionadas con estrategias de marketing digital, descripción de productos, gestión de inventario y tendencias en comercio electrónico. Tus respuestas deben ser precisas, informativas y adaptadas al contexto de un negocio innovador como Fasttify. Evita respuestas poéticas o en formato haiku; usa un lenguaje natural y directo.',
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
  } as InvokeModelCommandInput

  const command = new InvokeModelCommand(input)

  const response = await client.send(command)

  // Parse the response and return the generated haiku
  const data = JSON.parse(Buffer.from(response.body).toString())

  return data.content[0].text
}
