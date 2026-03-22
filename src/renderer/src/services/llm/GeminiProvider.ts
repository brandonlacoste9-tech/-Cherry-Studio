import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import type { ChatCompletionOptions, LLMModel, LLMProvider, StreamChunk } from '../../types'
import { BaseProvider } from './BaseProvider'

export class GeminiProvider extends BaseProvider {
  private client: GoogleGenerativeAI

  constructor(provider: LLMProvider) {
    super(provider)
    this.client = new GoogleGenerativeAI(provider.apiKey)
  }

  async listModels(): Promise<LLMModel[]> {
    return this.getDefaultModels()
  }

  async complete(options: ChatCompletionOptions): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: options.model,
      safetySettings: this.getSafetySettings()
    })

    const { history, lastMessage } = this.buildGeminiMessages(options)
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature ?? 0.7
      }
    })

    const result = await chat.sendMessage(lastMessage)
    return result.response.text()
  }

  async streamComplete(
    options: ChatCompletionOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const model = this.client.getGenerativeModel({
      model: options.model,
      safetySettings: this.getSafetySettings()
    })

    const { history, lastMessage } = this.buildGeminiMessages(options)
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature ?? 0.7
      }
    })

    const result = await chat.sendMessageStream(lastMessage)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        onChunk({ delta: text, done: false })
      }
    }

    const response = await result.response
    onChunk({
      delta: '',
      done: true,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: response.usageMetadata?.totalTokenCount ?? 0
      }
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' })
      await model.generateContent('test')
      return true
    } catch {
      return false
    }
  }

  private buildGeminiMessages(options: ChatCompletionOptions) {
    const allMessages = this.buildMessages(options)
    const history = allMessages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content as string }]
    }))
    const lastMessage = (allMessages[allMessages.length - 1]?.content as string) ?? ''
    return { history, lastMessage }
  }

  private getSafetySettings() {
    return [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      }
    ]
  }

  private getDefaultModels(): LLMModel[] {
    return [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        contextWindow: 2000000,
        supportsVision: true
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        contextWindow: 1000000,
        supportsVision: true
      },
      {
        id: 'gemini-1.5-flash-8b',
        name: 'Gemini 1.5 Flash-8B',
        contextWindow: 1000000,
        supportsVision: true
      },
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash (Experimental)',
        contextWindow: 1000000,
        supportsVision: true
      }
    ]
  }
}
