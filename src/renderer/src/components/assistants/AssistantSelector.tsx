import React, { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { Assistant } from '../../types'
import { ASSISTANT_CATEGORIES } from '../../data/assistants'
import { useAssistantsStore } from '../../store'

interface AssistantSelectorProps {
  onSelect: (assistant: Assistant) => void
  onClose?: () => void
}

export const AssistantSelector: React.FC<AssistantSelectorProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const { getAllAssistants, searchAssistants } = useAssistantsStore()

  const allAssistants = useMemo(() => getAllAssistants(), [getAllAssistants])

  const filtered = useMemo(() => {
    let list = query ? searchAssistants(query) : allAssistants
    if (category !== 'All') {
      list = list.filter((a) => a.category === category)
    }
    return list
  }, [query, category, allAssistants, searchAssistants])

  const categories = ASSISTANT_CATEGORIES.filter((cat) => {
    if (cat === 'All') return true
    return allAssistants.some((a) => a.category === cat)
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            AI Assistants
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search assistants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex gap-1 p-3 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
              category === cat
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400 text-sm">No assistants found</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map((assistant) => (
              <button
                key={assistant.id}
                onClick={() => onSelect(assistant)}
                className="flex items-start gap-3 p-3 rounded-xl text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-lg shrink-0">
                  {assistant.emoji ?? '🤖'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {assistant.name}
                    </p>
                    {assistant.isCustom && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                    {assistant.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {assistant.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 text-center">
        <p className="text-xs text-zinc-400">{filtered.length} assistants available</p>
      </div>
    </div>
  )
}
