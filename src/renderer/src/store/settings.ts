import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, WebDAVConfig, MCPServer, ThemeMode } from '../types'

interface SettingsState {
  settings: AppSettings
  webdav: WebDAVConfig
  mcpServers: MCPServer[]
  updateSettings: (updates: Partial<AppSettings>) => void
  setTheme: (theme: ThemeMode) => void
  updateWebDAV: (config: Partial<WebDAVConfig>) => void
  addMCPServer: (server: MCPServer) => void
  updateMCPServer: (id: string, updates: Partial<MCPServer>) => void
  removeMCPServer: (id: string) => void
  toggleMCPServer: (id: string) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  fontSize: 14,
  sendWithEnter: true,
  streamingEnabled: true,
  showTokenCount: false,
  showTimestamps: true,
  autoSave: true,
  saveInterval: 5,
  maxHistoryLength: 100,
  enableNotifications: true,
  transparentWindow: false,
  windowOpacity: 95
}

const DEFAULT_WEBDAV: WebDAVConfig = {
  url: '',
  username: '',
  password: '',
  remotePath: '/cherry-studio/',
  enabled: false,
  autoSync: false,
  syncInterval: 30
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      webdav: DEFAULT_WEBDAV,
      mcpServers: [],

      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      setTheme: (theme) =>
        set((state) => ({ settings: { ...state.settings, theme } })),

      updateWebDAV: (config) =>
        set((state) => ({ webdav: { ...state.webdav, ...config } })),

      addMCPServer: (server) =>
        set((state) => ({ mcpServers: [...state.mcpServers, server] })),

      updateMCPServer: (id, updates) =>
        set((state) => ({
          mcpServers: state.mcpServers.map((s) => (s.id === id ? { ...s, ...updates } : s))
        })),

      removeMCPServer: (id) =>
        set((state) => ({ mcpServers: state.mcpServers.filter((s) => s.id !== id) })),

      toggleMCPServer: (id) =>
        set((state) => ({
          mcpServers: state.mcpServers.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          )
        }))
    }),
    { name: 'cherry-studio-settings' }
  )
)
