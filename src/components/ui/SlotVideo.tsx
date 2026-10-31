import { useRef, useState } from 'react'
import { ModalVideo } from '@/components/ui/ModalVideo'
import { PlaceholderMidia } from '@/components/ui/PlaceholderMidia'
import { marcasDosVideos, slot as buscarSlot } from '@/content/media'
import { useIdioma } from '@/hooks/useIdioma'
import { usePonteiroFino } from '@/hooks/usePonteiroFino'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'
import { arquivoDoSlot, proporcoes } from '@/lib/midias'

type Props = {
  /** nome do slot, ex: "tech-video-3" */
  id: string
  /** legenda do vídeo (vem dos arquivos de conteúdo) — vira pill no rodapé */
  legenda?: string
  /** rótulo curto no topo do vídeo, ex: "29 milhões de views" */
  etiqueta?: string
  /** 'video' = 28px (padrão) · 'aba' = 32px */
  raio?: 'video' | 'aba'
  className?: string
}

const raios = { video: 'rounded-video', aba: 'rounded-aba' } as const

/**
 * Vídeo vertical 9:16 de um slot.
 * Sem arquivo → moldura listrada com o nome do slot.
 * Com arquivo → no desktop toca mudo ao passar o mouse; clique (ou toque,
 * no celular) abre em tela cheia com som e controles.
 */
export function SlotVideo({ id, legenda, etiqueta, raio = 'video', className = '' }: Props) {
  const { c } = useIdioma()
  const info = buscarSlot(id)
  const arquivo = arquivoDoSlot(id)
  const video = useRef<HTMLVideoElement>(null)
  const [aberto, setAberto] = useState(false)
  const podeHover = usePonteiroFino()
  const menosMovimento = usePrefereMenosMovimento()

  if (!info) return null

  // nome da marca: preenchido em marcasDosVideos, no media.ts
  const marca = marcasDosVideos[id]?.trim()

  /**
   * Marca e views ficam na mesma fileira no topo. Em vídeo estreito elas
   * quebram para a linha de baixo em vez de uma passar por cima da outra.
   */
  const pilulasDoTopo =
    marca || etiqueta ? (
      <span className="pointer-events-none absolute inset-x-2 top-2 z-10 flex flex-wrap justify-center gap-1">
        {marca && (
          <span className="max-w-full truncate rounded-pill border-2 border-tinta bg-branco px-2.5 py-0.5 text-[11px] font-semibold text-tinta shadow-colagem">
            {marca}
          </span>
        )}
        {etiqueta && (
          <span className="max-w-full truncate rounded-pill border-2 border-tinta bg-cinza-balao px-2.5 py-0.5 text-[11px] font-semibold text-tinta shadow-colagem">
            {etiqueta}
          </span>
        )}
      </span>
    ) : null

  if (!arquivo) {
    return (
      <div className={`relative ${className}`}>
        <PlaceholderMidia slot={info} raio={raios[raio]} />
        {pilulasDoTopo}
      </div>
    )
  }

  const descricao = [marcasDosVideos[id]?.trim(), etiqueta, legenda].filter(Boolean).join(' — ')
  const rotulo = descricao ? `${c.video.abrirLabel}: ${descricao}` : c.video.abrirLabel

  const aoEntrar = () => {
    if (!podeHover || menosMovimento) return
    const el = video.current
    if (!el) return
    el.muted = true
    void el.play().catch(() => {})
  }

  const aoSair = () => {
    const el = video.current
    if (!el) return
    el.pause()
    el.currentTime = 0
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          // para a prévia antes de abrir: dois vídeos grandes decodificando ao
          // mesmo tempo engasgam o celular
          aoSair()
          setAberto(true)
        }}
        onMouseEnter={aoEntrar}
        onMouseLeave={aoSair}
        onFocus={aoEntrar}
        onBlur={aoSair}
        aria-label={rotulo}
        className={`group relative block w-full overflow-hidden border-2 border-tinta bg-tinta/5 shadow-janela ${raios[raio]} ${proporcoes['9:16']} ${className}`}
      >
        <video
          ref={video}
          src={arquivo.src}
          poster={arquivo.poster}
          preload="none"
          muted
          loop
          playsInline
          disablePictureInPicture
          tabIndex={-1}
          // pointer-events-none: no iPhone o toque que cai no <video> faz o
          // Safari tomar conta dele (play inline com os controles nativos) e o
          // clique nunca chega no botão, então o modal não abria
          className="pointer-events-none h-full w-full object-cover"
        >
          {c.video.semSuporte}
        </video>

        {pilulasDoTopo}

        {legenda && (
          <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-pill border-2 border-tinta bg-branco/92 px-3 py-1 text-xs font-semibold text-tinta">
            {legenda}
          </span>
        )}
      </button>

      <ModalVideo
        aberto={aberto}
        fechar={() => setAberto(false)}
        src={arquivo.src}
        poster={arquivo.poster}
        rotulo={descricao || id}
      />
    </>
  )
}
