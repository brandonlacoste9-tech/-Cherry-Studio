import React from 'react'
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  Trash2,
  Pin,
  Bot,
  Languages,
  X
} from 'lucide-react'
import { useConversationsStore, useProvidersStore } from '../store'

type ActiveView = 'chat' | 'assistants' | 'translation' | 'settings' | 'search'

interface SidebarProps {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  activeConversationId,
  setActiveConversationId
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const { conversations, deleteConversation, updateConversation, createConversation } =
    useConversationsStore()
  const { activeProviderId, activeModelId } = useProvidersStore()

  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return b.updatedAt - a.updatedAt
  })

  const handleNewConversation = () => {
    if (!activeProviderId || !activeModelId) {
      setActiveView('settings')
      return
    }
    const conv = createConversation({
      providerId: activeProviderId,
      modelId: activeModelId
    })
    setActiveConversationId(conv.id)
    setActiveView('chat')
  }

  const navItems = [
    { id: 'chat' as ActiveView, icon: MessageSquare, label: 'Chat' },
    { id: 'assistants' as ActiveView, icon: Bot, label: 'Assistants' },
    { id: 'translation' as ActiveView, icon: Languages, label: 'Translate' },
    { id: 'settings' as ActiveView, icon: Settings, label: 'Settings' }
  ]

  return (
    <div className="flex h-full">
      {/* Icon rail */}
      <div className="w-14 flex flex-col items-center py-3 gap-1 border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-sm mb-2">
          🍒
        </div>
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            title={label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              activeView === id
                ? 'bg-blue-500 text-white'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Conversation list */}
      {activeView === 'chat' && (
        <div className="w-56 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          <div className="p-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
            {sortedConversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-zinc-400">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id)
                    setActiveView('chat')
                  }}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                    activeConversationId === conv.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-zinc-400 truncate">
                      {conv.messages.length > 0
                        ? conv.messages[conv.messages.length - 1].content.slice(0, 30)
                        : 'Empty conversation'}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateConversation(conv.id, { isPinned: !conv.isPinned })
                      }}
                      className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${conv.isPinned ? 'text-blue-500' : 'text-zinc-400'}`}
                      title="Pin"
                    >
                      <Pin size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (activeConversationId === conv.id) setActiveConversationId(null)
                        deleteConversation(conv.id)
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-zinc-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
