/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Chave pública do Web3Forms — destinatário do formulário de orçamento */
  readonly VITE_WEB3FORMS_KEY?: string
  /** Sitekey do hCaptcha invisível (opcional) */
  readonly VITE_HCAPTCHA_SITEKEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
