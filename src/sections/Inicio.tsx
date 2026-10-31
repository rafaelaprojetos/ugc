import { m } from 'framer-motion'
import { JanelaMac } from '@/components/ui/JanelaMac'
import { SlotFoto } from '@/components/ui/SlotFoto'
import { useIdioma } from '@/hooks/useIdioma'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'
import { conjuntoSolto, pecaSolta } from '@/lib/animacoes'

/** Selo flutuante da capa: círculo com visto + duas linhas. */
function Selo({ titulo, destaque }: { titulo: string; destaque: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-[14px] border-2 border-tinta bg-branco px-2 py-1.5 shadow-janela md:gap-2 md:px-3 md:py-2">
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-tinta bg-lima md:size-6"
      >
        <svg viewBox="0 0 24 24" className="size-3 md:size-3.5" fill="none" stroke="var(--color-tinta)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 13 4.5 4.5L19 7" />
        </svg>
      </span>
      <span className="block text-left leading-tight">
        <span className="block text-[8px] text-tinta/70 md:text-[10px]">{titulo}</span>
        <span className="block text-[10px] font-semibold text-tinta md:text-xs">{destaque}</span>
      </span>
    </span>
  )
}

/**
 * Capa: uma foto horizontal ocupando tudo, com o nome por cima, no canto.
 * O véu escuro em cima da foto é o que garante que o nome continue legível
 * seja qual for a foto que entrar no slot.
 */
export function Inicio() {
  const { c } = useIdioma()
  const s = c.secoes.inicio
  const menosMovimento = usePrefereMenosMovimento()

  const animacao = menosMovimento
    ? {}
    : { variants: conjuntoSolto, initial: 'oculto' as const, animate: 'visivel' as const }
  const peca = menosMovimento ? {} : { variants: pecaSolta }

  return (
    <section
      id="inicio"
      aria-labelledby="titulo-inicio"
      className="relative pt-6 pb-12 md:pt-10 md:pb-20"
    >
      <div className="container-site">
        <JanelaMac arquivo={s.janela} setas conteudoClassName="relative">
          <div className="relative">
            {/* 16:9 em todas as larguras, inclusive celular */}
            <SlotFoto id="capa-foto" alt={s.capaAlt} />

            {/* véu só embaixo, onde o nome fica */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-tinta/60 via-tinta/22 to-transparent"
            />

            <m.div {...animacao} className="absolute inset-0 p-3 md:p-7 lg:p-10">
              {/* selo flutuante, canto de cima à direita.
                  A animação de entrada fica aqui fora e o balanço no span de dentro:
                  na mesma camada uma apagaria a outra. */}
              <m.div {...peca} className="absolute top-3 right-3 md:top-7 md:right-7 lg:top-10 lg:right-10">
                <span className={`block ${menosMovimento ? '' : 'balanca'}`}>
                  <Selo titulo={s.selo.titulo} destaque={s.selo.destaque} />
                </span>
              </m.div>

              <div className="flex h-full flex-col items-start justify-end">
                <m.h1 {...peca} id="titulo-inicio" className="relative isolate">
                  <span className="sr-only">
                    {s.nome.primeira} {s.nome.segunda}
                  </span>
                  <span
                    aria-hidden="true"
                    className="palavra-contorno block font-display text-grande whitespace-nowrap text-lilas md:text-gigante"
                  >
                    {s.nome.primeira}
                  </span>
                  <span aria-hidden="true" className="relative isolate -mt-[0.2em] inline-block">
                    <span
                      className="absolute -inset-x-3 inset-y-[0.16em] -z-10 rounded-[8px] border-2 border-tinta bg-rosa"
                      style={{ transform: 'rotate(-2.5deg)' }}
                    />
                    <span className="palavra-contorno relative block px-2 font-display text-grande whitespace-nowrap text-lima md:text-gigante">
                      {s.nome.segunda}
                    </span>
                  </span>
                </m.h1>
              </div>
            </m.div>
          </div>
        </JanelaMac>
      </div>
    </section>
  )
}
