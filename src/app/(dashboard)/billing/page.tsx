"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Crown,
  BarChart3,
  MessageSquare,
  Code2,
  ImageIcon,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    description: "Get started with basic AI features",
    features: [
      "50 chat messages/day",
      "5 code generations/day",
      "2 image generations/day",
      "1 knowledge base",
      "Basic models (GPT-4.1-mini)",
      "Community support",
    ],
    limits: { chats: 50, code: 5, images: 2, knowledgeBases: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    icon: Zap,
    description: "For professionals and power users",
    popular: true,
    features: [
      "Unlimited chat messages",
      "100 code generations/day",
      "50 image generations/day",
      "10 knowledge bases",
      "All AI models",
      "Priority support",
      "Custom agents",
      "API access",
    ],
    limits: { chats: -1, code: 100, images: 50, knowledgeBases: 10 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$49",
    period: "/month",
    icon: Crown,
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Unlimited everything",
      "Team collaboration",
      "SSO/SAML",
      "Custom model fine-tuning",
      "Dedicated support",
      "SLA guarantee",
      "On-premise deployment",
    ],
    limits: { chats: -1, code: -1, images: -1, knowledgeBases: -1 },
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const [currentPlan] = useState("free");
  const [loading, setLoading] = useState<string | null>(null);

  // Mock usage data
  const usage = {
    chats: { used: 23, limit: 50 },
    code: { used: 2, limit: 5 },
    images: { used: 1, limit: 2 },
    knowledgeBases: { used: 0, limit: 1 },
  };

  const handleSubscribe = async (plan: string) => {
    if (plan === "free") return;
    setLoading(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading("manage");
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 h-12 px-4 border-b border-border/40">
        <CreditCard className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Billing & Usage</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Usage Dashboard */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Usage This Period
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Chat Messages</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {usage.chats.used}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{usage.chats.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.chats.used / usage.chats.limit) * 100}
                    className="h-1.5"
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Code Generations</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {usage.code.used}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{usage.code.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.code.used / usage.code.limit) * 100}
                    className="h-1.5"
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Image Generations</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {usage.images.used}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{usage.images.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.images.used / usage.images.limit) * 100}
                    className="h-1.5"
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Knowledge Bases</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {usage.knowledgeBases.used}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{usage.knowledgeBases.limit}
                    </span>
                  </div>
                  <Progress
                    value={
                      (usage.knowledgeBases.used / usage.knowledgeBases.limit) *
                      100
                    }
                    className="h-1.5"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* Pricing Plans */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`border-border/50 bg-card/50 relative ${
                    plan.popular ? "border-primary/50 shadow-lg shadow-primary/5" : ""
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <plan.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    </div>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full gap-2 ${
                        plan.id === currentPlan
                          ? "bg-muted text-muted-foreground"
                          : plan.popular
                          ? "bg-primary hover:bg-primary/90"
                          : ""
                      }`}
                      variant={plan.id === currentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                      disabled={plan.id === currentPlan || loading === plan.id}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {loading === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : plan.id === currentPlan ? (
                        "Current Plan"
                      ) : (
                        <>
                          Upgrade <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Manage subscription */}
          {currentPlan !== "free" && (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">Manage Subscription</p>
                  <p className="text-xs text-muted-foreground">
                    Update payment method, view invoices, or cancel
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleManage}
                  disabled={loading === "manage"}
                >
                  {loading === "manage" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5" />
                  )}
                  Billing Portal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
