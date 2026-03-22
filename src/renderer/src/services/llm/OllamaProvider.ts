import axios from 'axios'
import type { ChatCompletionOptions, LLMModel, LLMProvider, StreamChunk } from '../../types'
import { BaseProvider } from './BaseProvider'

export class OllamaProvider extends BaseProvider {
  private baseUrl: string

  constructor(provider: LLMProvider) {
    super(provider)
    this.baseUrl = provider.baseUrl || 'http://localhost:11434'
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`)
      return (response.data.models || []).map((m: { name: string; size: number }) => ({
        id: m.name,
        name: m.name,
        contextWindow: 4096
      }))
    } catch {
      return []
    }
  }

  async complete(options: ChatCompletionOptions): Promise<string> {
    const messages = this.buildMessages(options)
    const response = await axios.post(`${this.baseUrl}/api/chat`, {
      model: options.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens
      }
    })
    return response.data.message?.content ?? ''
  }

  async streamComplete(
    options: ChatCompletionOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const messages = this.buildMessages(options)
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        messages,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens
        }
      })
    })

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.message?.content) {
            onChunk({ delta: data.message.content, done: data.done === true })
          }
          if (data.done) {
            onChunk({ delta: '', done: true })
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/version`)
      return true
    } catch {
      return false
    }
  }
}
