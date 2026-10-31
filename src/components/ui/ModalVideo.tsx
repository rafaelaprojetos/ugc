import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'
import { useIdioma } from '@/hooks/useIdioma'
import { useTravaScroll } from '@/hooks/useTravaScroll'

type Props = {
  aberto: boolean
  fechar: () => void
  src: string
  poster?: string
  /** legenda do vídeo, para quem usa leitor de tela */
  rotulo: string
}

/** Vídeo em tela cheia, com som e controles. */
export function ModalVideo({ aberto, fechar, src, poster, rotulo }: Props) {
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
      const focaveis = painel.current.querySelectorAll<HTMLElement>('button, video')
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
  }, [aberto, fechar])

  /*
   * Vai para o body num portal, e não onde o vídeo está.
   * No desktop os cards de #virais e #formatos giram (`transform: rotate`), e
   * um ancestral com transform faz `position: fixed` passar a valer para ele
   * em vez da tela — o modal virava uma caixinha dentro do card torto.
   */
  return createPortal(
    <AnimatePresence>
      {aberto && (
        <m.div
          key="modal-video"
          ref={painel}
          role="dialog"
          aria-modal="true"
          aria-label={rotulo}
          initial={menosMovimento ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={menosMovimento ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: menosMovimento ? 0 : 0.18 }}
          // h-dvh, não h-screen: no iPhone a barra do Safari entra na conta de
          // 100vh, então o vídeo passava da tela e os controles ficavam fora.
          // bg quase opaco para a barra do topo não aparecer por trás.
          className="fixed inset-0 z-80 flex h-[100dvh] w-full flex-col bg-tinta/95"
          onClick={(e) => {
            if (e.target === e.currentTarget) fechar()
          }}
        >
          {/* faixa do botão fechar, respeitando o notch do iPhone */}
          <div
            className="flex shrink-0 justify-end px-4 pb-2"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
          >
            <button
              type="button"
              onClick={fechar}
              aria-label={c.video.fecharLabel}
              className="alvo-toque flex items-center justify-center rounded-pill border-2 border-tinta bg-lima px-5 text-lg font-semibold text-tinta shadow-janela"
            >
              ✕
            </button>
          </div>

          <div
            className="flex min-h-0 flex-1 items-center justify-center px-3"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) fechar()
            }}
          >
            <video
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="max-h-full w-auto max-w-full rounded-video border-2 border-branco/20"
            >
              {c.video.semSuporte}
            </video>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
