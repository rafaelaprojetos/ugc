import { PlaceholderMidia } from '@/components/ui/PlaceholderMidia'
import { slot as buscarSlot } from '@/content/media'
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

  return (
    <span
      className={`flex aspect-square items-center justify-center overflow-hidden rounded-full border border-tinta/15 bg-branco p-[18%] shadow-janela ${className}`}
    >
      <img
        src={arquivo.src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="max-h-full max-w-full object-contain"
      />
    </span>
  )
}
