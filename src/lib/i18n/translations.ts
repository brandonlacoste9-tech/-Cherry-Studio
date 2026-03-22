// ============================================
// AdgenAI — Internationalization (i18n) System
// Supports: English, French, Spanish, Portuguese (Brazil)
// ============================================

export type Locale = "en" | "fr" | "es" | "pt-BR";

export const LOCALES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  "pt-BR": "Português (Brasil)",
};

export const DEFAULT_LOCALE: Locale = "en";

type TranslationKeys = {
  // Common
  "common.appName": string;
  "common.tagline": string;
  "common.getStarted": string;
  "common.signIn": string;
  "common.signUp": string;
  "common.signOut": string;
  "common.save": string;
  "common.cancel": string;
  "common.delete": string;
  "common.edit": string;
  "common.create": string;
  "common.search": string;
  "common.loading": string;
  "common.error": string;
  "common.success": string;

  // Navigation
  "nav.chat": string;
  "nav.code": string;
  "nav.agents": string;
  "nav.knowledge": string;
  "nav.images": string;
  "nav.billing": string;
  "nav.settings": string;

  // Landing
  "landing.hero.title": string;
  "landing.hero.subtitle": string;
  "landing.features.title": string;
  "landing.pricing.title": string;

  // Chat
  "chat.newChat": string;
  "chat.placeholder": string;
  "chat.empty.title": string;
  "chat.empty.description": string;

  // Code Builder
  "code.title": string;
  "code.placeholder": string;
  "code.generate": string;
  "code.generating": string;
  "code.deploy": string;
  "code.upload": string;

  // Agents
  "agents.title": string;
  "agents.library": string;
  "agents.builder": string;
  "agents.chatWith": string;

  // Knowledge Base
  "kb.title": string;
  "kb.newBase": string;
  "kb.upload": string;
  "kb.chatDocs": string;

  // Images
  "images.title": string;
  "images.generate": string;
  "images.generating": string;

  // Billing
  "billing.title": string;
  "billing.usage": string;
  "billing.plans": string;
  "billing.currentPlan": string;
  "billing.upgrade": string;

  // Settings
  "settings.title": string;
  "settings.apiKeys": string;
  "settings.profile": string;
  "settings.preferences": string;
  "settings.notifications": string;
};

const translations: Record<Locale, TranslationKeys> = {
  en: {
    "common.appName": "AdgenAI",
    "common.tagline": "Your AI. Your Studio. Your Rules.",
    "common.getStarted": "Get Started Free",
    "common.signIn": "Sign In",
    "common.signUp": "Sign Up",
    "common.signOut": "Sign Out",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "nav.chat": "Chat Studio",
    "nav.code": "Code Builder",
    "nav.agents": "Agent Studio",
    "nav.knowledge": "Knowledge Base",
    "nav.images": "Image Gen",
    "nav.billing": "Billing",
    "nav.settings": "Settings",
    "landing.hero.title": "Your AI. Your Studio. Your Rules.",
    "landing.hero.subtitle": "The all-in-one AI platform for chat, code generation, agents, knowledge bases, and image creation.",
    "landing.features.title": "Everything you need in one AI Studio",
    "landing.pricing.title": "Simple, transparent pricing",
    "chat.newChat": "New Chat",
    "chat.placeholder": "Type your message...",
    "chat.empty.title": "Chat Studio",
    "chat.empty.description": "Start a conversation with any AI model.",
    "code.title": "Code Builder",
    "code.placeholder": "Describe what you want to build...",
    "code.generate": "Generate Code",
    "code.generating": "Generating...",
    "code.deploy": "Deploy",
    "code.upload": "Upload screenshot",
    "agents.title": "Agent Studio",
    "agents.library": "Library",
    "agents.builder": "Builder",
    "agents.chatWith": "Chat with",
    "kb.title": "Knowledge Base",
    "kb.newBase": "New Base",
    "kb.upload": "Upload",
    "kb.chatDocs": "Chat with documents",
    "images.title": "Image Generation",
    "images.generate": "Generate Image",
    "images.generating": "Generating...",
    "billing.title": "Billing & Usage",
    "billing.usage": "Usage This Period",
    "billing.plans": "Plans",
    "billing.currentPlan": "Current Plan",
    "billing.upgrade": "Upgrade",
    "settings.title": "Settings",
    "settings.apiKeys": "API Keys",
    "settings.profile": "Profile",
    "settings.preferences": "Preferences",
    "settings.notifications": "Notifications",
  },

  fr: {
    "common.appName": "AdgenAI",
    "common.tagline": "Votre IA. Votre Studio. Vos Règles.",
    "common.getStarted": "Commencer gratuitement",
    "common.signIn": "Se connecter",
    "common.signUp": "S'inscrire",
    "common.signOut": "Se déconnecter",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.create": "Créer",
    "common.search": "Rechercher",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
    "nav.chat": "Studio Chat",
    "nav.code": "Constructeur de Code",
    "nav.agents": "Studio d'Agents",
    "nav.knowledge": "Base de Connaissances",
    "nav.images": "Génération d'Images",
    "nav.billing": "Facturation",
    "nav.settings": "Paramètres",
    "landing.hero.title": "Votre IA. Votre Studio. Vos Règles.",
    "landing.hero.subtitle": "La plateforme IA tout-en-un pour le chat, la génération de code, les agents, les bases de connaissances et la création d'images.",
    "landing.features.title": "Tout ce dont vous avez besoin dans un seul Studio IA",
    "landing.pricing.title": "Tarification simple et transparente",
    "chat.newChat": "Nouveau Chat",
    "chat.placeholder": "Tapez votre message...",
    "chat.empty.title": "Studio Chat",
    "chat.empty.description": "Commencez une conversation avec n'importe quel modèle IA.",
    "code.title": "Constructeur de Code",
    "code.placeholder": "Décrivez ce que vous voulez construire...",
    "code.generate": "Générer le Code",
    "code.generating": "Génération en cours...",
    "code.deploy": "Déployer",
    "code.upload": "Télécharger une capture d'écran",
    "agents.title": "Studio d'Agents",
    "agents.library": "Bibliothèque",
    "agents.builder": "Constructeur",
    "agents.chatWith": "Discuter avec",
    "kb.title": "Base de Connaissances",
    "kb.newBase": "Nouvelle Base",
    "kb.upload": "Télécharger",
    "kb.chatDocs": "Discuter avec vos documents",
    "images.title": "Génération d'Images",
    "images.generate": "Générer une Image",
    "images.generating": "Génération en cours...",
    "billing.title": "Facturation & Utilisation",
    "billing.usage": "Utilisation cette période",
    "billing.plans": "Plans",
    "billing.currentPlan": "Plan actuel",
    "billing.upgrade": "Mettre à niveau",
    "settings.title": "Paramètres",
    "settings.apiKeys": "Clés API",
    "settings.profile": "Profil",
    "settings.preferences": "Préférences",
    "settings.notifications": "Notifications",
  },

  es: {
    "common.appName": "AdgenAI",
    "common.tagline": "Tu IA. Tu Estudio. Tus Reglas.",
    "common.getStarted": "Comenzar gratis",
    "common.signIn": "Iniciar sesión",
    "common.signUp": "Registrarse",
    "common.signOut": "Cerrar sesión",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.create": "Crear",
    "common.search": "Buscar",
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "nav.chat": "Estudio de Chat",
    "nav.code": "Constructor de Código",
    "nav.agents": "Estudio de Agentes",
    "nav.knowledge": "Base de Conocimiento",
    "nav.images": "Generación de Imágenes",
    "nav.billing": "Facturación",
    "nav.settings": "Configuración",
    "landing.hero.title": "Tu IA. Tu Estudio. Tus Reglas.",
    "landing.hero.subtitle": "La plataforma de IA todo en uno para chat, generación de código, agentes, bases de conocimiento y creación de imágenes.",
    "landing.features.title": "Todo lo que necesitas en un solo Estudio de IA",
    "landing.pricing.title": "Precios simples y transparentes",
    "chat.newChat": "Nuevo Chat",
    "chat.placeholder": "Escribe tu mensaje...",
    "chat.empty.title": "Estudio de Chat",
    "chat.empty.description": "Inicia una conversación con cualquier modelo de IA.",
    "code.title": "Constructor de Código",
    "code.placeholder": "Describe lo que quieres construir...",
    "code.generate": "Generar Código",
    "code.generating": "Generando...",
    "code.deploy": "Desplegar",
    "code.upload": "Subir captura de pantalla",
    "agents.title": "Estudio de Agentes",
    "agents.library": "Biblioteca",
    "agents.builder": "Constructor",
    "agents.chatWith": "Chatear con",
    "kb.title": "Base de Conocimiento",
    "kb.newBase": "Nueva Base",
    "kb.upload": "Subir",
    "kb.chatDocs": "Chatear con documentos",
    "images.title": "Generación de Imágenes",
    "images.generate": "Generar Imagen",
    "images.generating": "Generando...",
    "billing.title": "Facturación y Uso",
    "billing.usage": "Uso este período",
    "billing.plans": "Planes",
    "billing.currentPlan": "Plan actual",
    "billing.upgrade": "Mejorar",
    "settings.title": "Configuración",
    "settings.apiKeys": "Claves API",
    "settings.profile": "Perfil",
    "settings.preferences": "Preferencias",
    "settings.notifications": "Notificaciones",
  },

  "pt-BR": {
    "common.appName": "AdgenAI",
    "common.tagline": "Sua IA. Seu Estúdio. Suas Regras.",
    "common.getStarted": "Começar grátis",
    "common.signIn": "Entrar",
    "common.signUp": "Cadastrar",
    "common.signOut": "Sair",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.delete": "Excluir",
    "common.edit": "Editar",
    "common.create": "Criar",
    "common.search": "Buscar",
    "common.loading": "Carregando...",
    "common.error": "Erro",
    "common.success": "Sucesso",
    "nav.chat": "Estúdio de Chat",
    "nav.code": "Construtor de Código",
    "nav.agents": "Estúdio de Agentes",
    "nav.knowledge": "Base de Conhecimento",
    "nav.images": "Geração de Imagens",
    "nav.billing": "Faturamento",
    "nav.settings": "Configurações",
    "landing.hero.title": "Sua IA. Seu Estúdio. Suas Regras.",
    "landing.hero.subtitle": "A plataforma de IA tudo-em-um para chat, geração de código, agentes, bases de conhecimento e criação de imagens.",
    "landing.features.title": "Tudo que você precisa em um só Estúdio de IA",
    "landing.pricing.title": "Preços simples e transparentes",
    "chat.newChat": "Novo Chat",
    "chat.placeholder": "Digite sua mensagem...",
    "chat.empty.title": "Estúdio de Chat",
    "chat.empty.description": "Inicie uma conversa com qualquer modelo de IA.",
    "code.title": "Construtor de Código",
    "code.placeholder": "Descreva o que você quer construir...",
    "code.generate": "Gerar Código",
    "code.generating": "Gerando...",
    "code.deploy": "Implantar",
    "code.upload": "Enviar captura de tela",
    "agents.title": "Estúdio de Agentes",
    "agents.library": "Biblioteca",
    "agents.builder": "Construtor",
    "agents.chatWith": "Conversar com",
    "kb.title": "Base de Conhecimento",
    "kb.newBase": "Nova Base",
    "kb.upload": "Enviar",
    "kb.chatDocs": "Conversar com documentos",
    "images.title": "Geração de Imagens",
    "images.generate": "Gerar Imagem",
    "images.generating": "Gerando...",
    "billing.title": "Faturamento e Uso",
    "billing.usage": "Uso neste período",
    "billing.plans": "Planos",
    "billing.currentPlan": "Plano atual",
    "billing.upgrade": "Atualizar",
    "settings.title": "Configurações",
    "settings.apiKeys": "Chaves API",
    "settings.profile": "Perfil",
    "settings.preferences": "Preferências",
    "settings.notifications": "Notificações",
  },
};

export function getTranslation(locale: Locale, key: keyof TranslationKeys): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export function useTranslations(locale: Locale = "en") {
  return {
    t: (key: keyof TranslationKeys) => getTranslation(locale, key),
    locale,
    locales: LOCALES,
  };
}

export default translations;
