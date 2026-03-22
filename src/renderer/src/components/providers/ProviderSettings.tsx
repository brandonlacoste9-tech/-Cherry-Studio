import React, { useState } from 'react'
import { Eye, EyeOff, Plus, Trash2, RefreshCw, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useProvidersStore } from '../../store'
import { ProviderFactory } from '../../services/llm/ProviderFactory'
import type { LLMProvider, ProviderType } from '../../types'
import { nanoid } from '../../utils/nanoid'

const PROVIDER_PRESETS: Partial<LLMProvider>[] = [
  { name: 'OpenAI', type: 'openai', baseUrl: 'https://api.openai.com/v1', icon: '🤖' },
  { name: 'Google Gemini', type: 'gemini', icon: '💎' },
  { name: 'Anthropic', type: 'anthropic', icon: '🧠' },
  { name: 'Perplexity', type: 'perplexity', baseUrl: 'https://api.perplexity.ai', icon: '🔍' },
  { name: 'Groq', type: 'groq', baseUrl: 'https://api.groq.com/openai/v1', icon: '⚡' },
  { name: 'Mistral', type: 'mistral', baseUrl: 'https://api.mistral.ai/v1', icon: '🌪️' },
  { name: 'Ollama', type: 'ollama', baseUrl: 'http://localhost:11434', icon: '🦙' },
  { name: 'LM Studio', type: 'lmstudio', baseUrl: 'http://localhost:1234/v1', icon: '🎭' },
  { name: 'Custom (OpenAI-compatible)', type: 'custom', icon: '🔧' }
]

interface ProviderCardProps {
  provider: LLMProvider
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const { updateProvider, removeProvider } = useProvidersStore()
  const [showKey, setShowKey] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const [localApiKey, setLocalApiKey] = useState(provider.apiKey)

  const handleSave = () => {
    updateProvider(provider.id, { apiKey: localApiKey })
  }

  const handleTest = async () => {
    handleSave()
    setTesting(true)
    setTestResult(null)
    try {
      const llmProvider = ProviderFactory.create({ ...provider, apiKey: localApiKey })
      const result = await llmProvider.testConnection()
      setTestResult(result)
    } catch {
      setTestResult(false)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xl">{provider.icon ?? '🤖'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{provider.name}</p>
          <p className="text-xs text-zinc-400">{provider.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              updateProvider(provider.id, { enabled: !provider.enabled })
            }}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              provider.enabled ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                provider.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              API Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Enter API key..."
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 pr-10"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {(provider.type === 'ollama' || provider.type === 'lmstudio' || provider.type === 'custom' || provider.type === 'perplexity' || provider.type === 'groq') && (
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Base URL
              </label>
              <input
                type="text"
                value={provider.baseUrl ?? ''}
                onChange={(e) => updateProvider(provider.id, { baseUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !localApiKey}
              className="flex items-center gap-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {testing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : testResult === true ? (
                <Check size={14} className="text-green-500" />
              ) : testResult === false ? (
                <X size={14} className="text-red-500" />
              ) : (
                <RefreshCw size={14} />
              )}
              Test
            </button>
            <button
              onClick={() => removeProvider(provider.id)}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {testResult === false && (
            <p className="text-xs text-red-500">Connection failed. Check your API key and URL.</p>
          )}
          {testResult === true && (
            <p className="text-xs text-green-500">Connection successful!</p>
          )}
        </div>
      )}
    </div>
  )
}

export const ProviderSettings: React.FC = () => {
  const { providers, addProvider } = useProvidersStore()
  const [showAdd, setShowAdd] = useState(false)

  const handleAddPreset = (preset: Partial<LLMProvider>) => {
    addProvider({
      id: nanoid(),
      name: preset.name ?? 'Custom Provider',
      type: (preset.type ?? 'custom') as ProviderType,
      apiKey: '',
      baseUrl: preset.baseUrl,
      models: [],
      enabled: true,
      icon: preset.icon
    })
    setShowAdd(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">LLM Providers</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          <Plus size={14} />
          Add Provider
        </button>
      </div>

      {showAdd && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select a provider:</p>
          <div className="grid grid-cols-2 gap-2">
            {PROVIDER_PRESETS.map((preset) => (
              <button
                key={preset.type}
                onClick={() => handleAddPreset(preset)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <span>{preset.icon}</span>
                <span className="text-zinc-700 dark:text-zinc-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  )
}
