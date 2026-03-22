<div align="center">
  <img src="resources/icon.png" alt="Cherry Studio Logo" width="120" />
  <h1>🍒 Cherry Studio</h1>
  <p>A feature-rich, cross-platform AI chat desktop application</p>
  
  <p>
    <img src="https://img.shields.io/badge/Electron-33+-blue?logo=electron" alt="Electron" />
    <img src="https://img.shields.io/badge/React-18+-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  </p>
</div>

## ✨ Features

### 🤖 LLM Provider Support
- **Cloud Providers**: OpenAI (GPT-4o, o1), Google Gemini (1.5 Pro/Flash), Anthropic (Claude 3.5)
- **Specialized**: Perplexity, Groq, Mistral, Cohere
- **AI Web Services**: Claude.ai, Perplexity AI, Poe, and others
- **Local Models**: Ollama, LM Studio — run models offline

### 🧠 AI Assistants & Conversations
- **300+ Pre-configured Assistants** across 20+ categories (Coding, Writing, Analysis, etc.)
- **Custom Assistant Creation** — define your own system prompts
- **Multi-model Conversations** — switch models within the same chat
- **Conversation History** — persistent, searchable chat history

### 📄 Document & Data Processing
- **File Support**: Text, Images (vision), PDF, Office documents, Code files
- **Drag & Drop** file upload directly into chat
- **WebDAV Integration** — backup/sync conversations to any WebDAV server
- **Mermaid Chart** visualization support
- **Code Syntax Highlighting** with highlight.js

### 🔧 Practical Tools
- **Global Search** (Ctrl+K) — search across all conversations and messages
- **Topic Management** — organize chats into folders/topics
- **AI Translation** — translate text between 20+ languages using your AI provider
- **Drag-and-drop Sorting** for conversations and topics
- **MCP (Model Context Protocol)** server support for tool calling

### 🎨 Enhanced User Experience
- **Cross-platform**: Windows, macOS, Linux
- **Light/Dark/System Themes** with smooth transitions
- **Complete Markdown Rendering** with GFM support
- **Streaming Responses** with real-time text generation
- **Keyboard Shortcuts** for power users
- **Easy Content Sharing** — copy messages and code blocks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/cherry-studio/cherry-studio.git
cd cherry-studio

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Building

```bash
# Build for current platform
npm run build

# Platform-specific builds
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

## 🔑 Configuration

### Setting Up AI Providers

1. Launch Cherry Studio
2. Navigate to **Settings** (gear icon in sidebar)
3. Click **Add Provider** and select your provider
4. Enter your API key
5. Click **Test** to verify the connection
6. Enable the provider with the toggle

### Supported Providers

| Provider | Type | API Key Required |
|----------|------|-----------------|
| OpenAI | Cloud | Yes |
| Google Gemini | Cloud | Yes |
| Anthropic Claude | Cloud | Yes |
| Perplexity | Cloud | Yes |
| Groq | Cloud | Yes |
| Mistral | Cloud | Yes |
| Ollama | Local | No |
| LM Studio | Local | No |
| Custom (OpenAI-compatible) | Any | Optional |

### WebDAV Backup

Configure WebDAV for automatic backup:
1. Go to Settings → WebDAV
2. Enter your WebDAV server URL, username, and password
3. Set the remote path for backups
4. Enable auto-sync if desired

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+K` | Open global search |
| `Ctrl/Cmd+N` | New conversation |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Ctrl+Enter` | Translate (in Translation panel) |

## 🏗️ Architecture

```
src/
├── main/               # Electron main process
│   └── index.ts        # Window management, IPC handlers, file system
├── preload/            # Electron preload scripts
│   ├── index.ts        # IPC bridge
│   └── index.d.ts      # Type definitions
└── renderer/           # React frontend
    ├── index.html      # HTML entry point
    └── src/
        ├── App.tsx     # Main app with routing and theme
        ├── main.tsx    # React entry point
        ├── components/ # UI components
        │   ├── chat/   # Chat interface
        │   ├── assistants/  # Assistant selector
        │   ├── providers/   # Provider settings
        │   ├── search/      # Global search
        │   ├── settings/    # App settings
        │   └── translation/ # Translation panel
        ├── services/   # Business logic
        │   ├── llm/    # LLM provider implementations
        │   ├── AssistantService.ts
        │   ├── SearchService.ts
        │   ├── TranslationService.ts
        │   ├── DocumentService.ts
        │   ├── WebDAVService.ts
        │   └── MCPService.ts
        ├── store/      # Zustand state management
        │   ├── providers.ts
        │   ├── assistants.ts
        │   ├── conversations.ts
        │   └── settings.ts
        ├── types/      # TypeScript type definitions
        └── data/       # Static data (300+ assistants)
```

## 📦 Tech Stack

- **Desktop**: Electron 33+
- **Frontend**: React 18 + TypeScript 5
- **Build**: electron-vite + Vite 5
- **Styling**: Tailwind CSS 3
- **State**: Zustand 5
- **Markdown**: react-markdown + remark-gfm + rehype-highlight
- **LLM SDKs**: openai, @google/generative-ai, @anthropic-ai/sdk
- **File Sync**: webdav
- **Icons**: lucide-react
- **UI**: Radix UI primitives

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ for the AI community</p>
</div>
