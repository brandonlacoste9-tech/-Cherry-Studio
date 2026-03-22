import OpenAI from "openai";
import type { AIProvider } from "@/types";
import { PROVIDER_CONFIGS } from "./providers";

// ============================================
// AdgenAI — Unified AI Client Factory
// Creates OpenAI-compatible clients for all providers
// ============================================

interface ClientConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
}

/**
 * Creates an OpenAI-compatible client for any supported provider.
 * All providers (except Anthropic native) use the OpenAI SDK format.
 */
export function createAIClient(config: ClientConfig): OpenAI {
  const providerConfig = PROVIDER_CONFIGS[config.provider];
  const baseURL = config.baseUrl || providerConfig.baseUrl;

  // Anthropic uses OpenAI-compatible endpoint via their proxy
  if (config.provider === "anthropic") {
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: "https://api.anthropic.com/v1",
      defaultHeaders: {
        "anthropic-version": "2023-06-01",
        "x-api-key": config.apiKey,
      },
    });
  }

  // Ollama runs locally with no API key
  if (config.provider === "ollama") {
    return new OpenAI({
      apiKey: "ollama",
      baseURL: `${baseURL}/v1`,
    });
  }

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL,
  });
}

/**
 * Get the API key for a provider from environment variables or user config.
 */
export function getProviderApiKey(
  provider: AIProvider,
  userKeys?: Record<string, string>
): string | undefined {
  // Check user-provided keys first
  if (userKeys?.[provider]) {
    return userKeys[provider];
  }

  // Fall back to environment variables
  const envMap: Record<AIProvider, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    moonshot: "MOONSHOT_API_KEY",
    ollama: "",
  };

  const envKey = envMap[provider];
  if (!envKey) return provider === "ollama" ? "ollama" : undefined;
  return process.env[envKey];
}

/**
 * Fetch available models from an Ollama server.
 */
export async function fetchOllamaModels(
  baseUrl: string = "http://localhost:11434"
): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.models || []).map(
      (m: { name: string; model: string }) => ({
        id: m.model || m.name,
        name: m.name,
      })
    );
  } catch {
    return [];
  }
}
