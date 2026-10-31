import { useState } from 'react'
import { IconeRede } from '@/components/ui/IconeRede'
import { JanelaMac } from '@/components/ui/JanelaMac'
import { Secao } from '@/components/ui/Secao'
import { links } from '@/content/media'
import { useIdioma } from '@/hooks/useIdioma'
import { usePonteiroFino } from '@/hooks/usePonteiroFino'

const corDoCard: Record<string, string> = {
  lilas: 'bg-lilas',
  lima: 'bg-lima',
  rosa: 'bg-rosa',
}

/** Monta o link do WhatsApp do sócio com a mensagem já escrita. */
function linkSocio(mensagem: string) {
  const numero = links.whatsappSocio.replace(/\D/g, '')
  if (!numero) return null
  return `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}`
}

export function Entregaveis() {
  const { c } = useIdioma()
  const s = c.secoes.entregaveis
  const podeHover = usePonteiroFino()
  // Fixado pelo clique; o hover só dá uma espiada. Um aberto por vez.
  const [fixado, setFixado] = useState<number | null>(null)
  const [sobre, setSobre] = useState<number | null>(null)

  return (
    <Secao id="entregaveis">
      <ul className="grid gap-5 lg:grid-cols-3 lg:items-start lg:gap-6">
        {s.cards.map((card, i) => {
          const aberto = fixado !== null ? fixado === i : podeHover && sobre === i
          const idConteudo = `entregavel-${i}`
          const whats = card.botao.label ? linkSocio(card.botao.mensagem) : null

          return (
            <li
              key={card.titulo}
              onPointerEnter={podeHover ? () => setSobre(i) : undefined}
              onPointerLeave={podeHover ? () => setSobre(null) : undefined}
              className={`transition-transform duration-300 ${aberto ? 'lg:-translate-y-2 lg:scale-[1.03]' : ''}`}
            >
              <JanelaMac
                arquivo={card.arquivo}
                className={aberto ? 'shadow-[0_26px_50px_-20px_rgb(17_17_17/0.55)]' : ''}
                conteudoClassName={corDoCard[card.cor] ?? 'bg-branco'}
              >
                <button
                  type="button"
                  onClick={() => setFixado(fixado === i ? null : i)}
                  aria-expanded={aberto}
                  aria-controls={idConteudo}
                  className="alvo-toque flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-5"
                >
                  <span className="font-display text-xl leading-none text-tinta md:text-2xl">
                    {card.titulo}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-2xl leading-none text-tinta transition-transform duration-300 ${aberto ? 'rotate-45' : ''}`}
                  >
                    +
                  </span>
                  <span className="sr-only">{aberto ? s.fechar : s.abrir}</span>
                </button>

                <div
                  id={idConteudo}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${aberto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-3 px-4 pb-5 md:px-5">
                      <ul className="flex flex-col gap-2">
                        {card.itens.map((item, j) => (
                          <li
                            key={item}
                            style={{ transitionDelay: aberto ? `${80 + j * 70}ms` : '0ms' }}
                            className={`rounded-janela border-2 border-tinta bg-branco/85 px-3 py-2 text-sm font-semibold text-tinta transition-all duration-300 ${
                              aberto ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                            }`}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>

                      {card.redes.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                          {card.redes.map((rede, j) => {
                            const url = links[rede.chave as keyof typeof links]
                            if (!url) return null
                            return (
                              <li
                                key={rede.chave}
                                style={{
                                  transitionDelay: aberto ? `${180 + j * 70}ms` : '0ms',
                                }}
                                className={`transition-all duration-300 ${aberto ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                              >
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="alvo-toque inline-flex items-center gap-2 rounded-pill border-2 border-tinta bg-branco px-4 py-2 text-sm font-semibold text-tinta shadow-colagem transition-colors hover:bg-lilas"
                                >
                                  <IconeRede rede={rede.chave} />
                                  {rede.nome}
                                </a>
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      {card.botao.label && (
                        <div
                          style={{ transitionDelay: aberto ? '240ms' : '0ms' }}
                          className={`transition-all duration-300 ${aberto ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                        >
                          {whats ? (
                            <a
                              href={whats}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="alvo-toque inline-flex items-center rounded-pill border-2 border-tinta bg-branco px-5 py-2 text-sm font-semibold text-tinta shadow-colagem transition-colors hover:bg-lima"
                            >
                              {card.botao.label}
                            </a>
                          ) : (
                            <span className="inline-flex items-center rounded-pill border-2 border-dashed border-tinta/50 bg-branco/60 px-5 py-2 text-sm font-semibold text-tinta/60">
                              {card.botao.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </JanelaMac>
            </li>
          )
        })}
      </ul>
    </Secao>
  )
}
