import type { ReactNode } from 'react'

const cores = {
  lima: 'bg-lima',
  rosa: 'bg-rosa',
  'rosa-claro': 'bg-rosa-claro',
  lilas: 'bg-lilas',
  branco: 'bg-branco',
  bege: 'bg-bege',
} as const

type Props = {
  children: ReactNode
  cor?: keyof typeof cores
  className?: string
}

/** Etiqueta arredondada (pill) para rótulos, ex: "12 milhões de views". */
export function Etiqueta({ children, cor = 'lima', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border-2 border-tinta px-3 py-1 text-sm font-semibold text-tinta shadow-colagem ${cores[cor]} ${className}`}
    >
      {children}
    </span>
  )
}
