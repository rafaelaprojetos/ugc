import type { CorFita } from '@/content/types'

const corTexto: Record<CorFita, string> = {
  lima: 'text-lima',
  rosa: 'text-rosa',
  lilas: 'text-lilas',
  'rosa-claro': 'text-rosa-claro',
}

const corFundo: Record<CorFita, string> = {
  lima: 'bg-lima',
  rosa: 'bg-rosa',
  lilas: 'bg-lilas',
  'rosa-claro': 'bg-rosa-claro',
}

const tamanhos = {
  grande: 'text-grande',
  gigante: 'text-gigante',
  mega: 'text-mega',
} as const

/** Giro estável entre -2° e 2° a partir da própria palavra (sem aleatório). */
function giroDaPalavra(palavra: string) {
  let soma = 0
  for (const char of palavra) soma += char.codePointAt(0) ?? 0
  return ((soma % 9) - 4) / 2
}

type Props = {
  palavra: string
  corPalavra: CorFita
  corFita: CorFita
  /** h1 só no início da página; o resto é h2 */
  nivel?: 'h1' | 'h2' | 'h3' | 'span'
  tamanho?: keyof typeof tamanhos
  giro?: number
  id?: string
  className?: string
}

/**
 * Título de seção com efeito "fita adesiva": a palavra em lilás ou lima
 * sobre uma faixa retangular levemente rotacionada na cor oposta.
 * A palavra leva contorno escuro para garantir leitura (regra 7).
 */
export function FitaTitulo({
  palavra,
  corPalavra,
  corFita,
  nivel = 'h2',
  tamanho = 'gigante',
  giro,
  id,
  className = '',
}: Props) {
  const Tag = nivel
  const rotacao = giro ?? giroDaPalavra(palavra)

  return (
    <Tag id={id} className={`relative isolate inline-block max-w-full ${className}`}>
      <span
        aria-hidden="true"
        className={`absolute -inset-x-3 inset-y-[0.12em] -z-10 rounded-[6px] border-2 border-tinta ${corFundo[corFita]}`}
        style={{ transform: `rotate(${rotacao}deg)` }}
      />
      <span
        className={`palavra-contorno relative block px-2 py-[0.08em] font-display ${tamanhos[tamanho]} ${corTexto[corPalavra]} lowercase`}
      >
        {palavra}
      </span>
    </Tag>
  )
}
