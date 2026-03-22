import Anthropic from '@anthropic-ai/sdk'
import type { ChatCompletionOptions, LLMModel, LLMProvider, StreamChunk } from '../../types'
import { BaseProvider } from './BaseProvider'

export class AnthropicProvider extends BaseProvider {
  private client: Anthropic

  constructor(provider: LLMProvider) {
    super(provider)
    this.client = new Anthropic({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
      dangerouslyAllowBrowser: true
    })
  }

  async listModels(): Promise<LLMModel[]> {
    return this.getDefaultModels()
  }

  async complete(options: ChatCompletionOptions): Promise<string> {
    const messages = options.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    const response = await this.client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      system: options.systemPrompt,
      messages
    })

    return response.content[0]?.type === 'text' ? response.content[0].text : ''
  }

  async streamComplete(
    options: ChatCompletionOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const messages = options.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    const stream = this.client.messages.stream({
      model: options.model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      system: options.systemPrompt,
      messages
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        onChunk({ delta: event.delta.text, done: false })
      }
    }

    const finalMessage = await stream.finalMessage()
    onChunk({
      delta: '',
      done: true,
      usage: {
        promptTokens: finalMessage.usage.input_tokens,
        completionTokens: finalMessage.usage.output_tokens,
        totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens
      }
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }]
      })
      return true
    } catch {
      return false
    }
  }

  private getDefaultModels(): LLMModel[] {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        contextWindow: 200000,
        supportsVision: true
      }
    ]
  }
}
