// ============================================
// AdgenAI — Core Type Definitions
// ============================================

export type AIProvider = "openai" | "anthropic" | "deepseek" | "moonshot" | "ollama";

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
  maxOutputTokens?: number;
}

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  apiKey?: string;
  baseUrl: string;
  models: AIModel[];
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  model?: string;
  provider?: AIProvider;
  attachments?: MessageAttachment[];
  isThinking?: boolean;
  thinkingContent?: string;
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file";
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  provider: AIProvider;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  forkFromId?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  provider: AIProvider;
  avatar?: string;
  tools: AgentTool[];
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentTool {
  id: string;
  name: string;
  type: "web_search" | "code_execution" | "knowledge_base";
  config?: Record<string, unknown>;
}

export interface CodeProject {
  id: string;
  name: string;
  description?: string;
  code: string;
  prompt: string;
  model: string;
  provider: AIProvider;
  userId: string;
  forkFromId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  userId: string;
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeDocument {
  id: string;
  knowledgeBaseId: string;
  name: string;
  type: string;
  size: number;
  chunks: number;
  status: "processing" | "ready" | "error";
  createdAt: Date;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  url: string;
  model: string;
  size: string;
  userId: string;
  createdAt: Date;
}

export type SubscriptionTier = "free" | "pro" | "studio";

export interface UserSubscription {
  tier: SubscriptionTier;
  creditsUsed: number;
  creditsLimit: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
}

export interface CreditCost {
  chat: number;
  codeGen: number;
  imageGen: number;
}

export const CREDIT_COSTS: CreditCost = {
  chat: 1,
  codeGen: 5,
  imageGen: 10,
};

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  free: 50,
  pro: 500,
  studio: 2000,
};

export const TIER_PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 20,
  studio: 50,
};
