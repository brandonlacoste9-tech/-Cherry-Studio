"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, ExternalLink, Download } from "lucide-react";

interface CodePreviewProps {
  code: string;
  isGenerating?: boolean;
}

export function CodePreview({ code, isGenerating }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "component.tsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Create a simple HTML preview from the code
  const previewHtml = useMemo(() => {
    // Extract just the JSX/TSX return content for preview
    const cleanCode = code
      .replace(/```[a-z]*\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0a0a0a; color: #f5f5f5; font-family: system-ui, sans-serif; padding: 1rem; }
    .preview-note { text-align: center; padding: 2rem; color: #888; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="preview-note">
    <p>Live preview requires a React runtime.</p>
    <p>Switch to the <strong>Code</strong> tab to view the generated component.</p>
    <pre style="text-align:left;background:#111;padding:1rem;border-radius:0.5rem;overflow-x:auto;margin-top:1rem;font-size:0.75rem;max-height:400px;overflow-y:auto"><code>${cleanCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
  </div>
</body>
</html>`;
  }, [code]);

  return (
    <div className="flex flex-col h-full border border-border/50 rounded-lg overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "preview" | "code")}
        className="flex flex-col h-full"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/30">
          <TabsList className="h-8">
            <TabsTrigger value="preview" className="text-xs h-7 px-3">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs h-7 px-3">
              Code
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={handleDownload}>
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <TabsContent value="preview" className="flex-1 m-0">
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-0 bg-black"
            sandbox="allow-scripts"
            title="Code Preview"
          />
        </TabsContent>

        <TabsContent value="code" className="flex-1 m-0 overflow-auto">
          <pre className="p-4 text-sm font-mono bg-muted/20 h-full overflow-auto">
            <code>{code.replace(/```[a-z]*\n?/g, "").replace(/```\n?/g, "").trim()}</code>
          </pre>
          {isGenerating && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
