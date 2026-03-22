import type { AIModel, AIProvider, ProviderConfig } from "@/types";

// ============================================
// AdgenAI — AI Provider Abstraction Layer
// Adapted from Cherry Studio's provider system for web API routes
// ============================================

export const AI_MODELS: AIModel[] = [
  // OpenAI
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    contextWindow: 1047576,
    supportsVision: true,
    supportsStreaming: true,
    maxOutputTokens: 32768,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    contextWindow: 1047576,
    supportsVision: true,
    supportsStreaming: true,
    maxOutputTokens: 32768,
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    contextWindow: 1047576,
    supportsVision: true,
    supportsStreaming: true,
    maxOutputTokens: 32768,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    supportsVision: true,
    supportsStreaming: true,
    maxOutputTokens: 16384,
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "openai",
    contextWindow: 200000,
    supportsVision: false,
    supportsStreaming: true,
    maxOutputTokens: 100000,
  },
  // Anthropic
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    contextWindow: 200000,
    supportsVision: true,
    supportsStreaming: true,
    maxOutputTokens: 64000,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    supportsVision: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    contextWindow: 200000,
    supportsVision: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  // DeepSeek
  {
    id: "deepseek-chat",
    name: "DeepSeek V3",
    provider: "deepseek",
    contextWindow: 64000,
    supportsVision: false,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek R1",
    provider: "deepseek",
    contextWindow: 64000,
    supportsVision: false,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  // Moonshot / Kimi
  {
    id: "moonshot-v1-128k",
    name: "Moonshot v1 128K",
    provider: "moonshot",
    contextWindow: 128000,
    supportsVision: false,
    supportsStreaming: true,
    maxOutputTokens: 4096,
  },
  {
    id: "moonshot-v1-32k",
    name: "Moonshot v1 32K",
    provider: "moonshot",
    contextWindow: 32000,
    supportsVision: false,
    supportsStreaming: true,
    maxOutputTokens: 4096,
  },
];

export const PROVIDER_CONFIGS: Record<AIProvider, Omit<ProviderConfig, "apiKey" | "enabled">> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: AI_MODELS.filter((m) => m.provider === "openai"),
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com",
    models: AI_MODELS.filter((m) => m.provider === "anthropic"),
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    models: AI_MODELS.filter((m) => m.provider === "deepseek"),
  },
  moonshot: {
    id: "moonshot",
    name: "Moonshot / Kimi",
    baseUrl: "https://api.moonshot.cn/v1",
    models: AI_MODELS.filter((m) => m.provider === "moonshot"),
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    baseUrl: "http://localhost:11434",
    models: [], // Dynamic — fetched from Ollama server
  },
};

export function getModelById(modelId: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === modelId);
}

export function getProviderForModel(modelId: string): AIProvider | undefined {
  const model = getModelById(modelId);
  return model?.provider;
}

export function getModelsForProvider(provider: AIProvider): AIModel[] {
  return AI_MODELS.filter((m) => m.provider === provider);
}
