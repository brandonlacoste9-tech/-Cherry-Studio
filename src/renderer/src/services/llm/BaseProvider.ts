import type {
  ChatCompletionOptions,
  LLMModel,
  LLMProvider,
  MessageRole,
  StreamChunk
} from '../../types'

export abstract class BaseProvider {
  protected provider: LLMProvider

  constructor(provider: LLMProvider) {
    this.provider = provider
  }

  abstract listModels(): Promise<LLMModel[]>

  abstract complete(options: ChatCompletionOptions): Promise<string>

  abstract streamComplete(
    options: ChatCompletionOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void>

  abstract testConnection(): Promise<boolean>

  protected buildMessages(
    options: ChatCompletionOptions
  ): { role: MessageRole | 'system'; content: string }[] {
    const msgs: { role: MessageRole | 'system'; content: string }[] = []
    if (options.systemPrompt) {
      msgs.push({ role: 'system' as const, content: options.systemPrompt })
    }
    msgs.push(...options.messages)
    return msgs
  }
}
