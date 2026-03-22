import type { TranslationRequest, TranslationResult } from '../types'
import { ProviderFactory } from './llm/ProviderFactory'
import { useProvidersStore } from '../store/providers'

export class TranslationService {
  static readonly SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' }
  ]

  static async translate(request: TranslationRequest): Promise<TranslationResult> {
    const store = useProvidersStore.getState()
    const providerId = request.providerId ?? store.activeProviderId
    const modelId = request.modelId ?? store.activeModelId

    if (!providerId || !modelId) {
      throw new Error('No active provider configured')
    }

    const provider = store.providers.find((p) => p.id === providerId)
    if (!provider) throw new Error('Provider not found')

    const llmProvider = ProviderFactory.create(provider)

    const sourceLang = this.getLanguageName(request.sourceLanguage)
    const targetLang = this.getLanguageName(request.targetLanguage)

    const prompt =
      request.sourceLanguage === 'auto'
        ? `Translate the following text to ${targetLang}. Only output the translation, nothing else:\n\n${request.text}`
        : `Translate the following text from ${sourceLang} to ${targetLang}. Only output the translation, nothing else:\n\n${request.text}`

    const translatedText = await llmProvider.complete({
      messages: [{ role: 'user', content: prompt }],
      model: modelId,
      temperature: 0.3
    })

    return {
      originalText: request.text,
      translatedText: translatedText.trim(),
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      timestamp: Date.now()
    }
  }

  static getLanguageName(code: string): string {
    if (code === 'auto') return 'auto-detected language'
    return this.SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name ?? code
  }
}
