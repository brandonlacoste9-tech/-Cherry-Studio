import { create } from "zustand";
import type { ChatMessage, AIProvider } from "@/types";

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  provider: AIProvider;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isStreaming: boolean;

  // Actions
  setConversations: (conversations: ChatConversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addConversation: (conversation: ChatConversation) => void;
  removeConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  appendToMessage: (conversationId: string, messageId: string, chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  getActiveConversation: () => ChatConversation | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),

  addConversation: (conversation) =>
    set((s) => ({
      conversations: [conversation, ...s.conversations],
      activeConversationId: conversation.id,
    })),

  removeConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      activeConversationId:
        s.activeConversationId === id ? null : s.activeConversationId,
    })),

  renameConversation: (id, title) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    })),

  addMessage: (conversationId, message) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
          : c
      ),
    })),

  updateMessage: (conversationId, messageId, content) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, content } : m
              ),
            }
          : c
      ),
    })),

  appendToMessage: (conversationId, messageId, chunk) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId
                  ? { ...m, content: m.content + chunk }
                  : m
              ),
            }
          : c
      ),
    })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  getActiveConversation: () => {
    const state = get();
    return state.conversations.find(
      (c) => c.id === state.activeConversationId
    );
  },
}));
