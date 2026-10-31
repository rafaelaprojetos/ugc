type Props = { rede: string; className?: string }

/**
 * Ícones simplificados das redes, desenhados em traço para combinar com o site.
 * Não são os logos oficiais — se quiser os originais, dá para trocar por arquivo.
 */
export function IconeRede({ rede, className = 'size-5' }: Props) {
  const traco = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (rede === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...traco}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (rede === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...traco}>
        <rect x="2" y="5" width="20" height="14" rx="4.5" />
        <path d="M10.5 9.2v5.6l4.6-2.8z" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (rede === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...traco}>
        <path d="M14 3.5v10.9a3.6 3.6 0 1 1-3-3.55" />
        <path d="M14 3.5c.5 2.3 2 3.8 4.4 4.1" />
      </svg>
    )
  }

  return null
}
