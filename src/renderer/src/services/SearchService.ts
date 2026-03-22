import type { SearchResult } from '../types'
import { useConversationsStore } from '../store/conversations'
import { useAssistantsStore } from '../store/assistants'

export class SearchService {
  static search(query: string): SearchResult[] {
    if (!query.trim()) return []
    const results: SearchResult[] = []

    // Search conversations and messages
    const conversations = useConversationsStore.getState().searchConversations(query)
    const q = query.toLowerCase()

    for (const conv of conversations) {
      results.push({
        id: conv.id,
        type: 'conversation',
        title: conv.title,
        excerpt: conv.messages[conv.messages.length - 1]?.content?.slice(0, 100) ?? '',
        conversationId: conv.id,
        timestamp: conv.updatedAt
      })

      // Add matching messages
      for (const msg of conv.messages) {
        if (msg.content.toLowerCase().includes(q)) {
          results.push({
            id: `${conv.id}-${msg.id}`,
            type: 'message',
            title: `${conv.title} — ${msg.role}`,
            excerpt: this.getExcerpt(msg.content, query),
            conversationId: conv.id,
            timestamp: msg.timestamp
          })
        }
      }
    }

    // Search assistants
    const assistants = useAssistantsStore.getState().searchAssistants(query)
    for (const asst of assistants.slice(0, 5)) {
      results.push({
        id: asst.id,
        type: 'assistant',
        title: asst.name,
        excerpt: asst.description
      })
    }

    return results.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)).slice(0, 50)
  }

  private static getExcerpt(content: string, query: string): string {
    const idx = content.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return content.slice(0, 100)
    const start = Math.max(0, idx - 30)
    const end = Math.min(content.length, idx + query.length + 70)
    const excerpt = content.slice(start, end)
    return (start > 0 ? '...' : '') + excerpt + (end < content.length ? '...' : '')
  }
}
