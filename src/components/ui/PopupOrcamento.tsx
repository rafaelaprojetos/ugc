import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FormularioOrcamento } from '@/components/ui/FormularioOrcamento'
import { IconeRede } from '@/components/ui/IconeRede'
import { links } from '@/content/media'
import { useIdioma } from '@/hooks/useIdioma'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'
import { useTravaScroll } from '@/hooks/useTravaScroll'
import { linkWhatsapp } from '@/lib/contato'

/** Qualquer botão do site abre o popup disparando este evento. */
export const EVENTO_ABRIR = 'rc:abrir-orcamento'

const CHAVE_SESSAO = 'rc:orcamento-visto'
/** O popup aparece quando esta seção entra na tela. */
const SECAO_GATILHO = 'entregaveis'
/** …ou depois deste tempo de página aberta, o que vier primeiro. */
const TEMPO_ATE_ABRIR = 3 * 60 * 1000
/** De quanto em quanto tempo conferimos o relógio. */
const INTERVALO = 5000

type Canal = 'email' | 'whatsapp'

export function PopupOrcamento() {
  const { c } = useIdioma()
  const menosMovimento = usePrefereMenosMovimento()
  const [aberto, setAberto] = useState(false)
  const [jaApareceu, setJaApareceu] = useState(false)
  const [canal, setCanal] = useState<Canal>('email')
  const painel = useRef<HTMLDivElement>(null)
  const jaAbriu = useRef(false)

  useTravaScroll(aberto)

  // Abre sozinho: quando #entregaveis aparece OU depois de 3 minutos de página
  // aberta — o que vier primeiro. Uma vez por sessão.
  useEffect(() => {
    // o pedido manual vale sempre, mesmo se o popup já tiver aparecido
    const aoPedir = () => setAberto(true)
    window.addEventListener(EVENTO_ABRIR, aoPedir)

    try {
      if (sessionStorage.getItem(CHAVE_SESSAO) === '1') jaAbriu.current = true
    } catch {
      /* sessionStorage bloqueado: o popup abre uma vez por visita */
    }
    if (jaAbriu.current) {
      setJaApareceu(true)
      return () => window.removeEventListener(EVENTO_ABRIR, aoPedir)
    }

    const abrirUmaVez = () => {
      if (jaAbriu.current) return
      jaAbriu.current = true
      try {
        sessionStorage.setItem(CHAVE_SESSAO, '1')
      } catch {
        /* sem persistência, sem problema */
      }
      setJaApareceu(true)
      setAberto(true)
    }

    // 1) a seção de entregáveis entrando na tela
    const alvo = document.getElementById(SECAO_GATILHO)
    let observador: IntersectionObserver | null = null
    if (alvo) {
      const r = alvo.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) {
        queueMicrotask(abrirUmaVez)
      } else {
        observador = new IntersectionObserver(
          (entradas) => {
            if (entradas.some((e) => e.isIntersecting)) {
              observador?.disconnect()
              abrirUmaVez()
            }
          },
          { threshold: 0.08 },
        )
        observador.observe(alvo)
      }
    }

    // 2) tempo de página — só conta com a aba à vista
    let acumulado = 0
    let ultimaMarca = document.visibilityState === 'visible' ? Date.now() : 0
    const relogio = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        const agora = Date.now()
        if (ultimaMarca) acumulado += agora - ultimaMarca
        ultimaMarca = agora
      } else {
        ultimaMarca = 0
      }
      if (acumulado >= TEMPO_ATE_ABRIR) {
        window.clearInterval(relogio)
        observador?.disconnect()
        abrirUmaVez()
      }
    }, INTERVALO)

    return () => {
      observador?.disconnect()
      window.clearInterval(relogio)
      window.removeEventListener(EVENTO_ABRIR, aoPedir)
    }
  }, [])

  // Esc fecha e o Tab fica preso dentro do popup
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false)
        return
      }
      if (e.key !== 'Tab' || !painel.current) return
      const focaveis = painel.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, a[href]',
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
    painel.current?.querySelector<HTMLElement>('button')?.focus()
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  const whats = linkWhatsapp(c.popup.whatsappMensagem)
  const aba = (ativa: boolean) =>
    `alvo-toque flex-1 rounded-pill border-[3px] border-tinta px-4 py-2.5 font-display text-base lowercase transition-colors md:text-lg ${
      ativa ? 'bg-lima text-tinta' : 'bg-branco/70 text-tinta/60 hover:bg-branco'
    }`

  return (
    <>
      {/* Botão fixo: fica no canto depois que o popup já apareceu uma vez */}
      {jaApareceu && !aberto && (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="alvo-toque fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-pill border-[3px] border-tinta bg-lima px-5 py-3 font-display text-base lowercase text-tinta shadow-janela transition-transform duration-300 hover:-rotate-2 hover:scale-105 md:right-6 md:bottom-6 md:text-lg"
        >
          ✨ {c.popup.abrirDeNovo}
        </button>
      )}

      <AnimatePresence>
        {aberto && (
          <m.div
            key="popup-orcamento"
            // cartão centralizado, nunca a tela inteira: o site continua
            // aparecendo atrás para a marca ver que tem mais portfólio
            className="fixed inset-0 z-90 flex items-center justify-center bg-tinta/60 p-4 md:p-8"
            initial={menosMovimento ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={menosMovimento ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: menosMovimento ? 0 : 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setAberto(false)
            }}
          >
            <m.div
              ref={painel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-popup-orcamento"
              initial={menosMovimento ? { scale: 1 } : { scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={menosMovimento ? { scale: 1 } : { scale: 0.96, y: 20 }}
              transition={{ duration: menosMovimento ? 0 : 0.26, ease: 'easeOut' }}
              className="flex max-h-[85dvh] w-full flex-col overflow-y-auto rounded-janela border-[3px] border-tinta bg-lilas shadow-janela md:max-h-[92vh] md:max-w-3xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-2 border-tinta bg-bege px-4 py-2">
                <span aria-hidden="true" className="flex shrink-0 gap-1.5">
                  <span className="size-3 rounded-full border border-tinta/30 bg-mac-vermelho" />
                  <span className="size-3 rounded-full border border-tinta/30 bg-mac-amarelo" />
                  <span className="size-3 rounded-full border border-tinta/30 bg-mac-verde" />
                </span>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label={c.popup.fechar}
                  className="alvo-toque -my-1 flex items-center justify-center rounded-pill px-2 text-xl leading-none text-tinta"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center p-4 md:p-12">
                <h2
                  id="titulo-popup-orcamento"
                  className="palavra-contorno mb-3 font-display text-grande text-lima"
                >
                  {c.popup.titulo}
                </h2>
                <p className="mb-6 text-base leading-snug text-tinta md:text-lg">
                  {c.popup.chamada}
                </p>

                {/* A marca escolhe por onde quer falar */}
                <fieldset className="mb-5">
                  <legend className="mb-2 text-sm font-semibold text-tinta">
                    {c.popup.escolha}
                  </legend>
                  <div role="tablist" className="flex gap-2">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={canal === 'email'}
                      onClick={() => setCanal('email')}
                      className={aba(canal === 'email')}
                    >
                      {c.popup.opcaoEmail}
                    </button>
                    {whats && (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={canal === 'whatsapp'}
                        onClick={() => setCanal('whatsapp')}
                        className={aba(canal === 'whatsapp')}
                      >
                        {c.popup.opcaoWhatsapp}
                      </button>
                    )}
                  </div>
                </fieldset>

                {canal === 'email' || !whats ? (
                  <FormularioOrcamento />
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-base text-tinta md:text-lg">{c.popup.whatsappChamada}</p>
                    <a
                      href={whats}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="alvo-toque inline-flex w-full items-center justify-center gap-2 rounded-pill border-[3px] border-tinta bg-lima px-6 py-3 font-display text-lg lowercase text-tinta shadow-colagem transition-transform duration-300 hover:-rotate-1 hover:scale-[1.02]"
                    >
                      💬 {c.popup.whatsappBotao}
                    </a>
                    <ul className="flex flex-wrap gap-2">
                      {c.rodape.redes.map((rede) => {
                        const url = links[rede.chave as keyof typeof links]
                        if (!url) return null
                        return (
                          <li key={rede.chave}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="alvo-toque inline-flex items-center gap-2 rounded-pill border-2 border-tinta bg-branco px-4 py-2 text-sm font-semibold text-tinta"
                            >
                              <IconeRede rede={rede.chave} />
                              {rede.nome}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
