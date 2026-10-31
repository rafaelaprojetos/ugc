import type { CSSProperties } from 'react'
import type { Slot } from '@/content/media'
import { proporcoes } from '@/lib/midias'

const cores: Record<Slot['tipo'], CSSProperties> = {
  video: { '--faixa-a': 'var(--color-rosa-claro)', '--faixa-b': 'var(--color-lilas)' } as CSSProperties,
  foto: { '--faixa-a': 'var(--color-lima)', '--faixa-b': 'var(--color-rosa-claro)' } as CSSProperties,
  logo: { '--faixa-a': 'var(--color-bege)', '--faixa-b': 'var(--color-rosa-claro)' } as CSSProperties,
  sticker: { '--faixa-a': 'var(--color-lilas)', '--faixa-b': 'var(--color-lima)' } as CSSProperties,
}

const arredondamento: Record<Slot['formato'], string> = {
  '9:16': 'rounded-video',
  '4:5': 'rounded-janela',
  '16:9': 'rounded-janela',
  '1:1': 'rounded-janela',
  circulo: 'rounded-full',
}

/**
 * Moldura que ocupa exatamente o espaço da mídia que ainda não chegou,
 * com o nome do slot escrito no meio para você saber qual arquivo vai ali.
 */
export function PlaceholderMidia({
  slot,
  raio,
  rotulo,
  compacto = false,
  proporcao,
  className = '',
}: {
  slot: Slot
  /** classe de arredondamento, quando o padrão do formato não serve */
  raio?: string
  /** texto curto, para molduras pequenas demais para o nome inteiro */
  rotulo?: string
  /** moldura pequena: aperta o rótulo para caber */
  compacto?: boolean
  /** proporção própria, quando a do slot não serve nesse lugar */
  proporcao?: string
  className?: string
}) {
  return (
    <div
      style={cores[slot.tipo]}
      className={`listrado flex items-center justify-center border-2 border-dashed border-tinta/45 ${proporcao ?? proporcoes[slot.formato]} ${raio ?? arredondamento[slot.formato]} ${className}`}
    >
      <span className={`max-w-[92%] rounded-pill border-2 border-tinta bg-branco/92 text-center leading-tight font-semibold break-words hyphens-none text-tinta ${compacto ? "px-1 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px] md:text-xs"}`}>
        {rotulo ?? slot.id}
      </span>
    </div>
  )
}
