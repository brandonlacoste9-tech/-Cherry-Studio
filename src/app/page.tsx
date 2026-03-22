"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MessageSquare,
  Code2,
  Bot,
  BookOpen,
  ImageIcon,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat Studio",
    description:
      "Stream conversations with GPT-4.1, Claude, DeepSeek, Moonshot, and Ollama. Markdown rendering, code blocks, thinking sections, and vision support.",
  },
  {
    icon: Code2,
    title: "Code Builder",
    description:
      "Generate full Next.js + Tailwind + shadcn/ui components from prompts or screenshots. Live preview with Sandpack and one-click Vercel deploy.",
  },
  {
    icon: Bot,
    title: "Agent Studio",
    description:
      "Build custom AI agents with system prompts, model selection, and built-in tools. Browse the agent library or create your own.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "Upload PDFs and documents, chunk and embed them, then chat with your knowledge. Full RAG pipeline with multiple knowledge bases.",
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    description:
      "Create stunning images with DALL-E 3 and Stable Diffusion. Gallery view, download, and share your AI-generated artwork.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description:
      "Full internationalization with English, French, Spanish, and Portuguese. Your AI Studio speaks your language.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "50 credits/month",
    features: [
      "5 AI models",
      "Chat Studio",
      "Code Builder (basic)",
      "1 Knowledge Base",
      "Community agents",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    credits: "500 credits/month",
    features: [
      "All AI models",
      "Unlimited chat history",
      "Code Builder + deploy",
      "5 Knowledge Bases",
      "Custom agents",
      "Image generation",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$50",
    period: "/month",
    credits: "2,000 credits/month",
    features: [
      "Everything in Pro",
      "Unlimited Knowledge Bases",
      "Advanced RAG pipeline",
      "Agent marketplace",
      "API access",
      "Team collaboration",
      "Dedicated support",
    ],
    cta: "Go Studio",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                AdgenAI
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/chat">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Try Free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Zap className="mr-1 h-3.5 w-3.5" /> 50 free credits — no sign-up required
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Your AI.</span>{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Your Studio.</span>
            <br />
            <span className="text-foreground">Your Rules.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Chat with GPT-4.1, Claude, DeepSeek, and more. Generate code, build agents, manage knowledge bases, and create images — all from one premium AI studio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat">
              <Button size="lg" className="text-base px-8 bg-primary hover:bg-primary/90">
                Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8">Sign In</Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Your API keys stay local</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> 50 free credits</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need in{" "}
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">one studio</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From chat to code generation, agent building to knowledge management — AdgenAI is your complete AI workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">transparent</span> pricing
            </h2>
            <p className="text-muted-foreground text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={`relative border-border/50 bg-card/50 backdrop-blur-sm ${tier.highlighted ? "border-primary/50 shadow-lg shadow-primary/10 scale-105" : ""}`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-primary font-medium">{tier.credits}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.name === "Free" ? "/chat" : `/register?plan=${tier.name.toLowerCase()}`}>
                    <Button className={`w-full ${tier.highlighted ? "bg-primary hover:bg-primary/90" : ""}`} variant={tier.highlighted ? "default" : "outline"}>
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Credit costs: Chat = 1 credit | Code Generation = 5 credits | Image Generation = 10 credits</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to build with AI?</h2>
          <p className="text-muted-foreground text-lg mb-8">Join thousands of developers and creators using AdgenAI to supercharge their workflow.</p>
          <Link href="/chat">
            <Button size="lg" className="text-base px-8 bg-primary hover:bg-primary/90">
              Start Free — No Sign-Up <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">AdgenAI</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AdgenAI. Your AI. Your Studio. Your Rules.</p>
        </div>
      </footer>
    </div>
  );
}
