import { JanelaMac } from '@/components/ui/JanelaMac'
import { Secao } from '@/components/ui/Secao'
import { SlotVideo } from '@/components/ui/SlotVideo'
import { useIdioma } from '@/hooks/useIdioma'

export function Sobre() {
  const { c } = useIdioma()
  const s = c.secoes.sobre

  return (
    <Secao id="sobre">
      <div className="fundo-ceu rounded-janela border-2 border-tinta p-4 shadow-janela md:p-6 lg:p-10">
        <div className="grid items-center gap-6 md:gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,380px)] lg:justify-center lg:gap-12">
          {/* Vídeo: aba de cantos bem arredondados dentro da moldura de janela */}
          <JanelaMac
            arquivo={s.janela}
            conteudoClassName="p-3 md:p-4"
            className="mx-auto w-full max-w-[280px] md:max-w-[320px] lg:max-w-none"
          >
            <SlotVideo id="sobre-video-1" legenda={s.videoLegenda} raio="aba" />
          </JanelaMac>

          <div>
            <p className="max-w-prose text-base leading-relaxed text-tinta md:text-lg">{s.texto}</p>

            <a
              href={s.botao.alvo}
              className="alvo-toque mt-6 inline-flex items-center justify-center rounded-pill border-2 border-tinta bg-lilas px-6 py-3 font-display text-lg lowercase text-tinta shadow-colagem transition-colors hover:bg-lima md:mt-8"
            >
              {s.botao.label}
            </a>
          </div>
        </div>
      </div>
    </Secao>
  )
}
