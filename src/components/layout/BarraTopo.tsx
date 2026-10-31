import { useEffect, useRef, useState } from 'react'
import { MenuMobile } from '@/components/layout/MenuMobile'
import { SeletorIdioma } from '@/components/layout/SeletorIdioma'
import { useSecaoAtiva } from '@/hooks/useSecaoAtiva'
import { useIdioma } from '@/hooks/useIdioma'

/** Barra fixa rosa: links com rolagem suave, destaque da seção atual e PT | EN. */
export function BarraTopo() {
  const { c } = useIdioma()
  const itens = c.nav.itens
  const ids = itens.map((i) => i.id)
  const ativa = useSecaoAtiva(ids)
  const [menuAberto, setMenuAberto] = useState(false)
  const botaoMenu = useRef<HTMLButtonElement>(null)

  // Devolve o foco ao botão quando o menu fecha (regra 7)
  const fecharMenu = () => {
    setMenuAberto(false)
    botaoMenu.current?.focus()
  }

  // Fecha o menu se a tela virar desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const aoMudar = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuAberto(false)
    }
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])

  return (
    <>
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:rounded-pill focus:border-2 focus:border-tinta focus:bg-lima focus:px-4 focus:py-2"
      >
        {c.nav.irParaConteudo}
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-tinta bg-rosa">
        <div className="container-site flex h-[var(--nav-h)] items-center gap-3">
          <a
            href="#inicio"
            className="flex min-h-11 shrink-0 items-center font-display text-base lowercase text-tinta lg:min-h-0 lg:text-lg"
            onClick={() => setMenuAberto(false)}
          >
            {c.nav.marca}
          </a>

          {/* Barra de busca decorativa, estilo navegador */}
          <span
            aria-hidden="true"
            className="hidden min-w-0 flex-1 truncate rounded-pill border-2 border-tinta/25 bg-bege/80 px-4 py-1 text-xs text-tinta/50 lg:block"
          >
            {c.nav.buscaPlaceholder}
          </span>

          <nav aria-label={c.nav.navegacaoLabel} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {itens.map((item) => {
                const atual = ativa === item.id
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={atual ? 'true' : undefined}
                      className={`inline-block rounded-pill border-2 px-2.5 py-1 text-sm font-semibold whitespace-nowrap transition-colors lg:px-3 ${
                        atual
                          ? 'border-tinta bg-lima text-tinta'
                          : 'border-transparent text-branco hover:border-tinta hover:bg-rosa-claro hover:text-tinta'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <SeletorIdioma className="ml-auto shrink-0 lg:ml-0" />

          <button
            ref={botaoMenu}
            type="button"
            onClick={() => (menuAberto ? fecharMenu() : setMenuAberto(true))}
            aria-label={menuAberto ? c.nav.fecharMenu : c.nav.abrirMenu}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            className="alvo-toque flex shrink-0 items-center justify-center rounded-pill border-2 border-tinta bg-branco/80 lg:hidden"
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span
                className={`absolute inset-x-0 h-0.5 rounded bg-tinta transition-transform ${menuAberto ? 'top-1.5 rotate-45' : 'top-0'}`}
              />
              <span
                className={`absolute inset-x-0 top-1.5 h-0.5 rounded bg-tinta transition-opacity ${menuAberto ? 'opacity-0' : 'opacity-100'}`}
              />
              <span
                className={`absolute inset-x-0 h-0.5 rounded bg-tinta transition-transform ${menuAberto ? 'top-1.5 -rotate-45' : 'top-3'}`}
              />
            </span>
          </button>
        </div>
      </header>

      <MenuMobile aberto={menuAberto} fechar={fecharMenu} itens={itens} ativa={ativa} />
    </>
  )
}
