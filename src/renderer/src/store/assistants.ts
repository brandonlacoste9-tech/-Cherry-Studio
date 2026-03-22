import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Assistant } from '../types'
import { DEFAULT_ASSISTANTS } from '../data/assistants'

interface AssistantsState {
  assistants: Assistant[]
  customAssistants: Assistant[]
  activeAssistantId: string | null
  addAssistant: (assistant: Assistant) => void
  updateAssistant: (id: string, updates: Partial<Assistant>) => void
  removeAssistant: (id: string) => void
  setActiveAssistant: (id: string | null) => void
  getAssistant: (id: string) => Assistant | undefined
  getAllAssistants: () => Assistant[]
  searchAssistants: (query: string) => Assistant[]
}

export const useAssistantsStore = create<AssistantsState>()(
  persist(
    (set, get) => ({
      assistants: DEFAULT_ASSISTANTS,
      customAssistants: [],
      activeAssistantId: null,

      addAssistant: (assistant) =>
        set((state) => ({
          customAssistants: [...state.customAssistants, { ...assistant, isCustom: true }]
        })),

      updateAssistant: (id, updates) =>
        set((state) => ({
          customAssistants: state.customAssistants.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
          assistants: state.assistants.map((a) => (a.id === id ? { ...a, ...updates } : a))
        })),

      removeAssistant: (id) =>
        set((state) => ({
          customAssistants: state.customAssistants.filter((a) => a.id !== id)
        })),

      setActiveAssistant: (id) => set({ activeAssistantId: id }),

      getAssistant: (id) => {
        const { assistants, customAssistants } = get()
        return [...customAssistants, ...assistants].find((a) => a.id === id)
      },

      getAllAssistants: () => {
        const { assistants, customAssistants } = get()
        return [...customAssistants, ...assistants]
      },

      searchAssistants: (query) => {
        const all = get().getAllAssistants()
        const q = query.toLowerCase()
        return all.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q)) ||
            a.category.toLowerCase().includes(q)
        )
      }
    }),
    {
      name: 'cherry-studio-assistants',
      partialize: (state) => ({
        customAssistants: state.customAssistants,
        activeAssistantId: state.activeAssistantId
      })
    }
  )
)
