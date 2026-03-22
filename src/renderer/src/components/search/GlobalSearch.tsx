import React, { useState, useEffect } from 'react'
import { Search, X, MessageSquare, Bot, Clock } from 'lucide-react'
import { SearchService } from '../../services/SearchService'
import type { SearchResult } from '../../types'

interface GlobalSearchProps {
  onClose: () => void
  onSelectConversation: (id: string) => void
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose, onSelectConversation }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      const found = SearchService.search(query)
      setResults(found)
      setIsSearching(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'conversation': return <MessageSquare size={14} />
      case 'message': return <Clock size={14} />
      case 'assistant': return <Bot size={14} />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Search conversations, messages, assistants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center text-zinc-400 text-sm">Searching...</div>
          ) : results.length === 0 && query ? (
            <div className="p-8 text-center text-zinc-400 text-sm">
              No results for &quot;{query}&quot;
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search size={32} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Type to search</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    if (result.conversationId) {
                      onSelectConversation(result.conversationId)
                    }
                    onClose()
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 shrink-0 mt-0.5">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {result.title}
                    </p>
                    {result.excerpt && (
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                        {result.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded capitalize">
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 text-xs text-zinc-400">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
