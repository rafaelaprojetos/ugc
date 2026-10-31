type Props = {
  /** rótulo da pasta (vem dos arquivos de conteúdo) */
  rotulo?: string
  giro?: number
  className?: string
}

/** Pasta decorativa rosa-claro, estilo ícone de desktop. */
export function Pasta({ rotulo, giro = -3, className = '' }: Props) {
  return (
    <div
      className={`inline-flex w-full flex-col items-center gap-1 ${className}`}
      style={{ transform: `rotate(${giro}deg)` }}
    >
      <svg
        viewBox="0 0 96 76"
        className="w-full drop-shadow-[0_6px_0_rgba(17,17,17,0.18)]"
        role="img"
        aria-hidden={rotulo ? undefined : 'true'}
        aria-label={rotulo}
      >
        <path
          d="M4 16a8 8 0 0 1 8-8h22l8 8h42a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H12a8 8 0 0 1-8-8z"
          fill="var(--color-rosa-claro)"
          stroke="var(--color-tinta)"
          strokeWidth="3"
        />
        <path d="M4 28h88" stroke="var(--color-tinta)" strokeWidth="3" opacity="0.35" />
      </svg>
      {rotulo && <span className="text-xs font-semibold text-tinta/80">{rotulo}</span>}
    </div>
  )
}
