/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Chave pública do Web3Forms — destinatário do formulário de orçamento */
  readonly VITE_WEB3FORMS_KEY?: string
  /** Sitekey do hCaptcha invisível (opcional) */
  readonly VITE_HCAPTCHA_SITEKEY?: string
  /** '1' no build de arquivo único (um index.html com tudo dentro) */
  readonly VITE_ARQUIVO_UNICO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
