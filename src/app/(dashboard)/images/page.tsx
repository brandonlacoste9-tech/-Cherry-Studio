"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ImageIcon,
  Wand2,
  Loader2,
  Download,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { v4 as uuid } from "uuid";

interface GeneratedImage {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  url: string;
  model: string;
  size: string;
  quality: string;
  style: string;
  createdAt: Date;
}

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("dall-e-3");
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [style, setStyle] = useState("vivid");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), model, size, quality, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const newImages: GeneratedImage[] = data.images.map(
        (img: { url: string; revisedPrompt?: string }) => ({
          id: uuid(),
          prompt: prompt.trim(),
          revisedPrompt: img.revisedPrompt,
          url: img.url,
          model,
          size,
          quality,
          style,
          createdAt: new Date(),
        })
      );

      setImages((prev) => [...newImages, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, model, size, quality, style]);

  const handleCopyPrompt = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 h-12 px-4 border-b border-border/40">
        <ImageIcon className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Image Generation</span>
        <Badge variant="secondary" className="text-xs">DALL-E 3</Badge>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Controls */}
        <div className="lg:w-[360px] border-b lg:border-b-0 lg:border-r border-border/40 p-4 space-y-4">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape at sunset with flying cars and neon lights..."
              rows={4}
              className="resize-none bg-muted/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                  <SelectItem value="1024x1792">1024x1792</SelectItem>
                  <SelectItem value="1792x1024">1792x1024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vivid">Vivid</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Gallery */}
        <ScrollArea className="flex-1 p-4">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Sparkles className="h-12 w-12 text-primary/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Image Generation</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Describe an image and let AI create it for you. Supports DALL-E 3
                with multiple sizes, quality levels, and styles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {images.map((img) => (
                <Card key={img.id} className="border-border/50 bg-card/50 overflow-hidden group">
                  <div className="relative aspect-square">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon-xs"
                          onClick={() => window.open(img.url, "_blank")}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon-xs"
                          onClick={() => handleCopyPrompt(img.id, img.revisedPrompt || img.prompt)}
                        >
                          {copiedId === img.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {img.revisedPrompt || img.prompt}
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      <Badge variant="secondary" className="text-[10px]">{img.size}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{img.quality}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{img.style}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
