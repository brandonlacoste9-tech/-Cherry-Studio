"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ModelSelector } from "@/components/chat/model-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import type { AIProvider } from "@/types";
import { v4 as uuid } from "uuid";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  thinkingContent?: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: AIProvider;
  updatedAt: Date;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4.1-mini");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("openai");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createConversation = useCallback(() => {
    const conv: Conversation = {
      id: uuid(),
      title: "New Chat",
      messages: [],
      model: selectedModel,
      provider: selectedProvider,
      updatedAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv;
  }, [selectedModel, selectedProvider]);

  const handleSend = useCallback(
    async (content: string) => {
      let conv = activeConversation;
      if (!conv) {
        conv = createConversation();
        // Need to update state synchronously
        setConversations((prev) => {
          const existing = prev.find((c) => c.id === conv!.id);
          if (existing) return prev;
          return [conv!, ...prev];
        });
      }

      const userMsg: Message = {
        id: uuid(),
        role: "user",
        content,
      };

      const assistantMsg: Message = {
        id: uuid(),
        role: "assistant",
        content: "",
        model: selectedModel,
        isStreaming: true,
      };

      // Update conversation with user message
      const convId = conv.id;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, userMsg, assistantMsg],
                title:
                  c.messages.length === 0
                    ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
                    : c.title,
                updatedAt: new Date(),
              }
            : c
        )
      );

      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const allMessages = [...(conv.messages || []), userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            model: selectedModel,
            provider: selectedProvider,
            stream: true,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Chat request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";
        let thinkingContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content") {
                fullContent += parsed.content;
              } else if (parsed.type === "thinking") {
                thinkingContent += parsed.content;
              } else if (parsed.type === "error") {
                throw new Error(parsed.content);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }

          // Update assistant message
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMsg.id
                        ? {
                            ...m,
                            content: fullContent,
                            thinkingContent: thinkingContent || undefined,
                            isStreaming: true,
                          }
                        : m
                    ),
                  }
                : c
            )
          );
        }

        // Finalize
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: fullContent, thinkingContent: thinkingContent || undefined, isStreaming: false }
                      : m
                  ),
                }
              : c
          )
        );
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? {
                          ...m,
                          content:
                            m.content ||
                            `Error: ${(error as Error).message || "Failed to get response"}`,
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeConversation, selectedModel, selectedProvider, createConversation]
  );

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  return (
    <div className="flex h-full">
      {/* Chat history sidebar */}
      {showSidebar && (
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={createConversation}
          onRename={(id, title) =>
            setConversations((prev) =>
              prev.map((c) => (c.id === id ? { ...c, title } : c))
            )
          }
          onDelete={(id) => {
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeId === id) setActiveId(null);
          }}
        />
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <ModelSelector
              selectedModel={selectedModel}
              selectedProvider={selectedProvider}
              onSelect={(model, provider) => {
                setSelectedModel(model);
                setSelectedProvider(provider);
              }}
            />
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Sparkles className="h-12 w-12 text-primary/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Chat Studio</h2>
              <p className="text-muted-foreground text-sm text-center max-w-md">
                Start a conversation with any AI model. Supports streaming,
                markdown, code blocks, and thinking sections.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  model={msg.model}
                  isStreaming={msg.isStreaming}
                  thinkingContent={msg.thinkingContent}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
            placeholder={`Message ${selectedModel}...`}
          />
        </div>
      </div>
    </div>
  );
}
