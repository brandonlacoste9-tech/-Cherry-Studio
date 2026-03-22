"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Eye, Zap } from "lucide-react";
import { AI_MODELS, PROVIDER_CONFIGS } from "@/lib/ai/providers";
import type { AIProvider } from "@/types";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModel: string;
  selectedProvider: AIProvider;
  onSelect: (modelId: string, provider: AIProvider) => void;
}

export function ModelSelector({
  selectedModel,
  selectedProvider,
  onSelect,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);

  const providerGroups = Object.entries(PROVIDER_CONFIGS)
    .filter(([id]) => id !== "ollama")
    .map(([id, config]) => ({
      id: id as AIProvider,
      name: config.name,
      models: AI_MODELS.filter((m) => m.provider === id),
    }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 gap-2 text-xs border-border/50 bg-background/50"
        >
          <Zap className="h-3 w-3 text-primary" />
          <span className="max-w-[120px] truncate">
            {currentModel?.name || selectedModel}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <ScrollArea className="h-80">
          <div className="p-2">
            {providerGroups.map((group) => (
              <div key={group.id} className="mb-3">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.name}
                </div>
                {group.models.map((model) => (
                  <button
                    key={model.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left",
                      selectedModel === model.id && "bg-primary/10 text-primary"
                    )}
                    onClick={() => {
                      onSelect(model.id, model.provider);
                      setOpen(false);
                    }}
                  >
                    <span className="flex-1 truncate">{model.name}</span>
                    <div className="flex items-center gap-1">
                      {model.supportsVision && (
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      )}
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {Math.round(model.contextWindow / 1000)}K
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
