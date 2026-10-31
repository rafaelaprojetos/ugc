import type { ReactNode } from 'react'
import { EmojisVoando } from '@/components/ui/EmojisVoando'
import { Secao } from '@/components/ui/Secao'
import { SlotVideo } from '@/components/ui/SlotVideo'
import { quantosCases } from '@/content/media'
import { useIdioma } from '@/hooks/useIdioma'

const fundoBalao: Record<string, string> = {
  lilas: 'bg-lilas',
  rosa: 'bg-rosa',
  lima: 'bg-lima',
  offwhite: 'bg-offwhite',
}

const textoBalao: Record<string, string> = {
  lima: 'text-lima',
  branco: 'text-branco',
  rosa: 'text-rosa',
  lilas: 'text-lilas',
}

/** Cor de fundo de cada mini-card de métrica. O resto fica branco. */
const corMetrica: Record<string, string> = {
  gasto: 'bg-gasto',
  receita: 'bg-receita',
  roas: 'bg-roas',
}

/** Ordem em que as métricas aparecem. Vazias não entram. */
const ordemMetricas = ['gasto', 'receita', 'roas', 'vendas', 'views', 'instalacoes'] as const

/** Card escuro estilo print de gerenciador de anúncios. */
function MolduraDashboard({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-janela border-2 border-tinta bg-painel shadow-janela">
      <div className="flex items-center gap-2 border-b border-branco/15 px-3 py-2">
        <span aria-hidden="true" className="flex shrink-0 gap-1">
          <span className="size-2 rounded-full bg-mac-vermelho" />
          <span className="size-2 rounded-full bg-mac-amarelo" />
          <span className="size-2 rounded-full bg-mac-verde" />
        </span>
        <span className="truncate text-[10px] text-branco/70 md:text-xs">{rotulo}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

/** Mockup de anúncio patrocinado: cabeçalho com a marca e o selo. */
function MolduraAnuncio({
  marca,
  patrocinado,
  children,
}: {
  marca: string
  patrocinado: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-janela border-2 border-tinta bg-branco shadow-janela">
      <div className="flex items-center gap-2 border-b-2 border-tinta px-3 py-2">
        <span aria-hidden="true" className="size-7 shrink-0 rounded-full border-2 border-tinta bg-lilas" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-tinta">{marca}</span>
          <span className="block text-[11px] text-tinta/70">{patrocinado}</span>
        </span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

export function Cases() {
  const { c } = useIdioma()
  const s = c.secoes.cases
  const rotulos: Record<string, string> = s.rotulos

  return (
    <Secao id="cases">
      <EmojisVoando emojis={s.emojis} />

      <ul className="relative z-10 flex flex-col gap-8 md:gap-12">
        {s.lista.slice(0, quantosCases).map((caso, i) => {
          const metricas = ordemMetricas
            .map((chave) => ({ chave, valor: (caso.metricas as Record<string, string>)[chave] }))
            .filter((m) => m.valor)
          // Cases ímpares invertem: o balão troca de lado
          const invertido = i % 2 === 1

          const video = <SlotVideo id={`case-${i + 1}-video`} raio="aba" />

          return (
            <li
              key={i}
              className="fundo-ceu rounded-janela border-2 border-tinta p-4 shadow-janela md:p-6 lg:p-8"
            >
              <div
                className={`flex flex-col gap-6 lg:items-center lg:gap-10 ${
                  invertido ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                <div className="mx-auto w-full max-w-[260px] lg:mx-0 lg:w-[300px] lg:shrink-0">
                  {caso.moldura === 'anuncio' ? (
                    <MolduraAnuncio marca={caso.marca} patrocinado={s.patrocinado}>
                      {video}
                    </MolduraAnuncio>
                  ) : (
                    <MolduraDashboard rotulo={s.painelRotulo}>{video}</MolduraDashboard>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  {caso.marca && caso.moldura !== 'anuncio' && (
                    <span className="w-fit rounded-pill border-2 border-tinta bg-branco px-4 py-1 text-sm font-semibold">
                      {caso.marca}
                    </span>
                  )}

                  {caso.resultado && (
                    <p
                      className={`palavra-contorno rounded-[2.25rem] border-2 border-tinta px-5 py-4 font-display text-xl leading-tight shadow-janela md:px-7 md:py-6 md:text-3xl ${
                        fundoBalao[caso.balao.cor] ?? 'bg-branco'
                      } ${textoBalao[caso.balao.corTexto] ?? 'text-tinta'}`}
                    >
                      {caso.resultado}
                    </p>
                  )}

                  {metricas.length > 0 && (
                    <dl className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                      {metricas.map((m) => (
                        <div
                          key={m.chave}
                          className={`rounded-janela border-2 border-tinta px-3 py-2 shadow-colagem ${
                            corMetrica[m.chave] ?? 'bg-branco'
                          }`}
                        >
                          <dt className="text-[11px] font-semibold text-tinta/65">
                            {rotulos[m.chave] ?? m.chave}
                          </dt>
                          <dd className="font-display text-lg leading-tight text-tinta md:text-xl">
                            {m.valor}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {caso.link && (
                    <a
                      href={caso.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="alvo-toque inline-flex w-fit items-center rounded-pill border-2 border-tinta bg-lilas px-6 py-2 font-display text-lg lowercase text-tinta shadow-colagem transition-colors hover:bg-lima"
                    >
                      {s.verCase}
                    </a>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Secao>
  )
}
