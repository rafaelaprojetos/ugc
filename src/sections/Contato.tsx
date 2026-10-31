import { IconeRede } from '@/components/ui/IconeRede'
import { LinkProtegido } from '@/components/ui/LinkProtegido'
import { EVENTO_ABRIR } from '@/components/ui/PopupOrcamento'
import { Secao } from '@/components/ui/Secao'
import { links } from '@/content/media'
import { useIdioma } from '@/hooks/useIdioma'
import { linkEmail, linkWhatsapp } from '@/lib/contato'

const cartao =
  'alvo-toque group flex w-full items-center gap-4 rounded-janela border-[3px] border-tinta px-5 py-4 shadow-janela transition-transform duration-300 lg:hover:-translate-y-1 lg:hover:rotate-[-1deg] lg:hover:scale-[1.02]'

function Seta() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="ml-auto size-6 shrink-0 transition-transform duration-300 lg:group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

export function Contato() {
  const { c } = useIdioma()
  const s = c.secoes.contato

  return (
    <Secao id="contato">
      <div className="rounded-janela border-[3px] border-tinta bg-rosa p-4 shadow-janela md:p-8 lg:p-12">
        <div className="mx-auto max-w-2xl">
          <div>
            <h3 className="palavra-contorno mb-5 font-display text-grande text-lima md:mb-7">
              {s.direto.titulo}
            </h3>

            <ul className="flex flex-col gap-3">
              {links.email && (
                <li>
                  <LinkProtegido
                    montarHref={() => linkEmail(s.direto.assuntoEmail)}
                    className={`${cartao} bg-branco`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-tinta bg-lima text-xl"
                    >
                      ✉️
                    </span>
                    <span className="block min-w-0 text-left">
                      <span className="block text-xs font-semibold text-tinta/70">
                        {s.direto.emailLabel}
                      </span>
                      <span className="block font-display text-lg text-tinta">
                        {s.direto.emailChamada}
                      </span>
                    </span>
                    <Seta />
                  </LinkProtegido>
                </li>
              )}

              {links.whatsapp && (
                <li>
                  <LinkProtegido
                    montarHref={() => linkWhatsapp()}
                    externo
                    className={`${cartao} bg-lima`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-tinta bg-branco text-xl"
                    >
                      💬
                    </span>
                    <span className="block min-w-0 text-left">
                      <span className="block text-xs font-semibold text-tinta/70">
                        {s.direto.whatsappLabel}
                      </span>
                      <span className="block font-display text-lg text-tinta">
                        {s.direto.whatsappChamada}
                      </span>
                    </span>
                    <Seta />
                  </LinkProtegido>
                </li>
              )}

              {/* abre o popup, onde a marca escolhe e-mail ou WhatsApp */}
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent(EVENTO_ABRIR))}
                  className={`${cartao} bg-lilas`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-tinta bg-branco text-xl"
                  >
                    ✨
                  </span>
                  <span className="block min-w-0 text-left">
                    <span className="block text-xs font-semibold text-tinta/70">
                      {s.direto.orcamentoLabel}
                    </span>
                    <span className="block font-display text-lg text-tinta">
                      {s.direto.orcamentoChamada}
                    </span>
                  </span>
                  <Seta />
                </button>
              </li>
            </ul>

            <ul className="mt-5 flex flex-wrap gap-2">
              {c.rodape.redes.map((rede) => {
                const url = links[rede.chave as keyof typeof links]
                if (!url) return null
                return (
                  <li key={rede.chave}>
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
          </div>

        </div>
      </div>
    </Secao>
  )
}
