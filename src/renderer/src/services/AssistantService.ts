import type { Assistant } from '../types'
import { useAssistantsStore } from '../store/assistants'
import { DEFAULT_ASSISTANTS, ASSISTANT_CATEGORIES } from '../data/assistants'
import { nanoid } from '../utils/nanoid'

export class AssistantService {
  static getAll(): Assistant[] {
    return useAssistantsStore.getState().getAllAssistants()
  }

  static getById(id: string): Assistant | undefined {
    return useAssistantsStore.getState().getAssistant(id)
  }

  static search(query: string): Assistant[] {
    if (!query.trim()) return this.getAll()
    return useAssistantsStore.getState().searchAssistants(query)
  }

  static getByCategory(category: string): Assistant[] {
    if (category === 'All') return this.getAll()
    return this.getAll().filter((a) => a.category === category)
  }

  static getCategories(): string[] {
    return ASSISTANT_CATEGORIES
  }

  static createCustom(data: Omit<Assistant, 'id' | 'isCustom' | 'createdAt'>): Assistant {
    const assistant: Assistant = {
      ...data,
      id: `custom-${nanoid()}`,
      isCustom: true,
      createdAt: Date.now()
    }
    useAssistantsStore.getState().addAssistant(assistant)
    return assistant
  }

  static update(id: string, updates: Partial<Assistant>): void {
    useAssistantsStore.getState().updateAssistant(id, updates)
  }

  static delete(id: string): void {
    useAssistantsStore.getState().removeAssistant(id)
  }

  static getDefaultAssistants(): Assistant[] {
    return DEFAULT_ASSISTANTS
  }

  static getFeatured(): Assistant[] {
    const featured = ['code-assistant', 'writing-general', 'data-analyst', 'tutor', 'translator']
    return featured
      .map((id) => DEFAULT_ASSISTANTS.find((a) => a.id === id))
      .filter(Boolean) as Assistant[]
  }
}
