import type { ReactNode } from 'react'

/** Coração azul do balão. */
function CoracaoAzul() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0 md:size-5">
      <path
        d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.7c0 5-7.5 9.6-7.5 9.6Z"
        fill="var(--color-azul-coracao)"
        stroke="var(--color-tinta)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type Props = {
  children: ReactNode
  /** de que lado fica o rabinho do balão */
  rabo?: 'esquerda' | 'direita'
  className?: string
}

/** Balão de fala cinza claro com um coração azul. */
export function BalaoFala({ children, rabo = 'esquerda', className = '' }: Props) {
  return (
    <span
      className={`relative inline-flex items-center gap-2 rounded-[20px] border-2 border-tinta bg-cinza-balao px-3 py-1.5 text-sm font-semibold text-tinta shadow-colagem md:px-4 md:py-2 md:text-base ${className}`}
    >
      {children}
      <CoracaoAzul />
      <span
        aria-hidden="true"
        className={`absolute -bottom-[7px] size-3 rotate-45 border-r-2 border-b-2 border-tinta bg-cinza-balao ${
          rabo === 'esquerda' ? 'left-5' : 'right-5'
        }`}
      />
    </span>
  )
}
