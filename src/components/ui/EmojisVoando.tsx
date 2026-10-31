import type { CSSProperties } from 'react'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'

/**
 * Onde cada emoji flutua e de que tamanho.
 * Ficam na frente do conteúdo (sem capturar clique), para aparecerem de verdade.
 */
const posicoes = [
  'top-[4%] left-[5%] text-5xl md:text-7xl',
  'top-[14%] right-[6%] text-4xl md:text-6xl',
  'top-[34%] left-[2%] text-5xl md:text-8xl',
  'top-[46%] right-[3%] text-5xl md:text-7xl',
  'top-[62%] left-[7%] text-4xl md:text-6xl',
  'top-[72%] right-[8%] text-5xl md:text-8xl',
  'top-[88%] left-[4%] text-4xl md:text-7xl',
  'top-[94%] right-[5%] text-5xl md:text-6xl',
] as const

/**
 * Camada de emojis derivando pela seção.
 * Desligada em prefers-reduced-motion.
 */
export function EmojisVoando({ emojis }: { emojis: readonly string[] }) {
  const menosMovimento = usePrefereMenosMovimento()
  if (emojis.length === 0) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {posicoes.map((posicao, i) => {
        const estilo: CSSProperties = {
          ['--duracao' as string]: `${9 + ((i * 4) % 7)}s`,
          ['--atraso' as string]: `${(i * 1.3) % 5}s`,
          ['--giro' as string]: `${(i % 2 === 0 ? -1 : 1) * (8 + ((i * 5) % 14))}deg`,
        }
        return (
          <span
            key={posicao}
            style={estilo}
            className={`absolute block select-none drop-shadow-[0_6px_14px_rgba(17,17,17,0.3)] ${posicao} ${menosMovimento ? '' : 'voa'}`}
          >
            {emojis[i % emojis.length]}
          </span>
        )
      })}
    </div>
  )
}
