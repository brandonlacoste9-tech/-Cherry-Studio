"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings,
  Key,
  Globe,
  Palette,
  Bell,
  Shield,
  Save,
  Check,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface ApiKeyConfig {
  provider: string;
  label: string;
  key: string;
  baseUrl?: string;
  placeholder: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");

  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([
    { provider: "openai", label: "OpenAI", key: "", placeholder: "sk-..." },
    { provider: "anthropic", label: "Anthropic", key: "", placeholder: "sk-ant-..." },
    { provider: "deepseek", label: "DeepSeek", key: "", placeholder: "sk-..." },
    { provider: "moonshot", label: "Moonshot/Kimi", key: "", placeholder: "sk-..." },
    { provider: "ollama", label: "Ollama", key: "", baseUrl: "http://localhost:11434", placeholder: "Not required" },
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    usage: true,
    updates: false,
  });

  const handleSave = () => {
    // Save to localStorage for now (production would use API)
    localStorage.setItem("adgenai_api_keys", JSON.stringify(apiKeys));
    localStorage.setItem("adgenai_language", language);
    localStorage.setItem("adgenai_theme", theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const updateApiKey = (provider: string, field: "key" | "baseUrl", value: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.provider === provider ? { ...k, [field]: value } : k))
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 h-12 px-4 border-b border-border/40">
        <Settings className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Settings</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="api-keys">
            <TabsList className="mb-6">
              <TabsTrigger value="api-keys" className="gap-1.5">
                <Key className="h-3.5 w-3.5" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-1.5">
                <User className="h-3.5 w-3.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* API Keys */}
            <TabsContent value="api-keys" className="space-y-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    AI Provider API Keys
                  </CardTitle>
                  <CardDescription>
                    Configure your API keys for each AI provider. Keys are stored locally and sent with each request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {apiKeys.map((config) => (
                    <div key={config.provider} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{config.label}</Label>
                        <Badge variant="secondary" className="text-[10px]">
                          {config.provider}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys[config.provider] ? "text" : "password"}
                            value={config.key}
                            onChange={(e) => updateApiKey(config.provider, "key", e.target.value)}
                            placeholder={config.placeholder}
                            className="bg-muted/30 pr-10"
                          />
                          <button
                            onClick={() => toggleKeyVisibility(config.provider)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showKeys[config.provider] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      {config.provider === "ollama" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Base URL</Label>
                          <Input
                            value={config.baseUrl || ""}
                            onChange={(e) => updateApiKey(config.provider, "baseUrl", e.target.value)}
                            placeholder="http://localhost:11434"
                            className="bg-muted/30"
                          />
                        </div>
                      )}
                      <Separator className="opacity-30" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      defaultValue={session?.user?.name || ""}
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      defaultValue={session?.user?.email || ""}
                      className="bg-muted/30"
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences" className="space-y-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Appearance & Language
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Fran&ccedil;ais</SelectItem>
                        <SelectItem value="es">Espa&ntilde;ol</SelectItem>
                        <SelectItem value="pt-BR">Portugu&ecirc;s (Brasil)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive email updates</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
                    />
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Usage alerts</Label>
                      <p className="text-xs text-muted-foreground">Alert when nearing credit limits</p>
                    </div>
                    <Switch
                      checked={notifications.usage}
                      onCheckedChange={(v) => setNotifications((p) => ({ ...p, usage: v }))}
                    />
                  </div>
                  <Separator className="opacity-30" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Product updates</Label>
                      <p className="text-xs text-muted-foreground">New features and improvements</p>
                    </div>
                    <Switch
                      checked={notifications.updates}
                      onCheckedChange={(v) => setNotifications((p) => ({ ...p, updates: v }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90">
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
