"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Download, Eye, Code2 } from "lucide-react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";

interface CodePreviewProps {
  code: string;
  isGenerating?: boolean;
}

function extractComponentCode(raw: string): string {
  return raw
    .replace(/```[a-z]*\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

export function CodePreview({ code, isGenerating }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const cleanCode = useMemo(() => extractComponentCode(code), [code]);

  const appCode = useMemo(() => {
    const hasDefaultExport = /export\s+default/.test(cleanCode);
    if (hasDefaultExport) {
      return `import Component from "./Component";
export default function App() {
  return (
    <div style={{padding:"1rem",minHeight:"100vh",background:"#fff"}}>
      <Component />
    </div>
  );
}`;
    }
    return `export default function App() {
  return (
    <div style={{padding:"1rem",color:"#666",fontFamily:"system-ui"}}>
      <p>Component generated — switch to Code tab to view.</p>
    </div>
  );
}`;
  }, [cleanCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([cleanCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "component.tsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full border border-border/50 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/20">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "code")}>
          <TabsList className="h-8 bg-background/60">
            <TabsTrigger value="preview" className="text-xs h-7 px-3 gap-1.5">
              <Eye className="h-3 w-3" /> Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs h-7 px-3 gap-1.5">
              <Code2 className="h-3 w-3" /> Code
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={handleCopy} title="Copy code">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={handleDownload} title="Download">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === "preview" ? (
          <SandpackProvider
            template="react-ts"
            theme="light"
            files={{
              "/Component.tsx": cleanCode,
              "/App.tsx": appCode,
            }}
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
            }}
          >
            <SandpackLayout style={{ height: "100%", border: "none" }}>
              <SandpackPreview
                style={{ height: "100%", flex: 1 }}
                showNavigator={false}
                showOpenInCodeSandbox={false}
              />
            </SandpackLayout>
          </SandpackProvider>
        ) : (
          <div className="relative h-full">
            <SandpackProvider
              template="react-ts"
              theme="light"
              files={{ "/Component.tsx": cleanCode }}
            >
              <SandpackLayout style={{ height: "100%", border: "none" }}>
                <SandpackCodeEditor
                  style={{ height: "100%", flex: 1 }}
                  showTabs={false}
                  showLineNumbers
                />
              </SandpackLayout>
            </SandpackProvider>
            {isGenerating && (
              <div className="absolute bottom-4 right-4">
                <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
