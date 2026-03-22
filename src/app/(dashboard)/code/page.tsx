"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelSelector } from "@/components/chat/model-selector";
import { CodePreview } from "@/components/code/code-preview";
import {
  Code2,
  Send,
  Loader2,
  ImageIcon,
  X,
  Plus,
  Trash2,
  GitFork,
  Rocket,
} from "lucide-react";
import type { AIProvider } from "@/types";
import { v4 as uuid } from "uuid";

interface CodeProject {
  id: string;
  name: string;
  prompt: string;
  code: string;
  model: string;
  createdAt: Date;
}

export default function CodeBuilderPage() {
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4.1-mini");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("openai");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && !imagePreview) return;

    setIsGenerating(true);
    setGeneratedCode("");
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
          provider: selectedProvider,
          imageUrl: imagePreview,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("Generation failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let fullCode = "";

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
            if (parsed.content) {
              fullCode += parsed.content;
              setGeneratedCode(fullCode);
            }
          } catch {
            continue;
          }
        }
      }

      // Save as project
      const project: CodeProject = {
        id: uuid(),
        name: prompt.slice(0, 40) || "Generated Component",
        prompt: prompt,
        code: fullCode,
        model: selectedModel,
        createdAt: new Date(),
      };
      setProjects((prev) => [project, ...prev]);
      setActiveProjectId(project.id);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setGeneratedCode(`// Error: ${(error as Error).message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedModel, selectedProvider, imagePreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeploy = () => {
    const code = generatedCode || activeProject?.code || "";
    const encoded = encodeURIComponent(code);
    window.open(
      `https://vercel.com/new/clone?s=${encoded}`,
      "_blank"
    );
  };

  return (
    <div className="flex h-full">
      {/* Project sidebar */}
      <div className="w-56 border-r border-border/40 flex flex-col">
        <div className="p-3 border-b border-border/40">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Projects
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setActiveProjectId(project.id);
                  setGeneratedCode(project.code);
                  setPrompt(project.prompt);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeProjectId === project.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                <div className="truncate">{project.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {project.model}
                </div>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No projects yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Code Builder</span>
            <Badge variant="secondary" className="text-xs">v0-style</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector
              selectedModel={selectedModel}
              selectedProvider={selectedProvider}
              onSelect={(m, p) => {
                setSelectedModel(m);
                setSelectedProvider(p);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeploy}
              disabled={!generatedCode}
              className="gap-1.5"
            >
              <Rocket className="h-3.5 w-3.5" />
              Deploy
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Prompt area */}
          <div className="lg:w-[400px] border-b lg:border-b-0 lg:border-r border-border/40 flex flex-col p-4">
            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Describe what you want to build
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A dashboard card showing user analytics with a line chart, user count, and growth percentage..."
                  rows={6}
                  className="resize-none bg-muted/30"
                />
              </div>

              {/* Image upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border/50">
                    <img
                      src={imagePreview}
                      alt="Screenshot"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Upload screenshot
                  </Button>
                )}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt.trim() && !imagePreview)}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Generate Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex-1 p-4 min-h-0">
            {generatedCode ? (
              <CodePreview code={generatedCode} isGenerating={isGenerating} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code2 className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Code Builder</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Describe a component or upload a screenshot to generate
                    production-ready Next.js + Tailwind + shadcn/ui code.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
