# AdgenAI

> **Your AI. Your Studio. Your Rules.**

AdgenAI is a full-featured AI Studio SaaS platform built with Next.js 15, React 19, TypeScript, Tailwind CSS 4, and shadcn/ui. It provides a unified workspace for AI chat, code generation, agent building, knowledge management, and image creation.

---

## Features

### Chat Studio
- Streaming chat with real-time markdown rendering, code blocks, and syntax highlighting
- Support for **5 AI providers**: Ollama, OpenAI (GPT-4.1), Anthropic Claude, DeepSeek, Moonshot/Kimi
- Model selector dropdown with provider grouping and context window badges
- Chat history sidebar with create, rename, and delete conversations
- Image/file attachment support for vision models
- Fork conversations at any message
- Thinking/reasoning section display (DeepSeek R1)

### Code Builder (v0-style)
- Prompt-to-code generation: describe a component and get production-ready React code
- Screenshot/image to code conversion using vision models
- Live code preview with syntax highlighting
- Project management sidebar
- One-click download as `.tsx` file
- Deploy to Vercel button

### Agent Studio (OpenClaw)
- Visual agent builder with system prompt, model selection, and tool configuration
- Pre-built agent library (Code Reviewer, Research Assistant, Creative Writer, DevOps Engineer)
- Chat interface for each agent with streaming
- Built-in tools: Web Search, Code Execution
- Public/private agent toggle
- CRUD API for agents

### Knowledge Base (RAG)
- Create and manage multiple knowledge bases
- Upload documents (PDF, TXT, MD, CSV, JSON)
- Automatic text chunking for retrieval
- Chat with your documents using keyword-based RAG
- Document status tracking

### Image Generation
- DALL-E 3 integration via OpenAI API
- Configurable size (1024x1024, 1024x1792, 1792x1024)
- Quality control (Standard, HD)
- Style selection (Vivid, Natural)
- Image gallery with download and prompt copy

### Billing & Subscriptions
- Stripe integration with checkout sessions
- 3-tier pricing: Free, Pro ($19/mo), Enterprise ($49/mo)
- Billing portal for subscription management
- Webhook handler for subscription lifecycle events
- Usage dashboard with progress tracking

### Settings
- API key management for all 5 providers (with show/hide toggle)
- Ollama base URL configuration
- Profile management
- Language and theme preferences
- Notification controls

### Internationalization (i18n)
- 4 languages: English, French, Spanish, Portuguese (Brazil)
- Context-based translation system with `useI18n` hook
- localStorage persistence
- Language selector in settings

### Authentication
- NextAuth v5 with credentials provider
- Email/password login and registration
- Password hashing with bcryptjs
- Guest access (limited features)
- Session management

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Auth | NextAuth v5 (Auth.js) |
| Database | Drizzle ORM + Neon PostgreSQL |
| AI SDK | OpenAI SDK (OpenAI-compatible for all providers) |
| Payments | Stripe |
| State | Zustand |
| i18n | Custom context-based system |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard sidebar layout
│   │   ├── chat/page.tsx       # Chat Studio
│   │   ├── code/page.tsx       # Code Builder
│   │   ├── agents/page.tsx     # Agent Studio
│   │   ├── knowledge/page.tsx  # Knowledge Base
│   │   ├── images/page.tsx     # Image Generation
│   │   ├── billing/page.tsx    # Billing & Usage
│   │   └── settings/page.tsx   # Settings
│   ├── api/
│   │   ├── auth/               # NextAuth routes
│   │   ├── chat/               # Chat + conversations API
│   │   ├── code/               # Code generation API
│   │   ├── agents/             # Agents CRUD API
│   │   ├── knowledge/          # Knowledge base + documents API
│   │   ├── images/             # Image generation API
│   │   ├── billing/            # Stripe checkout, portal, webhook
│   │   └── providers/          # AI provider discovery
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Landing page
├── components/
│   ├── chat/                   # Chat components
│   ├── code/                   # Code builder components
│   ├── agents/                 # Agent components
│   ├── providers/              # Context providers
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── ai/                     # AI provider abstraction
│   ├── db/                     # Drizzle schema + connection
│   ├── i18n/                   # Translations + provider
│   ├── auth.ts                 # NextAuth config
│   └── utils.ts                # Utility functions
├── store/                      # Zustand stores
├── types/                      # TypeScript types
└── middleware.ts                # Security headers
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/brandonlacoste9-tech/-Cherry-Studio.git
cd -Cherry-Studio

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Environment Variables

See `.env.example` for all required variables. At minimum you need:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# At least one AI provider key
OPENAI_API_KEY=sk-...
```

### Database Setup

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## AI Providers

| Provider | Models | Vision | Thinking |
|----------|--------|--------|----------|
| OpenAI | GPT-4.1, GPT-4.1-mini, GPT-4.1-nano | Yes (GPT-4.1) | No |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Haiku | Yes (Sonnet) | No |
| DeepSeek | DeepSeek Chat, DeepSeek Reasoner | No | Yes (Reasoner) |
| Moonshot | Moonshot v1 8K/32K/128K | No | No |
| Ollama | Any local model | Varies | Varies |

All providers use the OpenAI-compatible SDK pattern for unified streaming.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## License

MIT

---

Built with precision by **AdgenAI Build System**
