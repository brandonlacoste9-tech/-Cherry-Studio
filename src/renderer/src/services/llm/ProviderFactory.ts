import type { LLMProvider } from '../../types'
import { BaseProvider } from './BaseProvider'
import { OpenAIProvider } from './OpenAIProvider'
import { GeminiProvider } from './GeminiProvider'
import { AnthropicProvider } from './AnthropicProvider'
import { OllamaProvider } from './OllamaProvider'
import { LMStudioProvider } from './LMStudioProvider'

export class ProviderFactory {
  private static instances = new Map<string, BaseProvider>()

  static create(provider: LLMProvider): BaseProvider {
    const cached = this.instances.get(provider.id)
    if (cached) return cached

    let instance: BaseProvider

    switch (provider.type) {
      case 'openai':
      case 'perplexity':
      case 'groq':
      case 'mistral':
      case 'cohere':
      case 'custom':
        instance = new OpenAIProvider(provider)
        break
      case 'gemini':
        instance = new GeminiProvider(provider)
        break
      case 'anthropic':
        instance = new AnthropicProvider(provider)
        break
      case 'ollama':
        instance = new OllamaProvider(provider)
        break
      case 'lmstudio':
        instance = new LMStudioProvider(provider)
        break
      default:
        instance = new OpenAIProvider(provider)
    }

    this.instances.set(provider.id, instance)
    return instance
  }

  static invalidate(providerId: string): void {
    this.instances.delete(providerId)
  }

  static invalidateAll(): void {
    this.instances.clear()
  }
}
