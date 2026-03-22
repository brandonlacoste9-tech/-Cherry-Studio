/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly MAIN_VITE_SOME_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
