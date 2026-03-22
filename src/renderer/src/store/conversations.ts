import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, Message, Topic } from '../types'
import { nanoid } from '../utils/nanoid'

interface ConversationsState {
  conversations: Conversation[]
  topics: Topic[]
  activeConversationId: string | null
  createConversation: (
    opts: Pick<Conversation, 'providerId' | 'modelId'> & {
      assistantId?: string
      title?: string
      systemPrompt?: string
    }
  ) => Conversation
  deleteConversation: (id: string) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  clearMessages: (conversationId: string) => void
  getConversation: (id: string) => Conversation | undefined
  createTopic: (name: string, color?: string) => Topic
  updateTopic: (id: string, updates: Partial<Topic>) => void
  deleteTopic: (id: string) => void
  addToTopic: (topicId: string, conversationId: string) => void
  removeFromTopic: (topicId: string, conversationId: string) => void
  searchConversations: (query: string) => Conversation[]
}

export const useConversationsStore = create<ConversationsState>()(
  persist(
    (set, get) => ({
      conversations: [],
      topics: [],
      activeConversationId: null,

      createConversation: (opts) => {
        const conversation: Conversation = {
          id: nanoid(),
          title: opts.title ?? 'New Conversation',
          assistantId: opts.assistantId,
          providerId: opts.providerId,
          modelId: opts.modelId,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          systemPrompt: opts.systemPrompt
        }
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: conversation.id
        }))
        return conversation
      },

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
          topics: state.topics.map((t) => ({
            ...t,
            conversationIds: t.conversationIds.filter((cid) => cid !== id)
          }))
        })),

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          )
        })),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
              : c
          )
        })),

      updateMessage: (conversationId, messageId, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: Date.now()
                }
              : c
          )
        })),

      deleteMessage: (conversationId, messageId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
              : c
          )
        })),

      clearMessages: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, messages: [], updatedAt: Date.now() } : c
          )
        })),

      getConversation: (id) => get().conversations.find((c) => c.id === id),

      createTopic: (name, color) => {
        const topic: Topic = {
          id: nanoid(),
          name,
          conversationIds: [],
          createdAt: Date.now(),
          color
        }
        set((state) => ({ topics: [...state.topics, topic] }))
        return topic
      },

      updateTopic: (id, updates) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === id ? { ...t, ...updates } : t))
        })),

      deleteTopic: (id) =>
        set((state) => ({ topics: state.topics.filter((t) => t.id !== id) })),

      addToTopic: (topicId, conversationId) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId && !t.conversationIds.includes(conversationId)
              ? { ...t, conversationIds: [...t.conversationIds, conversationId] }
              : t
          )
        })),

      removeFromTopic: (topicId, conversationId) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId
              ? { ...t, conversationIds: t.conversationIds.filter((id) => id !== conversationId) }
              : t
          )
        })),

      searchConversations: (query) => {
        const q = query.toLowerCase()
        return get().conversations.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.messages.some((m) => m.content.toLowerCase().includes(q))
        )
      }
    }),
    { name: 'cherry-studio-conversations' }
  )
)
