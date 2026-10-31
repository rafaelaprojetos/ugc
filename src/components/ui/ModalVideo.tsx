import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef } from 'react'
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

  return (
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
          className="fixed inset-0 z-60 flex items-center justify-center bg-tinta/85 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) fechar()
          }}
        >
          <button
            type="button"
            onClick={fechar}
            aria-label={c.video.fecharLabel}
            className="alvo-toque absolute top-4 right-4 flex items-center justify-center rounded-pill border-2 border-tinta bg-lima px-4 font-semibold"
          >
            ✕
          </button>

          <video
            src={src}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="max-h-[88vh] w-auto max-w-full rounded-video border-2 border-branco/20"
          >
            {c.video.semSuporte}
          </video>
        </m.div>
      )}
    </AnimatePresence>
  )
}
