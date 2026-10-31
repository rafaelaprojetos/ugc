import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { SeletorIdioma } from '@/components/layout/SeletorIdioma'
import type { NavItem } from '@/content/types'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'
import { useTravaScroll } from '@/hooks/useTravaScroll'
import { useIdioma } from '@/hooks/useIdioma'

type Props = {
  aberto: boolean
  fechar: () => void
  itens: readonly NavItem[]
  ativa: string
}

/** Menu em tela cheia rosa no celular. Fecha com Esc, clique ou ao escolher a seção. */
export function MenuMobile({ aberto, fechar, itens, ativa }: Props) {
  const { c } = useIdioma()
  const menosMovimento = usePrefereMenosMovimento()
  const painel = useRef<HTMLDivElement>(null)

  useTravaScroll(aberto)

  useEffect(() => {
    if (!aberto) return

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        fechar()
        return
      }
      if (e.key !== 'Tab' || !painel.current) return

      // Prende o Tab dentro do menu (regra 7)
      const focaveis = painel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    painel.current?.querySelector<HTMLElement>('a[href]')?.focus()
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, fechar])

  return (
    <AnimatePresence>
      {aberto && (
        <m.div
          key="menu-mobile"
          id="menu-mobile"
          ref={painel}
          role="dialog"
          aria-modal="true"
          aria-label={c.nav.navegacaoLabel}
          initial={menosMovimento ? { opacity: 1 } : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={menosMovimento ? { opacity: 1 } : { opacity: 0, y: -12 }}
          transition={{ duration: menosMovimento ? 0 : 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-40 flex flex-col bg-rosa pt-[var(--nav-h)] lg:hidden"
        >
          <nav aria-label={c.nav.navegacaoLabel} className="flex-1 overflow-y-auto">
            <ul className="container-site flex flex-col gap-1 py-6">
              {itens.map((item) => {
                const atual = ativa === item.id
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={fechar}
                      aria-current={atual ? 'true' : undefined}
                      className={`flex items-baseline justify-between gap-3 rounded-janela border-2 px-4 py-3 font-display text-grande lowercase transition-colors ${
                        atual
                          ? 'border-tinta bg-lima text-tinta'
                          : 'border-transparent text-branco hover:border-tinta hover:bg-rosa-claro hover:text-tinta'
                      }`}
                    >
                      {item.label}
                      <span aria-hidden="true" className="font-sans text-[11px] tracking-normal opacity-60">
                        {item.arquivo}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="container-site flex items-center justify-between border-t-2 border-tinta/20 py-5">
            <SeletorIdioma variante="menu" />
            <button
              type="button"
              onClick={fechar}
              className="alvo-toque rounded-pill border-2 border-tinta bg-branco px-5 py-2 font-semibold"
            >
              {c.nav.fecharMenu}
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
