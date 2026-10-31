import { PlaceholderMidia } from '@/components/ui/PlaceholderMidia'
import { slot as buscarSlot } from '@/content/media'
import { arquivoDoSlot, proporcoes } from '@/lib/midias'

type Props = {
  /** nome do slot, ex: "capa-foto-2" */
  id: string
  /** alt da imagem (vem dos arquivos de conteúdo) */
  alt: string
  /** proporção própria, quando a do slot não serve nesse lugar */
  proporcao?: string
  className?: string
}

/** Foto de um slot. Sem arquivo, mostra a moldura listrada no tamanho certo. */
export function SlotFoto({ id, alt, proporcao, className = '' }: Props) {
  const info = buscarSlot(id)
  const arquivo = arquivoDoSlot(id)

  if (!info) return null
  if (!arquivo) return <PlaceholderMidia slot={info} proporcao={proporcao} className={className} />

  return (
    <img
      src={arquivo.src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover ${proporcao ?? proporcoes[info.formato]} ${className}`}
    />
  )
}
