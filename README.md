# AdGenXAI — Your AI. Your Studio. Your Rules.

A premium AI Studio SaaS platform featuring the full **Claw Ecosystem** — OpenClaw, NanoClaw, NullClaw — powered by OpenManus.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui + Framer Motion
- **Routing**: Wouter
- **Design**: Amber Atelier dark-mode aesthetic (DM Serif Display + Space Grotesk + Geist)

## Features

### Studio
- **Chat Studio** — Multi-model chat (GPT-4.1, Claude 3.5, DeepSeek R1, Moonshot/Kimi, Ollama)
- **Code Builder** — Live HTML preview with OpenClaw agent integration
- **Knowledge Base** — RAG pipeline UI with document ingestion
- **Image Gen** — AI image generation gallery

### Claw Ecosystem
- **OpenClaw** — Full-featured agent marketplace (300+ agents, builder wizard, test chat, My Agents)
- **NanoClaw** — Docker-isolated agent containers with zero-trust execution, Agent Swarms
- **NullClaw** — 678KB Zig-compiled edge binary, 2ms boot, 1MB RAM, WASM-compatible
- **Task Runner** — One-button OpenManus task execution with live ReAct trace

### Account
- **Billing** — Free / Pro ($20) / Studio ($50) / Enterprise ($100) + Pay-As-You-Go credit packs
- **Settings** — API keys, appearance, profile, language, notifications

## Getting Started

```bash
pnpm install
pnpm dev
```

## Architecture

```
AdGenXAI (Studio UI)
    └── OpenClaw (Agent Marketplace)
            └── OpenManus (Agent Runtime — ReAct loop)
                    ├── NanoClaw (Docker containerized workers)
                    └── NullClaw (Edge/WASM binary workers)
```

## Roadmap

- [ ] Full-stack upgrade — Vertex AI / Google AI Studio API for real streaming
- [ ] Stripe billing integration
- [ ] Neon/Supabase database for user accounts and agent persistence
- [ ] Firecrawl + Playwright for real agent web browsing
- [ ] MiniMax / HeyGen for real image and video generation
- [ ] Shareable task run output pages
- [ ] OpenClaw agent publishing to marketplace
