/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_0X_API_KEY: string
  readonly VITE_MONAD_RPC_URL: string
  readonly VITE_MONAD_CHAIN_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
