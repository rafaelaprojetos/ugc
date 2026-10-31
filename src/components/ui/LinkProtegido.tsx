import type { ReactNode } from 'react'

type Props = {
  /** função que monta o href em tempo de execução, a partir de pedaços */
  montarHref: () => string | null
  children: ReactNode
  className?: string
  /** links externos levam rel="noopener noreferrer" */
  externo?: boolean
  'aria-label'?: string
}

/**
 * Link de contato montado em tempo de execução.
 *
 * O site é renderizado no navegador: o HTML que sai do servidor tem só
 * <div id="root">. Somando isso ao endereço montado em pedaços por
 * src/lib/contato.ts, o e-mail e o WhatsApp não existem como texto em
 * nenhum arquivo servido — robôs que varrem HTML não acham nada.
 */
export function LinkProtegido({
  montarHref,
  children,
  className = '',
  externo = false,
  'aria-label': rotulo,
}: Props) {
  const href = montarHref()

  if (!href) {
    return (
      <span className={className} aria-label={rotulo}>
        {children}
      </span>
    )
  }

  return (
    <a
      href={href}
      className={className}
      aria-label={rotulo}
      {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
