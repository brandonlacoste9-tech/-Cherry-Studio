"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModelSelector } from "@/components/chat/model-selector";
import { Bot, Globe, Code2, Search, Save, Loader2 } from "lucide-react";
import type { AIProvider } from "@/types";

interface AgentBuilderProps {
  onSave: (agent: {
    name: string;
    description: string;
    systemPrompt: string;
    model: string;
    provider: AIProvider;
    tools: Array<{ id: string; name: string; type: string }>;
    isPublic: boolean;
  }) => Promise<void>;
  initialData?: {
    name: string;
    description: string;
    systemPrompt: string;
    model: string;
    provider: AIProvider;
    tools: Array<{ id: string; name: string; type: string }>;
    isPublic: boolean;
  };
}

const AVAILABLE_TOOLS = [
  { id: "web_search", name: "Web Search", type: "web_search", icon: Search },
  { id: "code_execution", name: "Code Execution", type: "code_execution", icon: Code2 },
];

export function AgentBuilder({ onSave, initialData }: AgentBuilderProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || "");
  const [model, setModel] = useState(initialData?.model || "gpt-4.1-mini");
  const [provider, setProvider] = useState<AIProvider>(initialData?.provider || "openai");
  const [selectedTools, setSelectedTools] = useState<string[]>(
    initialData?.tools?.map((t) => t.id) || []
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !systemPrompt.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
        model,
        provider,
        tools: AVAILABLE_TOOLS.filter((t) => selectedTools.includes(t.id)).map(
          ({ id, name, type }) => ({ id, name, type })
        ),
        isPublic,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Agent Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Agent Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Agent"
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <ModelSelector
              selectedModel={model}
              selectedProvider={provider}
              onSelect={(m, p) => {
                setModel(m);
                setProvider(p);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of what this agent does"
            className="bg-muted/30"
          />
        </div>

        <div className="space-y-2">
          <Label>System Prompt</Label>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant that specializes in..."
            rows={6}
            className="bg-muted/30 resize-none"
          />
        </div>

        <div className="space-y-3">
          <Label>Tools</Label>
          <div className="flex gap-2">
            {AVAILABLE_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  selectedTools.includes(tool.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                <tool.icon className="h-4 w-4" />
                <span className="text-sm">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            <Label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Make public
            </Label>
          </div>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !systemPrompt.trim() || saving}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Agent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
