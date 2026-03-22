import { ElectronAPI } from '@electron-toolkit/preload'

interface FileDialogFilter {
  name: string
  extensions: string[]
}

interface API {
  getNativeTheme: () => Promise<boolean>
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  windowIsMaximized: () => Promise<boolean>
  openFileDialog: (options?: { filters?: FileDialogFilter[] }) => Promise<string[] | null>
  saveFileDialog: (options?: {
    defaultPath?: string
    filters?: FileDialogFilter[]
  }) => Promise<string | null>
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string; path?: string }>
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>
  getAppPath: () => Promise<string>
  openExternal: (url: string) => void
  getAppVersion: () => Promise<string>
  readClipboard: () => Promise<string>
  writeClipboard: (text: string) => void
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  off: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
