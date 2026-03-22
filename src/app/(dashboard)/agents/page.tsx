"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentBuilder } from "@/components/agents/agent-builder";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import {
  Bot,
  Plus,
  MessageSquare,
  Globe,
  Lock,
  Search,
  Code2,
  Sparkles,
} from "lucide-react";
import type { AIProvider } from "@/types";
import { v4 as uuid } from "uuid";

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  provider: AIProvider;
  tools: Array<{ id: string; name: string; type: string }>;
  isPublic: boolean;
}

interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  isStreaming?: boolean;
}

// Pre-built agent templates
const PRESET_AGENTS: Omit<Agent, "id">[] = [
  {
    name: "Code Reviewer",
    description: "Reviews code for best practices, bugs, and performance issues",
    systemPrompt:
      "You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices. Provide specific, actionable feedback with code examples.",
    model: "gpt-4.1-mini",
    provider: "openai",
    tools: [{ id: "code_execution", name: "Code Execution", type: "code_execution" }],
    isPublic: true,
  },
  {
    name: "Research Assistant",
    description: "Helps with research, summarization, and analysis",
    systemPrompt:
      "You are a research assistant. Help users find information, summarize documents, analyze data, and provide well-sourced answers. Always cite your reasoning.",
    model: "gpt-4.1-mini",
    provider: "openai",
    tools: [{ id: "web_search", name: "Web Search", type: "web_search" }],
    isPublic: true,
  },
  {
    name: "Creative Writer",
    description: "Assists with creative writing, storytelling, and content creation",
    systemPrompt:
      "You are a creative writing assistant. Help users with storytelling, content creation, copywriting, and creative projects. Be imaginative, engaging, and adapt to different styles.",
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    tools: [],
    isPublic: true,
  },
  {
    name: "DevOps Engineer",
    description: "Helps with CI/CD, Docker, Kubernetes, and infrastructure",
    systemPrompt:
      "You are a senior DevOps engineer. Help with CI/CD pipelines, Docker, Kubernetes, cloud infrastructure (AWS/GCP/Azure), monitoring, and deployment strategies. Provide production-ready configurations.",
    model: "deepseek-chat",
    provider: "deepseek",
    tools: [{ id: "code_execution", name: "Code Execution", type: "code_execution" }],
    isPublic: true,
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(
    PRESET_AGENTS.map((a) => ({ ...a, id: uuid() }))
  );
  const [activeTab, setActiveTab] = useState<"library" | "builder" | "chat">("library");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<AgentMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleCreateAgent = useCallback(
    async (agentData: Omit<Agent, "id">) => {
      const newAgent: Agent = { ...agentData, id: uuid() };
      setAgents((prev) => [newAgent, ...prev]);
      setActiveTab("library");
    },
    []
  );

  const handleStartChat = (agent: Agent) => {
    setSelectedAgent(agent);
    setChatMessages([]);
    setActiveTab("chat");
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedAgent) return;

      const userMsg: AgentMessage = { id: uuid(), role: "user", content };
      const assistantMsg: AgentMessage = {
        id: uuid(),
        role: "assistant",
        content: "",
        model: selectedAgent.model,
        isStreaming: true,
      };

      setChatMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        const allMessages = [
          { role: "system" as const, content: selectedAgent.systemPrompt },
          ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content },
        ];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            model: selectedAgent.model,
            provider: selectedAgent.provider,
          }),
        });

        if (!response.ok) throw new Error("Chat failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No stream");

        const decoder = new TextDecoder();
        let fullContent = "";

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
              if (parsed.type === "content" || parsed.content) {
                fullContent += parsed.content;
                setChatMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: fullContent } : m
                  )
                );
              }
            } catch {
              continue;
            }
          }
        }

        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: fullContent, isStreaming: false }
              : m
          )
        );
      } catch (error) {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `Error: ${(error as Error).message}`, isStreaming: false }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [selectedAgent, chatMessages]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Agent Studio</span>
          <Badge variant="secondary" className="text-xs">
            OpenClaw
          </Badge>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-4 border-b border-border/40">
          <TabsList className="h-10">
            <TabsTrigger value="library" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Library
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Builder
            </TabsTrigger>
            {selectedAgent && (
              <TabsTrigger value="chat" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Chat with {selectedAgent.name}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="library" className="flex-1 m-0 overflow-auto">
          <div className="p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px]">
                              {agent.model}
                            </Badge>
                            {agent.isPublic ? (
                              <Globe className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-3">
                      {agent.description}
                    </CardDescription>
                    {agent.tools.length > 0 && (
                      <div className="flex gap-1.5 mb-3">
                        {agent.tools.map((tool) => (
                          <Badge key={tool.id} variant="outline" className="text-[10px] gap-1">
                            {tool.type === "web_search" && <Search className="h-2.5 w-2.5" />}
                            {tool.type === "code_execution" && <Code2 className="h-2.5 w-2.5" />}
                            {tool.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleStartChat(agent)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat with Agent
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="flex-1 m-0 overflow-auto">
          <div className="p-6 max-w-3xl mx-auto">
            <AgentBuilder onSave={handleCreateAgent} />
          </div>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 m-0 flex flex-col min-h-0">
          {selectedAgent && (
            <>
              <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Bot className="h-12 w-12 text-primary/30 mb-4" />
                      <h3 className="text-lg font-semibold mb-1">
                        {selectedAgent.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedAgent.description}
                      </p>
                    </div>
                  )}
                  {chatMessages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      model={msg.model}
                      isStreaming={msg.isStreaming}
                    />
                  ))}
                </div>
              </ScrollArea>
              <div className="max-w-4xl mx-auto w-full">
                <ChatInput
                  onSend={handleSendMessage}
                  isStreaming={isStreaming}
                  placeholder={`Message ${selectedAgent.name}...`}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
