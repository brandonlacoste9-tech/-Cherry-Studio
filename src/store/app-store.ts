import { create } from "zustand";
import type { AIProvider } from "@/types";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Active section
  activeSection: "chat" | "code" | "agents" | "knowledge" | "images" | "settings";
  setActiveSection: (section: AppState["activeSection"]) => void;

  // Selected model
  selectedModel: string;
  selectedProvider: AIProvider;
  setSelectedModel: (model: string, provider: AIProvider) => void;

  // Theme
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeSection: "chat",
  setActiveSection: (section) => set({ activeSection: section }),

  selectedModel: "gpt-4.1-mini",
  selectedProvider: "openai",
  setSelectedModel: (model, provider) =>
    set({ selectedModel: model, selectedProvider: provider }),

  theme: "dark",
  setTheme: (theme) => set({ theme }),
}));
