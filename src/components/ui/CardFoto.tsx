import { JanelaMac } from '@/components/ui/JanelaMac'
import { SlotFoto } from '@/components/ui/SlotFoto'

type Props = {
  /** nome do slot, ex: "capa-foto-1" */
  id: string
  /** alt obrigatório */
  alt: string
  /** nome de arquivo mostrado no topo do card, ex: "slay.png" */
  arquivo?: string
  giro?: number
  className?: string
}

/** Foto dentro de uma janela, com o nome do arquivo no topo. */
export function CardFoto({ id, alt, arquivo, giro = 0, className = '' }: Props) {
  return (
    <JanelaMac arquivo={arquivo} giro={giro} compacta className={className}>
      <SlotFoto id={id} alt={alt} />
    </JanelaMac>
  )
}
