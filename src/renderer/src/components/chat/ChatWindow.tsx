import React, { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useConversationsStore, useProvidersStore, useSettingsStore } from '../../store'
import { ProviderFactory } from '../../services/llm/ProviderFactory'
import type { Message, MessageAttachment } from '../../types'
import { nanoid } from '../../utils/nanoid'

interface ChatWindowProps {
  conversationId: string | null
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const { getConversation, addMessage, updateMessage, updateConversation } =
    useConversationsStore()
  const { providers, activeProviderId, activeModelId, setActiveProvider } = useProvidersStore()
  const { settings } = useSettingsStore()

  const conversation = conversationId ? getConversation(conversationId) : null
  const enabledProviders = providers.filter((p) => p.enabled && p.apiKey)

  const activeProvider = providers.find((p) => p.id === activeProviderId)
  const activeModel = activeProvider?.models.find((m) => m.id === activeModelId)

  const handleSend = useCallback(
    async (content: string, attachments?: MessageAttachment[]) => {
      if (!conversationId || isStreaming) return
      if (!activeProviderId || !activeModelId) {
        alert('Please configure and select a provider first')
        return
      }

      const provider = providers.find((p) => p.id === activeProviderId)
      if (!provider) return

      const userMessage: Message = {
        id: nanoid(),
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments
      }

      addMessage(conversationId, userMessage)

      const conv = getConversation(conversationId)
      if (!conv) return

      // Auto-title conversation from first message
      if (conv.messages.length === 0 && content.trim()) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        updateConversation(conversationId, { title })
      }

      const assistantMessageId = nanoid()
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        model: activeModelId,
        provider: activeProviderId,
        isStreaming: true
      }
      addMessage(conversationId, assistantMessage)
      setIsStreaming(true)

      try {
        const llmProvider = ProviderFactory.create(provider)
        const messages = [...conv.messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content
        }))

        let fullContent = ''

        if (settings.streamingEnabled) {
          await llmProvider.streamComplete(
            {
              messages,
              model: activeModelId,
              systemPrompt: conv.systemPrompt,
              stream: true
            },
            (chunk) => {
              fullContent += chunk.delta
              updateMessage(conversationId, assistantMessageId, {
                content: fullContent,
                isStreaming: !chunk.done,
                usage: chunk.done ? chunk.usage : undefined
              })
            }
          )
        } else {
          fullContent = await llmProvider.complete({
            messages,
            model: activeModelId,
            systemPrompt: conv.systemPrompt
          })
          updateMessage(conversationId, assistantMessageId, {
            content: fullContent,
            isStreaming: false
          })
        }
      } catch (error) {
        updateMessage(conversationId, assistantMessageId, {
          isStreaming: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      } finally {
        setIsStreaming(false)
      }
    },
    [
      conversationId,
      isStreaming,
      activeProviderId,
      activeModelId,
      providers,
      addMessage,
      updateMessage,
      updateConversation,
      getConversation,
      settings.streamingEnabled
    ]
  )

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🍒</div>
          <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">Cherry Studio</h2>
          <p className="text-zinc-400 mt-2">Select or create a conversation to get started</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-400">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm">
              {conversation.title}
            </h1>
            {conversation.assistantId && (
              <p className="text-xs text-zinc-400 truncate">{conversation.assistantId}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg px-3 py-1.5 transition-colors"
            >
              <span className="text-zinc-600 dark:text-zinc-400">
                {activeProvider?.name ?? 'No provider'} / {activeModel?.name ?? 'No model'}
              </span>
              <ChevronDown size={12} />
            </button>

            {showModelPicker && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto p-1">
                  {enabledProviders.length === 0 ? (
                    <p className="text-xs text-zinc-400 p-3">No providers configured</p>
                  ) : (
                    enabledProviders.map((p) => (
                      <div key={p.id}>
                        <div className="px-3 py-1.5 text-xs font-medium text-zinc-400">{p.name}</div>
                        {p.models.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setActiveProvider(p.id, m.id)
                              setShowModelPicker(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              p.id === activeProviderId && m.id === activeModelId
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={conversation.messages}
        isLoading={isStreaming && conversation.messages[conversation.messages.length - 1]?.role === 'user'}
      />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={isStreaming}
        sendWithEnter={settings.sendWithEnter}
      />
    </div>
  )
}
