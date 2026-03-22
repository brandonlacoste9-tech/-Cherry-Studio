import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { ChatWindow } from './components/chat/ChatWindow'
import { AssistantSelector } from './components/assistants/AssistantSelector'
import { ProviderSettings } from './components/providers/ProviderSettings'
import { ThemeSettings } from './components/settings/ThemeSettings'
import { TranslationPanel } from './components/translation/TranslationPanel'
import { GlobalSearch } from './components/search/GlobalSearch'
import { useSettingsStore, useConversationsStore, useProvidersStore } from './store'
import type { Assistant } from './types'
import 'highlight.js/styles/github-dark.css'
import './styles/globals.css'

type ActiveView = 'chat' | 'assistants' | 'translation' | 'settings' | 'search'

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('chat')
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const { settings } = useSettingsStore()
  const { createConversation } = useConversationsStore()
  const { activeProviderId, activeModelId } = useProvidersStore()

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (settings.theme === 'dark' || (settings.theme === 'system' && prefersDark)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings.theme])

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${settings.fontSize}px`)
  }, [settings.fontSize])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewConversation()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeProviderId, activeModelId])

  const handleNewConversation = useCallback(() => {
    if (!activeProviderId || !activeModelId) {
      setActiveView('settings')
      return
    }
    const conv = createConversation({ providerId: activeProviderId, modelId: activeModelId })
    setActiveConversationId(conv.id)
    setActiveView('chat')
  }, [activeProviderId, activeModelId, createConversation])

  const handleAssistantSelect = useCallback(
    (assistant: Assistant) => {
      if (!activeProviderId || !activeModelId) {
        setActiveView('settings')
        return
      }
      const conv = createConversation({
        providerId: activeProviderId,
        modelId: activeModelId,
        assistantId: assistant.id,
        title: `Chat with ${assistant.name}`,
        systemPrompt: assistant.systemPrompt
      })
      setActiveConversationId(conv.id)
      setActiveView('chat')
    },
    [activeProviderId, activeModelId, createConversation]
  )

  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatWindow conversationId={activeConversationId} />
      case 'assistants':
        return (
          <div className="flex-1 overflow-hidden">
            <AssistantSelector
              onSelect={handleAssistantSelect}
            />
          </div>
        )
      case 'translation':
        return <TranslationPanel />
      case 'settings':
        return (
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Settings</h1>
                <p className="text-zinc-400 text-sm">Configure Cherry Studio to your preferences</p>
              </div>
              <ProviderSettings />
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  Appearance & Behavior
                </h2>
                <ThemeSettings />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Title bar drag region for macOS */}
      <div
        className="fixed top-0 left-0 right-0 h-8 z-10"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeConversationId={activeConversationId}
        setActiveConversationId={(id) => {
          setActiveConversationId(id)
          setActiveView('chat')
        }}
      />

      <main className="flex-1 flex flex-col min-w-0 min-h-0 pt-8">
        {renderMainContent()}
      </main>

      {showSearch && (
        <GlobalSearch
          onClose={() => setShowSearch(false)}
          onSelectConversation={(id) => {
            setActiveConversationId(id)
            setActiveView('chat')
          }}
        />
      )}
    </div>
  )
}
