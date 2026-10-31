import { PlaceholderMidia } from '@/components/ui/PlaceholderMidia'
import { slot as buscarSlot, logosQuePreenchem } from '@/content/media'
import { arquivoDoSlot } from '@/lib/midias'

type Props = {
  /** nome do slot, ex: "logo-bioderma" */
  id: string
  /** nome da marca, para o alt (vem dos arquivos de conteúdo) */
  alt: string
  className?: string
}

/** Logo de marca, sempre em círculo. */
export function SlotLogo({ id, alt, className = '' }: Props) {
  const info = buscarSlot(id)
  const arquivo = arquivoDoSlot(id)

  if (!info) return null
  if (!arquivo)
    return (
      <PlaceholderMidia
        slot={info}
        rotulo={info.id.replace('logo-', '')}
        compacto
        className={className}
      />
    )

  // Logo com fundo próprio preenche o círculo; os recortados respiram no rosa.
  const preenche = logosQuePreenchem.includes(id.replace('logo-', ''))

  return (
    <span
      className={`flex aspect-square items-center justify-center overflow-hidden rounded-full border border-tinta/15 bg-rosa-claro shadow-janela ${preenche ? '' : 'p-[18%]'} ${className}`}
    >
      <img
        src={arquivo.src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={preenche ? 'h-full w-full object-cover' : 'max-h-full max-w-full object-contain'}
      />
    </span>
  )
}
