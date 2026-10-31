import type { ReactNode } from 'react'

type Props = {
  /** nome de arquivo mostrado na barra de busca, ex: "formatos.psd" */
  arquivo?: string
  children?: ReactNode
  className?: string
  conteudoClassName?: string
  /** leve rotação de colagem */
  giro?: number
  /** mostra as setas de voltar/avançar, estilo navegador */
  setas?: boolean
  /** barra menor, para cards pequenos onde o nome do arquivo não caberia */
  compacta?: boolean
}

/** Janela estilo macOS: barra bege, 3 bolinhas e barra de busca. */
export function JanelaMac({
  arquivo,
  children,
  className = '',
  conteudoClassName = '',
  giro = 0,
  setas = false,
  compacta = false,
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-janela border-2 border-tinta bg-branco shadow-janela ${className}`}
      style={giro ? { transform: `rotate(${giro}deg)` } : undefined}
    >
      <div
        className={`flex items-center border-b-2 border-tinta bg-bege ${compacta ? 'gap-1.5 px-2 py-1.5' : 'gap-2 px-3 py-2'}`}
      >
        <span aria-hidden="true" className={`flex shrink-0 ${compacta ? 'gap-1' : 'gap-1.5'}`}>
          <span className={`${compacta ? 'size-2' : 'size-3'} rounded-full border border-tinta/30 bg-mac-vermelho`} />
          <span className={`${compacta ? 'size-2' : 'size-3'} rounded-full border border-tinta/30 bg-mac-amarelo`} />
          <span className={`${compacta ? 'size-2' : 'size-3'} rounded-full border border-tinta/30 bg-mac-verde`} />
        </span>
        {setas && (
          <span aria-hidden="true" className="flex shrink-0 gap-1 text-tinta/40">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5 8 12l7 7" />
            </svg>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        )}
        {arquivo ? (
          <span
            className={`min-w-0 flex-1 truncate rounded-pill border border-tinta/25 bg-branco/70 text-center text-tinta/70 ${
              compacta ? 'px-1.5 text-[10px]' : 'px-3 py-0.5 text-[11px] md:text-xs'
            }`}
          >
            {arquivo}
          </span>
        ) : (
          <span className="flex-1" />
        )}
      </div>
      <div className={conteudoClassName}>{children}</div>
    </div>
  )
}
