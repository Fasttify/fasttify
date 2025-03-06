"use client"

import type { Schema } from '@/amplify/data/resource'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)

const client = generateClient<Schema>()

export default function App() {
  const [prompt, setPrompt] = useState<string>('')
  const [answer, setAnswer] = useState<string | null>(null)

  const sendPrompt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { data, errors } = await client.queries.generateHaiku({
      prompt,
    })

    if (!errors) {
      setAnswer(data)
      setPrompt('')
    } else {
      console.log(errors)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 dark:text-white">
      <div>
        <h1 className="text-3xl font-bold text-center mb-4">Haiku Generator</h1>
        <form className="mb-4 self-center max-w-[500px]" onSubmit={sendPrompt}>
          <input
            className="text-black p-2 w-full"
            placeholder="Enter a prompt..."
            name="prompt"
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
          />
        </form>
        <div className="text-center">
          <pre>{answer}</pre>
        </div>
      </div>
    </main>
  )
}
