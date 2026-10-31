import { PlaceholderMidia } from '@/components/ui/PlaceholderMidia'
import { slots } from '@/content/media'
import { arquivoDoSlot, caminhoEsperado, extensoesAceitas, proporcoes } from '@/lib/midias'

/**
 * Página de conferência das mídias — só existe em desenvolvimento.
 * Como nunca vai ao ar, os textos ficam aqui mesmo, sem passar pelo pt/en.json.
 */
export function PaginaSlots() {
  const grupos = [...new Set(slots.map((s) => s.grupo))]
  const preenchidos = slots.filter((s) => arquivoDoSlot(s.id)).length
  const vazios = slots.length - preenchidos

  return (
    <div className="min-h-screen bg-bege">
      <header className="sticky top-0 z-10 border-b-2 border-tinta bg-rosa">
        <div className="container-site flex flex-wrap items-center gap-3 py-3">
          <h1 className="font-display text-xl lowercase text-branco">slots de mídia</h1>
          <span className="rounded-pill border-2 border-tinta bg-lima px-3 py-1 text-sm font-semibold">
            {preenchidos} com arquivo
          </span>
          <span className="rounded-pill border-2 border-tinta bg-branco px-3 py-1 text-sm font-semibold">
            {vazios} vazios
          </span>
          <a
            href="/pt"
            className="ml-auto rounded-pill border-2 border-tinta bg-branco px-4 py-1 text-sm font-semibold"
          >
            voltar ao site
          </a>
        </div>
      </header>

      <main className="container-site py-8">
        <p className="mb-8 max-w-prose text-sm text-tinta/70">
          Salve o arquivo com o nome exato do slot, na pasta indicada. Depois rode{' '}
          <code className="rounded bg-branco px-1.5 py-0.5 font-mono text-xs">
            npm run midias -- --processar
          </code>
          . O site troca sozinho — esta página nunca vai para o ar.
        </p>

        {grupos.map((grupo) => {
          const doGrupo = slots.filter((s) => s.grupo === grupo)
          const prontos = doGrupo.filter((s) => arquivoDoSlot(s.id)).length

          return (
            <section key={grupo} className="mb-10">
              <h2 className="mb-4 flex items-baseline gap-3 font-display text-2xl lowercase">
                {grupo}
                <span className="font-sans text-sm font-semibold text-tinta/50">
                  {prontos}/{doGrupo.length}
                </span>
              </h2>

              <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {doGrupo.map((s) => {
                  const arquivo = arquivoDoSlot(s.id)
                  return (
                    <li
                      key={s.id}
                      className="overflow-hidden rounded-janela border-2 border-tinta bg-branco"
                    >
                      <div className="p-2">
                        {arquivo ? (
                          s.tipo === 'video' ? (
                            <video
                              src={arquivo.src}
                              poster={arquivo.poster}
                              preload="none"
                              muted
                              playsInline
                              controls
                              className={`w-full rounded-video object-cover ${proporcoes['9:16']}`}
                            />
                          ) : (
                            <img
                              src={arquivo.src}
                              alt={s.id}
                              loading="lazy"
                              className={`w-full object-contain ${proporcoes[s.formato]}`}
                            />
                          )
                        ) : (
                          <PlaceholderMidia slot={s} />
                        )}
                      </div>

                      <div className="border-t-2 border-tinta/15 p-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold break-all">
                          <span aria-hidden="true">{arquivo ? '✓' : '○'}</span>
                          {s.id}
                        </p>
                        <p className="mt-1 font-mono text-[10px] leading-snug break-all text-tinta/55">
                          {arquivo ? arquivo.src : caminhoEsperado(s)}
                        </p>
                        {!arquivo && (
                          <p className="mt-0.5 font-mono text-[10px] text-tinta/40">
                            {extensoesAceitas(s)}
                          </p>
                        )}
                        {arquivo?.foraDoLugar && (
                          <p className="mt-1 rounded border border-tinta px-1 text-[10px] font-semibold">
                            fora da pasta: era {caminhoEsperado(s)}
                          </p>
                        )}
                        {s.tipo === 'video' && arquivo && !arquivo.poster && (
                          <p className="mt-1 rounded border border-tinta px-1 text-[10px] font-semibold">
                            sem poster — rode npm run midias -- --processar
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </main>
    </div>
  )
}
