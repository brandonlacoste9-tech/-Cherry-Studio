import axios from 'axios'
import type { ChatCompletionOptions, LLMModel, LLMProvider, StreamChunk } from '../../types'
import { BaseProvider } from './BaseProvider'

// LM Studio exposes an OpenAI-compatible API
export class LMStudioProvider extends BaseProvider {
  private baseUrl: string

  constructor(provider: LLMProvider) {
    super(provider)
    this.baseUrl = provider.baseUrl || 'http://localhost:1234/v1'
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`)
      return (response.data.data || []).map((m: { id: string }) => ({
        id: m.id,
        name: m.id,
        contextWindow: 4096
      }))
    } catch {
      return []
    }
  }

  async complete(options: ChatCompletionOptions): Promise<string> {
    const messages = this.buildMessages(options)
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: false
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data.choices?.[0]?.message?.content ?? ''
  }

  async streamComplete(
    options: ChatCompletionOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const messages = this.buildMessages(options)
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: true
      })
    })

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter((l) => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') {
          onChunk({ delta: '', done: true })
          continue
        }
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content ?? ''
          const isDone = parsed.choices?.[0]?.finish_reason != null
          if (delta || isDone) {
            onChunk({ delta, done: isDone })
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/models`)
      return true
    } catch {
      return false
    }
  }
}
