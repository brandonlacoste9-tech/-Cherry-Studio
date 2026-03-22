"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MarkdownRenderer } from "./markdown-renderer";
import { Bot, User, Brain, Copy, Check, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  isStreaming?: boolean;
  thinkingContent?: string;
  onFork?: () => void;
}

export function ChatMessage({
  role,
  content,
  model,
  isStreaming,
  thinkingContent,
  onFork,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 py-4 px-4 group", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex-1 min-w-0 space-y-2", isUser && "text-right")}>
        {/* Model label */}
        {!isUser && model && (
          <span className="text-xs text-muted-foreground">{model}</span>
        )}

        {/* Thinking section */}
        {thinkingContent && (
          <div className="mb-2">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Brain className="h-3 w-3" />
              <span>{showThinking ? "Hide" : "Show"} thinking</span>
            </button>
            {showThinking && (
              <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border/30 text-sm text-muted-foreground italic">
                <MarkdownRenderer content={thinkingContent} />
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        <div
          className={cn(
            "inline-block max-w-[85%] rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted/50 rounded-bl-md"
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <MarkdownRenderer content={content} />
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
          )}
        </div>

        {/* Actions */}
        {!isUser && !isStreaming && content && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            {onFork && (
              <Button variant="ghost" size="icon-xs" onClick={onFork}>
                <GitFork className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
