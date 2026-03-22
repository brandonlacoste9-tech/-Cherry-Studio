import OpenAI from 'openai'
import type { ChatCompletionOptions, LLMModel, LLMProvider, StreamChunk } from '../../types'
import { BaseProvider } from './BaseProvider'

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI

  constructor(provider: LLMProvider) {
    super(provider)
    this.client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl || 'https://api.openai.com/v1',
      dangerouslyAllowBrowser: true
    })
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      const response = await this.client.models.list()
      return response.data
        .filter((m) => m.id.startsWith('gpt') || m.id.startsWith('o1') || m.id.startsWith('o3'))
        .map((m) => ({
          id: m.id,
          name: m.id,
          supportsVision: m.id.includes('vision') || m.id.includes('gpt-4o'),
          contextWindow: m.id.includes('gpt-4') ? 128000 : 16385
        }))
    } catch {
      return this.getDefaultModels()
    }
  }

  async complete(options: ChatCompletionOptions): Promise<string> {
    const messages = this.buildMessages(options)
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens
    })
    return response.choices[0]?.message?.content ?? ''
  }

  async streamComplete(
    options: ChatCompletionOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const messages = this.buildMessages(options)
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      const done = chunk.choices[0]?.finish_reason != null

      if (delta || done) {
        onChunk({
          delta,
          done,
          usage: done && chunk.usage
            ? {
                promptTokens: chunk.usage.prompt_tokens,
                completionTokens: chunk.usage.completion_tokens,
                totalTokens: chunk.usage.total_tokens
              }
            : undefined
        })
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }

  private getDefaultModels(): LLMModel[] {
    return [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, supportsVision: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, supportsVision: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, supportsVision: true },
      { id: 'gpt-4', name: 'GPT-4', contextWindow: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385 },
      { id: 'o1-preview', name: 'o1 Preview', contextWindow: 128000 },
      { id: 'o1-mini', name: 'o1 Mini', contextWindow: 128000 }
    ]
  }
}
