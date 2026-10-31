import { CarrosselSetas } from '@/components/ui/CarrosselSetas'
import { FitaTitulo } from '@/components/ui/FitaTitulo'
import { GradeVideosQueSobem } from '@/components/ui/GradeVideosQueSobem'
import { Secao } from '@/components/ui/Secao'
import { SlotVideo } from '@/components/ui/SlotVideo'
import { subformatos } from '@/content/media'
import type { CorFita } from '@/content/types'
import { useEntrouNaTela } from '@/hooks/useEntrouNaTela'
import { useIdioma } from '@/hooks/useIdioma'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'

/**
 * Uma pasta de subformato. Chega fechada — só a aba aparece, empilhada nas
 * vizinhas como arquivo em gaveta. Quando a seção entra na tela, as pastas
 * abrem em cascata e se separam, cada uma mostrando os 4 vídeos.
 */
function PastaSubformato({
  pasta,
  quantos,
  nome,
  ordem,
  aberta,
}: {
  pasta: string
  quantos: number
  nome: string
  ordem: number
  aberta: boolean
}) {
  const id = `subformato-${pasta}`
  const atraso = ordem * 140

  return (
    <li
      style={{
        transitionDelay: `${atraso}ms`,
        // escadinha horizontal das abas, como pastas numa gaveta
        ['--recuo' as string]: `${(ordem % 4) * 1.75}rem`,
      }}
      className={`flex flex-col transition-all duration-500 ease-out ${
        aberta ? 'mt-0' : '-mt-1.5 first:mt-0'
      }`}
    >
      <h3
        id={id}
        className="aba-pasta palavra-contorno w-fit bg-rosa-claro px-5 py-1.5 font-display text-2xl whitespace-nowrap text-lima transition-transform duration-300 hover:-translate-y-1 hover:scale-105 md:px-7 md:text-4xl"
        style={{ marginLeft: 'calc(0.75rem + var(--recuo))' }}
      >
        {nome}
      </h3>

      {/* o corpo da pasta: fechado tem altura zero, aberto cresce */}
      <div
        style={{ transitionDelay: `${atraso}ms` }}
        className={`grid transition-[grid-template-rows] duration-700 ease-out ${
          aberta ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul
            aria-labelledby={id}
            className="carrossel -mx-4 gap-3 rounded-janela rounded-tl-none border-[3px] border-tinta bg-rosa-claro/35 px-4 py-4 md:mx-0 md:grid md:snap-none md:grid-cols-4 md:gap-4 md:overflow-visible md:px-5 md:py-5"
          >
            {Array.from({ length: quantos }, (_, i) => (
              <li
                key={i}
                style={{ transitionDelay: aberta ? `${atraso + 180 + i * 80}ms` : '0ms' }}
                className={`carrossel-item w-[62vw] max-w-[260px] transition-all duration-500 ease-out md:w-auto md:max-w-none lg:hover:z-20 lg:hover:-translate-y-3 ${
                  aberta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <SlotVideo id={`${pasta}-video-${i + 1}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}

export function Formatos() {
  const { c } = useIdioma()
  const s = c.secoes.formatos
  const nomes: Record<string, string> = s.subformatos
  // um gatilho só para a gaveta inteira: as pastas abrem em cascata
  const { ref: gaveta, entrou } = useEntrouNaTela<HTMLDivElement>(0.1)
  const menosMovimento = usePrefereMenosMovimento()
  const abertas = entrou || menosMovimento

  return (
    <Secao id="formatos">
      <div className="flex flex-col gap-10 md:gap-14">
        {/* tech encosta no canto do título "formatos" — no celular fica à direita,
            senão cobre a palavra inteira */}
        <div className="relative z-10 -mt-12 md:-mt-24 lg:-mt-28">
          <FitaTitulo
            palavra={s.tech.fita.palavra}
            corPalavra={s.tech.fita.corPalavra as CorFita}
            corFita={s.tech.fita.corFita as CorFita}
            nivel="h3"
            tamanho="gigante"
            className="ml-[50%] mb-6 origin-bottom-left transition-transform duration-300 hover:-rotate-3 hover:scale-110 md:ml-[32%] md:mb-8"
          />
          <GradeVideosQueSobem prefixo="tech" quantos={8} />
        </div>

        {/* Subformatos — a gaveta de pastas */}
        <div
          ref={gaveta}
          className="rounded-janela border-2 border-tinta bg-rosa p-4 shadow-janela md:p-6 lg:p-8"
        >
          <ul
            className={`flex flex-col transition-all duration-500 ease-out ${
              abertas ? 'gap-8 md:gap-10' : 'gap-0'
            }`}
          >
            {subformatos.map((sub, i) => (
              <PastaSubformato
                key={sub.pasta}
                pasta={sub.pasta}
                quantos={sub.quantos}
                nome={nomes[sub.pasta] ?? sub.pasta}
                ordem={i}
                aberta={abertas}
              />
            ))}
          </ul>
        </div>

        {/* Viagens: passa de lado, com setas */}
        <div>
          <FitaTitulo
            palavra={s.viagens.fita.palavra}
            corPalavra={s.viagens.fita.corPalavra as CorFita}
            corFita={s.viagens.fita.corFita as CorFita}
            nivel="h3"
            tamanho="gigante"
            className="mb-6 origin-bottom-left transition-transform duration-300 hover:rotate-3 hover:scale-110 md:mb-8"
          />
          <CarrosselSetas
            rotulo={s.viagens.fita.palavra}
            rotuloAnterior={s.viagens.anterior}
            rotuloProximo={s.viagens.proximo}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <li
                key={i}
                className="carrossel-item w-[62vw] max-w-[260px] transition-transform duration-300 md:w-[31%] lg:w-[23%] lg:hover:-translate-y-3 lg:hover:scale-105"
              >
                <SlotVideo id={`viagens-video-${i + 1}`} />
              </li>
            ))}
          </CarrosselSetas>
        </div>
      </div>
    </Secao>
  )
}
