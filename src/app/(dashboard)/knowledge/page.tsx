"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import {
  BookOpen,
  Plus,
  Upload,
  FileText,
  Trash2,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Database,
} from "lucide-react";
import { v4 as uuid } from "uuid";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  documents: KnowledgeDocument[];
}

interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  chunks: number;
  status: "processing" | "ready" | "error";
}

interface KBMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function KnowledgeBasePage() {
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [activeBase, setActiveBase] = useState<KnowledgeBase | null>(null);
  const [view, setView] = useState<"list" | "detail" | "chat">("list");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState<KBMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBase = () => {
    if (!newName.trim()) return;
    const kb: KnowledgeBase = {
      id: uuid(),
      name: newName.trim(),
      description: newDesc.trim(),
      documentCount: 0,
      documents: [],
    };
    setBases((prev) => [kb, ...prev]);
    setNewName("");
    setNewDesc("");
    setDialogOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!activeBase || files.length === 0) return;

    setUploading(true);
    for (const file of files) {
      const doc: KnowledgeDocument = {
        id: uuid(),
        name: file.name,
        type: file.type,
        size: file.size,
        chunks: Math.ceil(file.size / 1000),
        status: "ready",
      };

      setBases((prev) =>
        prev.map((b) =>
          b.id === activeBase.id
            ? {
                ...b,
                documents: [...b.documents, doc],
                documentCount: b.documentCount + 1,
              }
            : b
        )
      );
      setActiveBase((prev) =>
        prev
          ? {
              ...prev,
              documents: [...prev.documents, doc],
              documentCount: prev.documentCount + 1,
            }
          : prev
      );
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChat = useCallback(
    async (content: string) => {
      if (!activeBase) return;

      const userMsg: KBMessage = { id: uuid(), role: "user", content };
      const assistantMsg: KBMessage = {
        id: uuid(),
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setChatMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/knowledge/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            knowledgeBaseId: activeBase.id,
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
              if (parsed.content) {
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
    [activeBase]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Chat view
  if (view === "chat" && activeBase) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 h-12 px-4 border-b border-border/40">
          <Button variant="ghost" size="icon-xs" onClick={() => setView("detail")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Chat with: {activeBase.name}</span>
          <Badge variant="secondary" className="text-xs">
            {activeBase.documentCount} docs
          </Badge>
        </div>
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Database className="h-12 w-12 text-primary/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">Chat with your documents</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions about the documents in {activeBase.name}
                </p>
              </div>
            )}
            {chatMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={msg.isStreaming}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput
            onSend={handleChat}
            isStreaming={isStreaming}
            placeholder="Ask about your documents..."
          />
        </div>
      </div>
    );
  }

  // Detail view
  if (view === "detail" && activeBase) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-12 px-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-xs" onClick={() => { setView("list"); setActiveBase(null); }}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{activeBase.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.csv,.json,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-primary hover:bg-primary/90"
              onClick={() => { setChatMessages([]); setView("chat"); }}
              disabled={activeBase.documents.length === 0}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {activeBase.description && (
              <p className="text-sm text-muted-foreground mb-4">{activeBase.description}</p>
            )}
            {activeBase.documents.map((doc) => (
              <Card key={doc.id} className="border-border/50 bg-card/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <FileText className="h-8 w-8 text-primary/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{formatSize(doc.size)}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{doc.chunks} chunks</Badge>
                      <Badge variant={doc.status === "ready" ? "default" : "secondary"} className="text-[10px]">
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-xs">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {activeBase.documents.length === 0 && (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload PDFs, text files, or documents to start chatting with your knowledge base.
                </p>
                <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" /> Upload Documents
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // List view
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Knowledge Base</span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> New Base
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Knowledge Base</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Knowledge Base"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this knowledge base about?"
                  rows={3}
                />
              </div>
              <Button onClick={createBase} disabled={!newName.trim()} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {bases.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Upload documents and chat with your knowledge. Create multiple knowledge bases for different topics.
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create your first base
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bases.map((kb) => (
                <Card
                  key={kb.id}
                  className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => { setActiveBase(kb); setView("detail"); }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{kb.name}</CardTitle>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {kb.documentCount} documents
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {kb.description && (
                    <CardContent>
                      <CardDescription className="text-sm">{kb.description}</CardDescription>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
