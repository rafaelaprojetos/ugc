/**
 * CONTEÚDO EMBUTIDO NO HTML
 *
 * No build de arquivo único (`npm run arquivo-unico`), os textos e os links vão
 * para dentro do próprio index.html, num bloco legível perto do começo. Isso
 * deixa editar o site abrindo o arquivo num editor de texto, sem precisar de
 * projeto, git ou terminal.
 *
 * Se o bloco não existir (build normal) ou estiver com erro de digitação, o
 * site usa o conteúdo de sempre — nunca quebra por causa disso.
 */
export type Embutido = {
  pt?: unknown
  en?: unknown
  links?: Record<string, string>
}

/**
 * Tipo mínimo do documento: este arquivo também é lido pelos scripts em Node,
 * onde a biblioteca do DOM não existe.
 */
type DocumentoMinimo = {
  getElementById(id: string): { textContent: string | null } | null
}

function ler(): Embutido {
  const doc = (globalThis as { document?: DocumentoMinimo }).document
  if (!doc) return {}
  const texto = doc.getElementById('rc-conteudo')?.textContent?.trim()
  if (!texto) return {}
  try {
    return JSON.parse(texto) as Embutido
  } catch {
    // JSON quebrado: segue com o conteúdo original em vez de derrubar o site
    console.warn('[rc] bloco de conteúdo com erro de digitação — usando o original')
    return {}
  }
}

export const embutido = ler()
