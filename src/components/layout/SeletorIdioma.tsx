import type { Idioma } from '@/content/types'
import { useIdioma } from '@/hooks/useIdioma'

const opcoes: { valor: Idioma; label: string }[] = [
  { valor: 'pt', label: 'PT' },
  { valor: 'en', label: 'EN' },
]

type Props = {
  /** 'barra' = compacto no topo | 'menu' = maior dentro do menu mobile */
  variante?: 'barra' | 'menu'
  className?: string
}

/** Seletor PT | EN. Já preparado para o prompt 8. */
export function SeletorIdioma({ variante = 'barra', className = '' }: Props) {
  const { idioma, trocarIdioma, c } = useIdioma()
  const grande = variante === 'menu'

  return (
    <div
      role="group"
      aria-label={c.nav.idiomaLabel}
      className={`inline-flex items-center overflow-hidden rounded-pill border-2 border-tinta bg-branco/80 ${className}`}
    >
      {opcoes.map((opcao, i) => {
        const ativo = idioma === opcao.valor
        return (
          <button
            key={opcao.valor}
            type="button"
            lang={opcao.valor}
            onClick={() => trocarIdioma(opcao.valor)}
            aria-pressed={ativo}
            aria-label={`${c.nav.idiomaLabel}: ${opcao.label}`}
            className={`font-semibold transition-colors ${grande ? 'min-h-11 px-5 py-2 text-base' : 'min-h-11 min-w-11 px-3 text-sm lg:min-h-0 lg:min-w-0 lg:py-1'} ${
              i > 0 ? 'border-l-2 border-tinta' : ''
            } ${ativo ? 'bg-lima text-tinta' : 'text-tinta/60 hover:bg-lima/40 hover:text-tinta'}`}
          >
            {opcao.label}
          </button>
        )
      })}
    </div>
  )
}
