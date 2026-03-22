// LLM Provider Types
export type ProviderType =
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'ollama'
  | 'lmstudio'
  | 'perplexity'
  | 'groq'
  | 'mistral'
  | 'cohere'
  | 'custom'

export interface LLMProvider {
  id: string
  name: string
  type: ProviderType
  apiKey: string
  baseUrl?: string
  models: LLMModel[]
  enabled: boolean
  icon?: string
}

export interface LLMModel {
  id: string
  name: string
  contextWindow?: number
  maxTokens?: number
  supportsVision?: boolean
  supportsTools?: boolean
  description?: string
}

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system'

export interface MessageAttachment {
  id: string
  name: string
  type: 'image' | 'pdf' | 'document' | 'code' | 'other'
  mimeType: string
  data?: string // base64
  url?: string
  size?: number
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  model?: string
  provider?: string
  attachments?: MessageAttachment[]
  isStreaming?: boolean
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Conversation Types
export interface Conversation {
  id: string
  title: string
  assistantId?: string
  providerId: string
  modelId: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  isPinned?: boolean
  tags?: string[]
  systemPrompt?: string
}

// Topic/Folder Types
export interface Topic {
  id: string
  name: string
  conversationIds: string[]
  createdAt: number
  color?: string
  icon?: string
}

// Assistant Types
export interface Assistant {
  id: string
  name: string
  description: string
  systemPrompt: string
  category: string
  tags: string[]
  icon?: string
  emoji?: string
  isCustom?: boolean
  createdAt?: number
  providerId?: string
  modelId?: string
}

// Settings Types
export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'fr' | 'de' | 'es'

export interface AppSettings {
  theme: ThemeMode
  language: Language
  fontSize: number
  sendWithEnter: boolean
  streamingEnabled: boolean
  showTokenCount: boolean
  showTimestamps: boolean
  autoSave: boolean
  saveInterval: number
  maxHistoryLength: number
  enableNotifications: boolean
  transparentWindow: boolean
  windowOpacity: number
}

// Search Types
export interface SearchResult {
  id: string
  type: 'conversation' | 'message' | 'assistant'
  title: string
  excerpt: string
  conversationId?: string
  timestamp?: number
}

// WebDAV Types
export interface WebDAVConfig {
  url: string
  username: string
  password: string
  remotePath: string
  enabled: boolean
  autoSync: boolean
  syncInterval: number
}

// MCP Types
export interface MCPServer {
  id: string
  name: string
  url: string
  enabled: boolean
  capabilities: string[]
  apiKey?: string
}

export interface MCPTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

// Translation Types
export interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  providerId?: string
  modelId?: string
}

export interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  timestamp: number
}

// Document Types
export interface ProcessedDocument {
  id: string
  name: string
  type: string
  content: string
  pages?: number
  metadata?: Record<string, unknown>
}

// Chat Completion Types
export interface ChatCompletionOptions {
  messages: { role: MessageRole; content: string }[]
  model: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  systemPrompt?: string
  tools?: MCPTool[]
}

export interface StreamChunk {
  delta: string
  done: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}
