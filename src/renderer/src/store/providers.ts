import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LLMProvider, LLMModel } from '../types'
import { ProviderFactory } from '../services/llm/ProviderFactory'

interface ProvidersState {
  providers: LLMProvider[]
  activeProviderId: string | null
  activeModelId: string | null
  addProvider: (provider: LLMProvider) => void
  updateProvider: (id: string, updates: Partial<LLMProvider>) => void
  removeProvider: (id: string) => void
  setActiveProvider: (providerId: string, modelId: string) => void
  getActiveProvider: () => LLMProvider | null
  getModelsForProvider: (providerId: string) => LLMModel[]
  toggleProvider: (id: string) => void
}

const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, supportsVision: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, supportsVision: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385 }
    ],
    enabled: true,
    icon: '🤖'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    apiKey: '',
    models: [
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
      }
    ],
    enabled: true,
    icon: '💎'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    apiKey: '',
    models: [
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
      }
    ],
    enabled: true,
    icon: '🧠'
  },
  {
    id: 'ollama',
    name: 'Ollama',
    type: 'ollama',
    apiKey: '',
    baseUrl: 'http://localhost:11434',
    models: [],
    enabled: false,
    icon: '🦙'
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    type: 'lmstudio',
    apiKey: '',
    baseUrl: 'http://localhost:1234/v1',
    models: [],
    enabled: false,
    icon: '🎭'
  }
]

export const useProvidersStore = create<ProvidersState>()(
  persist(
    (set, get) => ({
      providers: DEFAULT_PROVIDERS,
      activeProviderId: 'openai',
      activeModelId: 'gpt-4o',

      addProvider: (provider) =>
        set((state) => ({ providers: [...state.providers, provider] })),

      updateProvider: (id, updates) => {
        ProviderFactory.invalidate(id)
        set((state) => ({
          providers: state.providers.map((p) => (p.id === id ? { ...p, ...updates } : p))
        }))
      },

      removeProvider: (id) => {
        ProviderFactory.invalidate(id)
        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id),
          activeProviderId: state.activeProviderId === id ? null : state.activeProviderId
        }))
      },

      setActiveProvider: (providerId, modelId) =>
        set({ activeProviderId: providerId, activeModelId: modelId }),

      getActiveProvider: () => {
        const { providers, activeProviderId } = get()
        return providers.find((p) => p.id === activeProviderId) ?? null
      },

      getModelsForProvider: (providerId) => {
        const { providers } = get()
        return providers.find((p) => p.id === providerId)?.models ?? []
      },

      toggleProvider: (id) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
          )
        }))
    }),
    { name: 'cherry-studio-providers' }
  )
)
