import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  rotuloAnterior: string
  rotuloProximo: string
  rotulo: string
}

/** Carrossel lateral com setas de passar, para quem prefere clicar a arrastar. */
export function CarrosselSetas({ children, rotuloAnterior, rotuloProximo, rotulo }: Props) {
  const trilho = useRef<HTMLUListElement>(null)

  const passar = useCallback((direcao: 1 | -1) => {
    const el = trilho.current
    if (!el) return
    const primeiro = el.querySelector('li')
    const passo = primeiro ? primeiro.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: passo * direcao, behavior: 'smooth' })
  }, [])

  const seta =
    'alvo-toque flex items-center justify-center rounded-full border-2 border-tinta bg-branco text-tinta shadow-colagem transition-colors hover:bg-lima'

  return (
    <div className="relative">
      <ul
        ref={trilho}
        aria-label={rotulo}
        className="carrossel -mx-[var(--gutter)] gap-4 px-[var(--gutter)] md:mx-0 md:px-0"
      >
        {children}
      </ul>

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => passar(-1)} aria-label={rotuloAnterior} className={seta}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <button type="button" onClick={() => passar(1)} aria-label={rotuloProximo} className={seta}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
